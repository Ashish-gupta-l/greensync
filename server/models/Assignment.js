const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deadline:    { type: Date, required: true },
    maxMarks:    { type: Number, default: 100 },
    attachments: [{ url: String, name: String }], // teacher-provided resources
    allowResubmit: { type: Boolean, default: true },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);
