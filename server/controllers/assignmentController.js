const Assignment = require('../models/Assignment');
const Subject = require('../models/Subject');
const Submission = require('../models/Submission');

// GET /api/assignments?subjectId=
const getAssignments = async (req, res) => {
  try {
    const { subjectId } = req.query;
    let query = { isActive: true };

    if (subjectId) {
      query.subject = subjectId;
    } else if (req.user.role === 'teacher') {
      // Teachers see all assignments across all subjects
    } else if (req.user.role === 'student') {
      // Students see all active assignments (not filtered by enrollment)
    }

    const assignments = await Assignment.find(query)
      .populate('subject', 'name code colorIndex')
      .populate('createdBy', 'name')
      .sort({ deadline: 1 });

    // For students, attach submission status
    if (req.user.role === 'student') {
      const submissions = await Submission.find({ student: req.user._id })
        .select('assignment status marks');
      const subMap = {};
      submissions.forEach(s => { subMap[s.assignment.toString()] = s; });

      const enriched = assignments.map(a => ({
        ...a.toObject(),
        submissionStatus: subMap[a._id.toString()]?.status || 'pending',
        marks: subMap[a._id.toString()]?.marks ?? null,
        submissionId: subMap[a._id.toString()]?._id || null,
      }));
      return res.json({ success: true, assignments: enriched });
    }

    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/assignments/:id
const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('subject', 'name code colorIndex')
      .populate('createdBy', 'name email');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/assignments  (teacher)
const createAssignment = async (req, res) => {
  try {
    const { title, description, deadline, maxMarks, allowResubmit } = req.body;
    // Accept both 'subjectId' (frontend) and 'subject' (direct API)
    const subjectId = req.body.subjectId || req.body.subject;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    // Any teacher can create assignments for any subject

    const assignment = await Assignment.create({
      title, description,
      subject: subject._id,
      createdBy: req.user._id,
      deadline,
      maxMarks: maxMarks || 100,
      allowResubmit: allowResubmit !== false,
    });

    await assignment.populate('subject', 'name code');
    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/assignments/:id
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found or unauthorized' });
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/assignments/:id
const deleteAssignment = async (req, res) => {
  try {
    await Assignment.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { isActive: false }
    );
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment };
