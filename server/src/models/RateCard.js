const mongoose = require('mongoose');

const rateCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    orderType: {
      type: String,
      enum: ['B2C', 'B2B'],
      required: true,
    },
    zoneCode: {
      type: String,
      required: true,
      uppercase: true,
    }, // e.g. "ZONE_A", "ZONE_B", "ZONE_C", "ZONE_D"
    baseWeightKg: {
      type: Number,
      required: true,
      default: 0.5, // e.g. 0.5 kg for B2C, 5.0 kg for B2B
    },
    baseRate: {
      type: Number,
      required: true,
      default: 40, // Base price in INR
    },
    perAdditionalKgRate: {
      type: Number,
      required: true,
      default: 25, // INR per incremental kg
    },
    codFeePercent: {
      type: Number,
      default: 2.0, // 2% of COD invoice
    },
    codFeeMin: {
      type: Number,
      default: 30, // Minimum COD handling surcharge
    },
    fuelSurchargePercent: {
      type: Number,
      default: 5.0, // 5% of freight
    },
    gstPercent: {
      type: Number,
      default: 18.0, // 18% GST
    },
    volumetricDivisor: {
      type: Number,
      default: 5000, // Standard divisor: (L x W x H) / 5000
    },
    minBillableWeightKg: {
      type: Number,
      default: 0.5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RateCard', rateCardSchema);
