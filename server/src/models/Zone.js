const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    }, // e.g. "ZONE_A", "ZONE_B", "ZONE_C", "ZONE_D"
    name: {
      type: String,
      required: true,
    }, // e.g. "Intra-City Hyperlocal", "Regional Express", "Metro-to-Metro", "National Rest-of-Country"
    type: {
      type: String,
      enum: ['LOCAL', 'REGIONAL', 'METRO', 'NATIONAL'],
      default: 'LOCAL',
    },
    description: {
      type: String,
      default: '',
    },
    pincodePrefixes: [
      {
        type: String,
        trim: true,
      },
    ], // e.g. ["5600", "5601"] for Bengaluru local, ["4000", "4001"] for Mumbai
    maxDistanceKm: {
      type: Number,
      default: 50,
    },
    estimatedDeliveryHours: {
      type: Number,
      default: 24,
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

module.exports = mongoose.model('Zone', zoneSchema);
