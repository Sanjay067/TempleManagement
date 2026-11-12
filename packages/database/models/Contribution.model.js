const mongoose = require('mongoose');

let contracts;
try {
  contracts = require('@temple/contracts');
} catch {
  contracts = require('../../../contracts');
}
const { PaymentStatus, PaymentMode } = contracts;

const ContributionSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    paymentMode: {
      type: String,
      enum: Object.values(PaymentMode),
      default: PaymentMode.UPI
    },
    paymentProofUrl: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    },
    isOffline: {
      type: Boolean,
      default: false
    },
    recordedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verifiedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    },
    isFraudulent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast history queries and financial reports
ContributionSchema.index({ memberId: 1, createdAt: -1 });
ContributionSchema.index({ eventId: 1, status: 1 });
ContributionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.Contribution || mongoose.model('Contribution', ContributionSchema);
