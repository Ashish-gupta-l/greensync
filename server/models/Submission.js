const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
  fileUrl:     { type: String, required: true },
  publicId:    { type: String, required: true },
  fileName:    { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  version:     { type: Number, required: true },
});

const SubmissionSchema = new mongoose.Schema(
  {
    student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    subject:    { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },

    // Current file
    fileUrl:          { type: String, required: true },
    publicId:         { type: String, required: true },
    originalFileName: { type: String, required: true },
    renamedFileName:  { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'submitted', 'late', 'graded', 'returned'],
      default: 'submitted',
    },

    marks:    { type: Number, default: null },
    feedback: { type: String, default: '' },

    version:          { type: Number, default: 1 },
    previousVersions: [VersionSchema],

    plagiarismScore: { type: Number, default: 0 }, // 0–100
    extractedText:   { type: String, default: '', select: false },

    submittedAt: { type: Date, default: Date.now },
    gradedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound index: one submission per student per assignment (upsert on resubmit handled in controller)
SubmissionSchema.index({ student: 1, assignment: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
