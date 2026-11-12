const mongoose = require('mongoose');

const DarshanSettingsSchema = new mongoose.Schema(
  {
    dailyKaryakrams: [
      {
        time: { type: String, required: true },
        title: { type: String, required: true },
        details: { type: String, default: '' }
      }
    ],
    poojaTimings: {
      type: String,
      required: true
    },
    openingHours: {
      type: String,
      required: true
    },
    closingHours: {
      type: String,
      required: true
    },
    generalInfo: {
      type: String,
      default: ''
    },
    updatedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.DarshanSettings || mongoose.model('DarshanSettings', DarshanSettingsSchema);

