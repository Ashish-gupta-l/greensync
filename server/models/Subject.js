const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    code:    { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    colorIndex: { type: Number, default: 0, min: 0, max: 5 }, // for card gradient
    teacher:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);
