const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    recipient: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    type: {
      type: String,
      enum: ['EMAIL', 'SMS', 'IN_APP'],
      required: true,
    },
    event: {
      type: String,
      enum: [
        'ORDER_CREATED',
        'AGENT_ASSIGNED',
        'OUT_FOR_DELIVERY',
        'DELIVERY_FAILED',
        'RESCHEDULE_CONFIRMED',
        'ORDER_DELIVERED',
        'SYSTEM_ALERT',
      ],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['SENT', 'SIMULATED', 'FAILED', 'READ'],
      default: 'SENT',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
