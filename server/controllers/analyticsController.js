const Submission  = require('../models/Submission');
const User        = require('../models/User');
const Subject     = require('../models/Subject');
const Assignment  = require('../models/Assignment');
const { calculateEcoImpact } = require('../utils/ecoCalculator');

// GET /api/analytics/eco
const getEcoAnalytics = async (req, res) => {
  try {
    const totalSubmissions = await Submission.countDocuments();
    const gradedSubmissions = await Submission.countDocuments({ status: { $in: ['graded', 'returned'] } });
    const pendingSubmissions = await Submission.countDocuments({ status: { $in: ['submitted', 'late'] } });

    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    const totalSubjects  = await Subject.countDocuments({ isActive: true });
    const totalAssignments = await Assignment.countDocuments({ isActive: true });

    const eco = calculateEcoImpact(totalSubmissions);

    // Monthly submission trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Submission.aggregate([
      { $match: { submittedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: '$submittedAt' },
            month: { $month: '$submittedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Per-subject submission count
    const subjectData = await Submission.aggregate([
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignment',
          foreignField: '_id',
          as: 'assignmentData',
        },
      },
      { $unwind: '$assignmentData' },
      {
        $lookup: {
          from: 'subjects',
          localField: 'assignmentData.subject',
          foreignField: '_id',
          as: 'subjectData',
        },
      },
      { $unwind: '$subjectData' },
      {
        $group: {
          _id: '$subjectData._id',
          name: { $first: '$subjectData.name' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      stats: {
        totalSubmissions,
        gradedSubmissions,
        pendingSubmissions,
        totalStudents,
        totalTeachers,
        totalSubjects,
        totalAssignments,
      },
      eco,
      monthlyData,
      subjectData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEcoAnalytics };
