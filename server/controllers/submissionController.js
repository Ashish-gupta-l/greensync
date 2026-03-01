const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../middleware/upload');
const { checkPlagiarism } = require('../utils/plagiarism');
const archiver = require('archiver');
const https = require('https');
const http = require('http');

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
    res.json({ success: true, submissions });
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
    res.json({ success: true, submission });
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

module.exports = { createSubmission, getMySubmissions, getSubmissions, getSubmission, gradeSubmission, bulkDownload };
