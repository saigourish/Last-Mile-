const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupAddress: {
      street: { type: String, required: true },
      area: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      contactPerson: { type: String, required: true },
      contactPhone: { type: String, required: true },
      coordinates: {
        lat: { type: Number, default: 12.9716 },
        lng: { type: Number, default: 77.5946 },
      },
    },
    dropAddress: {
      street: { type: String, required: true },
      area: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      contactPerson: { type: String, required: true },
      contactPhone: { type: String, required: true },
      coordinates: {
        lat: { type: Number, default: 12.9352 },
        lng: { type: Number, default: 77.6245 },
      },
    },
    packageDetails: {
      lengthCm: { type: Number, required: true },
      widthCm: { type: Number, required: true },
      heightCm: { type: Number, required: true },
      actualWeightKg: { type: Number, required: true },
      volumetricWeightKg: { type: Number, required: true },
      chargeableWeightKg: { type: Number, required: true },
      category: {
        type: String,
        enum: ['Electronics', 'Apparel', 'Documents', 'Healthcare', 'Industrial', 'Perishable', 'General'],
        default: 'General',
      },
      description: { type: String, default: '' },
      isFragile: { type: Boolean, default: false },
    },
    orderType: {
      type: String,
      enum: ['B2C', 'B2B'],
      default: 'B2C',
    },
    paymentMethod: {
      type: String,
      enum: ['PREPAID', 'COD'],
      default: 'PREPAID',
    },
    declaredValue: {
      type: Number,
      default: 500,
    },
    zoneCode: {
      type: String,
      default: 'ZONE_A',
    },
    pricingBreakdown: {
      baseRate: { type: Number, required: true },
      additionalWeightKg: { type: Number, default: 0 },
      weightCharge: { type: Number, default: 0 },
      codSurcharge: { type: Number, default: 0 },
      fuelSurcharge: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      formula: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: [
        'ORDER_CREATED',
        'AGENT_ASSIGNED',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'FAILED',
        'RESCHEDULED',
        'CANCELLED',
      ],
      default: 'ORDER_CREATED',
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    antigravityAssignmentScore: {
      type: Number,
      default: 0,
    },
    deliveryAttempts: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
      enum: [
        '',
        'CUSTOMER_UNAVAILABLE',
        'INCORRECT_ADDRESS',
        'CASH_NOT_READY',
        'CUSTOMER_REFUSED',
        'ACCESS_RESTRICTED',
        'WEATHER_ANOMALY',
        'OTP_VERIFICATION_FAILED',
        'OTHER',
      ],
      default: '',
    },
    failureNotes: {
      type: String,
      default: '',
    },
    rescheduleDetails: {
      rescheduledDate: { type: Date },
      timeSlot: { type: String }, // e.g. "09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"
      requestedAt: { type: Date },
      notes: { type: String, default: '' },
    },
    deliveryOtp: {
      type: String,
      default: () => Math.floor(100000 + Math.random() * 900000).toString(),
    },
    slaDeadline: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
