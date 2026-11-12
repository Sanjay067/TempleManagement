const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    profilePhotoUrl: {
      type: String,
      default: null
    },
    passwordHash: {
      type: String,
      required: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    emailVerificationExpires: {
      type: Date,
      default: null
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    fakePaymentCount: {
      type: Number,
      default: 0
    },
    hasRedBorder: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Partial unique index: mobile and email are unique only among active accounts
// This allows deleted members to reuse their mobile or email upon registering a fresh account.
MemberSchema.index(
  { mobileNumber: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

MemberSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.models.Member || mongoose.model('Member', MemberSchema);

