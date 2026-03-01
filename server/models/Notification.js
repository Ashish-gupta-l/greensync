const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type:    {
      type: String,
      enum: ['graded', 'returned', 'deadline', 'announcement', 'submission'],
      default: 'announcement',
    },
    link:  { type: String, default: '' },
    read:  { type: Boolean, default: false },
    icon:  { type: String, default: '🔔' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
