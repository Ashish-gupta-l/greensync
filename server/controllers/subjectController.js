const Subject = require('../models/Subject');
const User = require('../models/User');

// GET /api/subjects  (filtered by role)
const getSubjects = async (req, res) => {
  try {
    let subjects;
    if (req.user.role === 'admin') {
      subjects = await Subject.find({ isActive: true })
        .populate('teacher', 'name email')
        .populate('students', 'name email rollNumber');
    } else if (req.user.role === 'teacher') {
      // Teachers see ALL subjects so they can create assignments for any subject
      subjects = await Subject.find({ isActive: true })
        .populate('teacher', 'name email')
        .populate('students', 'name email rollNumber');
    } else {
      subjects = await Subject.find({ students: req.user._id, isActive: true })
        .populate('teacher', 'name email');
    }
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/subjects/:id
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email rollNumber');
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/subjects  (admin only)
const createSubject = async (req, res) => {
  try {
    const { name, code, description, colorIndex } = req.body;
    const subject = await Subject.create({ name, code, description, colorIndex });
    res.status(201).json({ success: true, subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Subject deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/subjects/:id/assign-teacher
const assignTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { teacher: teacherId },
      { new: true }
    ).populate('teacher', 'name email');

    // Also add subject to teacher's subjects array
    await User.findByIdAndUpdate(teacherId, { $addToSet: { subjects: subject._id } });

    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/subjects/:id/enroll
const enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: studentId } },
      { new: true }
    );
    await User.findByIdAndUpdate(studentId, { $addToSet: { subjects: subject._id } });
    res.json({ success: true, message: 'Student enrolled', subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/subjects/:id/unenroll
const unenrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    await Subject.findByIdAndUpdate(req.params.id, { $pull: { students: studentId } });
    await User.findByIdAndUpdate(studentId, { $pull: { subjects: req.params.id } });
    res.json({ success: true, message: 'Student unenrolled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSubjects, getSubject, createSubject, updateSubject, deleteSubject, assignTeacher, enrollStudent, unenrollStudent };
