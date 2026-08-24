const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'on_delivery', 'offline', 'break'],
      default: 'available',
    },
    vehicleType: {
      type: String,
      enum: ['electric_bike', 'motorcycle', 'delivery_van', 'cargo_truck', 'drone'],
      default: 'motorcycle',
    },
    maxCapacityKg: {
      type: Number,
      default: 25, // default 25kg for 2-wheelers, 150kg for vans
    },
    currentLoadKg: {
      type: Number,
      default: 0,
    },
    currentLocation: {
      city: { type: String, default: 'Bengaluru' },
      area: { type: String, default: 'Koramangala' },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      lastUpdated: { type: Date, default: Date.now },
    },
    operatingZone: {
      type: String,
      default: 'Zone A',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1.0,
      max: 5.0,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    successfulDeliveries: {
      type: Number,
      default: 0,
    },
    failedDeliveries: {
      type: Number,
      default: 0,
    },
    activeOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    antigravityIndex: {
      type: Number,
      default: 95, // 0-100 orbital dispatch lift score rating
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for remaining capacity
agentSchema.virtual('remainingCapacityKg').get(function () {
  return Math.max(0, this.maxCapacityKg - this.currentLoadKg);
});

module.exports = mongoose.model('Agent', agentSchema);
