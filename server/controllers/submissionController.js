const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload');
const { checkPlagiarism } = require('../utils/plagiarism');
const archiver = require('archiver');
const https = require('https');
const http = require('http');

// Generate a Cloudinary delivery URL for a PDF.
// Uses 'image' resource_type because Cloudinary classifies PDFs uploaded
// with resource_type:'auto' as 'image', not 'raw'.
const getCloudinaryPdfUrl = (publicId) => {
  try {
    return cloudinary.url(publicId, {
      resource_type: 'image',
      secure: true,
      format: 'pdf',
    });
  } catch {
    return null;
  }
};

// Helper: emit socket notification
const emitNotification = (io, userId, notification) => {
  if (io) io.to(userId.toString()).emit('notification:new', notification);
};

// POST /api/submissions  (student uploads PDF)
const createSubmission = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'PDF file is required' });

    const { assignmentId, renamedFileName } = req.body;
    const assignment = await Assignment.findById(assignmentId).populate('subject', 'name');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    // Auto-generate filename: StudentName_Subject_AssignmentTitle.pdf
    const safeName = (str) => str.replace(/[^a-zA-Z0-9]/g, '_');
    const autoName = `${safeName(req.user.name)}_${safeName(assignment.subject.name)}_${safeName(assignment.title)}.pdf`;
    const finalFileName = renamedFileName?.trim()
      ? (renamedFileName.endsWith('.pdf') ? renamedFileName : renamedFileName + '.pdf')
      : autoName;

    // Determine late status
    const isLate = new Date() > new Date(assignment.deadline);

    // Check if resubmission
    const existing = await Submission.findOne({ student: req.user._id, assignment: assignmentId }).select('+extractedText');

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, finalFileName);

    let submission;
    if (existing) {
      // Version control: push current to history
      existing.previousVersions.push({
        fileUrl: existing.fileUrl,
        publicId: existing.publicId,
        fileName: existing.renamedFileName,
        submittedAt: existing.submittedAt,
        version: existing.version,
      });
      existing.fileUrl = result.secure_url;
      existing.publicId = result.public_id;
      existing.originalFileName = req.file.originalname;
      existing.renamedFileName = finalFileName;
      existing.version += 1;
      existing.status = isLate ? 'late' : 'submitted';
      existing.submittedAt = new Date();
      await existing.save();
      submission = existing;
    } else {
      submission = await Submission.create({
        student: req.user._id,
        assignment: assignmentId,
        subject: assignment.subject._id,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        originalFileName: req.file.originalname,
        renamedFileName: finalFileName,
        status: isLate ? 'late' : 'submitted',
        submittedAt: new Date(),
      });
    }

    // Run plagiarism check asynchronously
    checkPlagiarism(submission._id, req.file.buffer, assignmentId).catch(console.error);

    await submission.populate('assignment', 'title subject');
    res.status(201).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/submissions/my  (student's own)
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate({ path: 'assignment', populate: { path: 'subject', select: 'name code colorIndex' } })
      .sort({ submittedAt: -1 });
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/submissions?assignmentId=   (teacher view)
const getSubmissions = async (req, res) => {
  try {
    const { assignmentId, subjectId } = req.query;
    let query = {};
    if (assignmentId) query.assignment = assignmentId;
    if (subjectId) query.subject = subjectId;

    const submissions = await Submission.find(query)
      .populate('student', 'name email rollNumber avatar')
      .populate({ path: 'assignment', select: 'title maxMarks deadline subject', populate: { path: 'subject', select: 'name code' } })
      .sort({ submittedAt: -1 });

    // Use the stored fileUrl (public Cloudinary URL) directly.
    // Only regenerate if fileUrl is missing but publicId exists.
    const withUrls = submissions.map(s => {
      const obj = s.toObject();
      if (!obj.fileUrl && obj.publicId) {
        const url = getCloudinaryPdfUrl(obj.publicId);
        if (url) obj.fileUrl = url;
      }
      return obj;
    });

    res.json({ success: true, submissions: withUrls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/submissions/:id
const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student', 'name email rollNumber avatar')
      .populate({ path: 'assignment', populate: { path: 'subject', select: 'name code' } });
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    // Use stored public fileUrl. Regenerate from publicId only if missing.
    const sub = submission.toObject();
    if (!sub.fileUrl && sub.publicId) {
      const url = getCloudinaryPdfUrl(sub.publicId);
      if (url) sub.fileUrl = url;
    }

    res.json({ success: true, submission: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/submissions/:id/grade  (teacher)
const gradeSubmission = async (req, res) => {
  try {
    const { marks, feedback, status } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { marks, feedback, status: status || 'graded', gradedAt: new Date() },
      { new: true }
    ).populate('student', 'name').populate('assignment', 'title');

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    // Create notification for student
    const notif = await Notification.create({
      user: submission.student._id,
      message: `Your submission for "${submission.assignment.title}" has been graded. Marks: ${marks}`,
      type: 'graded',
      link: `/student/submissions`,
      icon: '🎯',
    });

    // Emit via socket
    const io = req.app.get('io');
    emitNotification(io, submission.student._id, notif);

    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/submissions/download/:assignmentId  (teacher - bulk ZIP)
const bulkDownload = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name');

    if (!submissions.length) {
      return res.status(404).json({ success: false, message: 'No submissions found' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="submissions_${req.params.assignmentId}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => { throw err; });
    archive.pipe(res);

    const downloadFile = (url) => {
      return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (response) => {
          resolve(response);
        }).on('error', reject);
      });
    };

    for (const sub of submissions) {
      try {
        const stream = await downloadFile(sub.fileUrl);
        archive.append(stream, { name: sub.renamedFileName || `${sub.student.name}.pdf` });
      } catch (e) {
        console.error(`Failed to download ${sub.fileUrl}:`, e.message);
      }
    }

    await archive.finalize();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/submissions/:id/file  (proxy PDF to browser)
// Supports token via Authorization header OR ?token= query param (for <a> new-tab opens)
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: HTTP GET that follows redirects (up to 5 hops)
const fetchUrl = (url, maxRedirects = 5) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location && maxRedirects > 0) {
        response.resume();
        return resolve(fetchUrl(response.headers.location, maxRedirects - 1));
      }
      if (response.statusCode >= 200 && response.statusCode < 300) {
        resolve(response);
      } else {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
};

const serveFile = async (req, res) => {
  try {
    // Authenticate: check header first, then query param
    let token = req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : req.query.token;

    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id');
      if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    } catch {
      return res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    // Build URL list — 'raw' first (files uploaded as resource_type:'raw')
    const urlsToTry = [];
    if (submission.fileUrl) urlsToTry.push(submission.fileUrl);
    if (submission.publicId) {
      const pid = submission.publicId;
      urlsToTry.push(cloudinary.url(pid, { resource_type: 'raw', secure: true }));
      urlsToTry.push(cloudinary.url(pid, { resource_type: 'raw', secure: true, format: 'pdf' }));
      urlsToTry.push(cloudinary.url(pid, { resource_type: 'image', secure: true, format: 'pdf' }));
      urlsToTry.push(cloudinary.url(pid, { resource_type: 'image', secure: true }));
    }

    const uniqueUrls = [...new Set(urlsToTry.filter(Boolean))];

    let pdfStream = null;
    for (const url of uniqueUrls) {
      try {
        pdfStream = await fetchUrl(url);
        console.log(`[serveFile] OK: ${url}`);
        break;
      } catch (err) {
        console.log(`[serveFile] FAIL ${url}: ${err.message}`);
        continue;
      }
    }

    if (!pdfStream) {
      return res.status(404).json({ success: false, message: 'PDF file not found on storage' });
    }

    const fileName = submission.renamedFileName || submission.originalFileName || 'submission.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    pdfStream.pipe(res);
  } catch (error) {
    console.error('[serveFile] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/submissions/:id  (teacher or admin)
const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    // Delete file from Cloudinary if publicId exists
    if (submission.publicId) {
      try {
        await cloudinary.uploader.destroy(submission.publicId, { resource_type: 'image' });
      } catch (e) {
        // Try raw resource_type as fallback
        try { await cloudinary.uploader.destroy(submission.publicId, { resource_type: 'raw' }); } catch (_) { }
      }
      // Also delete previous versions
      for (const v of (submission.previousVersions || [])) {
        if (v.publicId) {
          try { await cloudinary.uploader.destroy(v.publicId, { resource_type: 'image' }); } catch (_) { }
        }
      }
    }

    await Submission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSubmission, getMySubmissions, getSubmissions, getSubmission, gradeSubmission, bulkDownload, serveFile, deleteSubmission };

