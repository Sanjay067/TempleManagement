const mongoose = require('mongoose');

let contracts;
try {
  contracts = require('@temple/contracts');
} catch {
  contracts = require('../../../contracts');
}
const { TargetAudience } = contracts;

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    targetAudience: {
      type: String,
      enum: Object.values(TargetAudience),
      default: TargetAudience.ALL
    },
    targetMemberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
      }
    ],
    expiryDate: {
      type: Date,
      required: true,
      index: true
    },
    createdByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
