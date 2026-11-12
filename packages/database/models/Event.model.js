const mongoose = require('mongoose');

let contracts;
try {
  contracts = require('@temple/contracts');
} catch {
  contracts = require('../../../contracts');
}
const { EventStatus } = contracts;

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    eventDateTime: {
      type: Date,
      required: true
    },
    expiryTime: {
      type: Date,
      required: true
    },
    images: {
      type: [String],
      default: []
    },
    isContributionRequired: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.UPCOMING
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

EventSchema.index({ status: 1, eventDateTime: 1 });
EventSchema.index({ status: 1, cancelledAt: 1 });

module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);
