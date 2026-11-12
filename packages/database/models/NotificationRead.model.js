const mongoose = require('mongoose');

const NotificationReadSchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
      required: true
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

NotificationReadSchema.index({ notificationId: 1, memberId: 1 }, { unique: true });

module.exports = mongoose.models.NotificationRead || mongoose.model('NotificationRead', NotificationReadSchema);

