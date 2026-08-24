const mongoose = require('mongoose');

const trackingLogSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    trackingNumber: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
    },
    actorName: {
      type: String,
      default: 'Antigravity Dispatch System',
    },
    actorRole: {
      type: String,
      enum: ['SYSTEM', 'ADMIN', 'AGENT', 'CUSTOMER'],
      default: 'SYSTEM',
    },
    location: {
      city: { type: String, default: 'Bengaluru' },
      area: { type: String, default: '' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false, // We use immutable timestamp field
  }
);

module.exports = mongoose.model('TrackingLog', trackingLogSchema);
