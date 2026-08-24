const mongoose = require('mongoose');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Zone = require('../models/Zone');
const RateCard = require('../models/RateCard');
const Order = require('../models/Order');
const TrackingLog = require('../models/TrackingLog');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    console.log('🌱 Checking / Seeding Initial Gourish Logistics Data...');

    // Clear existing collections
    await User.deleteMany({});
    await Agent.deleteMany({});
    await Zone.deleteMany({});
    await RateCard.deleteMany({});
    await Order.deleteMany({});
    await TrackingLog.deleteMany({});
    await Notification.deleteMany({});

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'admin@gourish.logistics',
      password: 'password123',
      role: 'admin',
      phone: '+91 98001 11222',
      companyName: 'Gourish Quantum Logistics HQ',
      address: { street: '100 Orbital Way', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
    });

    const agentUser1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.agent@gourish.logistics',
      password: 'password123',
      role: 'agent',
      phone: '+91 98450 12345',
      address: { street: 'Indiranagar 100ft Rd', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
    });

    const agentUser2 = await User.create({
      name: 'Sneha Patel',
      email: 'sneha.agent@gourish.logistics',
      password: 'password123',
      role: 'agent',
      phone: '+91 98451 23456',
      address: { street: 'Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
    });

    const agentUser3 = await User.create({
      name: 'Vikram Rao',
      email: 'vikram.agent@gourish.logistics',
      password: 'password123',
      role: 'agent',
      phone: '+91 98452 34567',
      address: { street: 'HSR Layout Sector 1', city: 'Bengaluru', state: 'Karnataka', pincode: '560102' },
    });

    const agentUser4 = await User.create({
      name: 'Arun Kumar',
      email: 'arun.agent@gourish.logistics',
      password: 'password123',
      role: 'agent',
      phone: '+91 98453 45678',
      address: { street: 'Whitefield Main Rd', city: 'Bengaluru', state: 'Karnataka', pincode: '560066' },
    });

    const customerUser1 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.customer@gourish.logistics',
      password: 'password123',
      role: 'customer',
      phone: '+91 99110 55443',
      companyName: 'NexGen Electronics Retail',
      address: { street: 'Residency Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560025' },
    });

    const customerUser2 = await User.create({
      name: 'Rohit Verma',
      email: 'rohit.customer@gourish.logistics',
      password: 'password123',
      role: 'customer',
      phone: '+91 99111 66554',
      companyName: 'Verma BioTech Labs',
      address: { street: 'MG Road Metro Hub', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
    });

    console.log('✅ Users Created (Admin, 4 Agents, 2 Customers)');

    // 2. Create Agents
    const agent1 = await Agent.create({
      user: agentUser1._id,
      name: 'Rahul Sharma',
      phone: agentUser1.phone,
      status: 'available',
      vehicleType: 'electric_bike',
      maxCapacityKg: 30,
      currentLoadKg: 4.5,
      currentLocation: {
        city: 'Bengaluru',
        area: 'Indiranagar',
        coordinates: { lat: 12.9784, lng: 77.6408 },
      },
      operatingZone: 'ZONE_A',
      rating: 4.9,
      totalDeliveries: 142,
      successfulDeliveries: 140,
      antigravityIndex: 98,
    });

    const agent2 = await Agent.create({
      user: agentUser2._id,
      name: 'Sneha Patel',
      phone: agentUser2.phone,
      status: 'available',
      vehicleType: 'delivery_van',
      maxCapacityKg: 150,
      currentLoadKg: 18.0,
      currentLocation: {
        city: 'Bengaluru',
        area: 'Koramangala',
        coordinates: { lat: 12.9352, lng: 77.6245 },
      },
      operatingZone: 'ZONE_A',
      rating: 4.8,
      totalDeliveries: 310,
      successfulDeliveries: 305,
      antigravityIndex: 94,
    });

    const agent3 = await Agent.create({
      user: agentUser3._id,
      name: 'Vikram Rao',
      phone: agentUser3.phone,
      status: 'available',
      vehicleType: 'motorcycle',
      maxCapacityKg: 25,
      currentLoadKg: 2.0,
      currentLocation: {
        city: 'Bengaluru',
        area: 'HSR Layout',
        coordinates: { lat: 12.9121, lng: 77.6446 },
      },
      operatingZone: 'ZONE_A',
      rating: 4.7,
      totalDeliveries: 95,
      successfulDeliveries: 92,
      antigravityIndex: 91,
    });

    const agent4 = await Agent.create({
      user: agentUser4._id,
      name: 'Arun Kumar',
      phone: agentUser4.phone,
      status: 'available',
      vehicleType: 'drone',
      maxCapacityKg: 5,
      currentLoadKg: 0,
      currentLocation: {
        city: 'Bengaluru',
        area: 'Whitefield Tech Park',
        coordinates: { lat: 12.9698, lng: 77.7500 },
      },
      operatingZone: 'ZONE_A',
      rating: 5.0,
      totalDeliveries: 78,
      successfulDeliveries: 78,
      antigravityIndex: 99,
    });

    console.log('✅ Agents Fleet Initialized');

    // 3. Create Zones
    const zones = await Zone.insertMany([
      {
        code: 'ZONE_A',
        name: 'Intra-City Hyperlocal',
        type: 'LOCAL',
        description: 'Within city limits (same metropolitan pincode cluster)',
        pincodePrefixes: ['5600', '5601', '4000', '1100'],
        maxDistanceKm: 35,
        estimatedDeliveryHours: 8,
      },
      {
        code: 'ZONE_B',
        name: 'Regional Express',
        type: 'REGIONAL',
        description: 'Intra-state delivery within 250km radius',
        pincodePrefixes: ['56', '57', '58', '59'],
        maxDistanceKm: 250,
        estimatedDeliveryHours: 24,
      },
      {
        code: 'ZONE_C',
        name: 'Metro-to-Metro Prime',
        type: 'METRO',
        description: 'Between Tier-1 metropolitan airports and major industrial corridors',
        pincodePrefixes: [],
        maxDistanceKm: 1500,
        estimatedDeliveryHours: 48,
      },
      {
        code: 'ZONE_D',
        name: 'National Rest-of-India',
        type: 'NATIONAL',
        description: 'Pan-India tier-2/3 cities and remote non-metro pin codes',
        pincodePrefixes: [],
        maxDistanceKm: 3500,
        estimatedDeliveryHours: 72,
      },
    ]);

    console.log('✅ Logistics Zones Initialized');

    // 4. Create Rate Cards
    await RateCard.insertMany([
      // B2C Rates
      {
        title: 'B2C Standard Local (Zone A)',
        orderType: 'B2C',
        zoneCode: 'ZONE_A',
        baseWeightKg: 0.5,
        baseRate: 40,
        perAdditionalKgRate: 20,
        codFeePercent: 2.0,
        codFeeMin: 30,
        fuelSurchargePercent: 5.0,
        gstPercent: 18.0,
      },
      {
        title: 'B2C Regional Express (Zone B)',
        orderType: 'B2C',
        zoneCode: 'ZONE_B',
        baseWeightKg: 0.5,
        baseRate: 65,
        perAdditionalKgRate: 30,
        codFeePercent: 2.0,
        codFeeMin: 30,
        fuelSurchargePercent: 5.0,
        gstPercent: 18.0,
      },
      {
        title: 'B2C Metro Prime (Zone C)',
        orderType: 'B2C',
        zoneCode: 'ZONE_C',
        baseWeightKg: 0.5,
        baseRate: 90,
        perAdditionalKgRate: 45,
        codFeePercent: 2.0,
        codFeeMin: 35,
        fuelSurchargePercent: 6.0,
        gstPercent: 18.0,
      },
      {
        title: 'B2C National Air (Zone D)',
        orderType: 'B2C',
        zoneCode: 'ZONE_D',
        baseWeightKg: 0.5,
        baseRate: 120,
        perAdditionalKgRate: 60,
        codFeePercent: 2.5,
        codFeeMin: 40,
        fuelSurchargePercent: 7.0,
        gstPercent: 18.0,
      },
      // B2B Rates
      {
        title: 'B2B Bulk Freight Local (Zone A)',
        orderType: 'B2B',
        zoneCode: 'ZONE_A',
        baseWeightKg: 5.0,
        baseRate: 180,
        perAdditionalKgRate: 15,
        codFeePercent: 1.5,
        codFeeMin: 40,
        fuelSurchargePercent: 5.0,
        gstPercent: 18.0,
      },
      {
        title: 'B2B Regional Cargo (Zone B)',
        orderType: 'B2B',
        zoneCode: 'ZONE_B',
        baseWeightKg: 5.0,
        baseRate: 320,
        perAdditionalKgRate: 25,
        codFeePercent: 1.5,
        codFeeMin: 40,
        fuelSurchargePercent: 5.0,
        gstPercent: 18.0,
      },
      {
        title: 'B2B Metro-to-Metro Cargo (Zone C)',
        orderType: 'B2B',
        zoneCode: 'ZONE_C',
        baseWeightKg: 5.0,
        baseRate: 480,
        perAdditionalKgRate: 35,
        codFeePercent: 1.5,
        codFeeMin: 50,
        fuelSurchargePercent: 6.0,
        gstPercent: 18.0,
      },
      {
        title: 'B2B Pan-India Heavy (Zone D)',
        orderType: 'B2B',
        zoneCode: 'ZONE_D',
        baseWeightKg: 5.0,
        baseRate: 650,
        perAdditionalKgRate: 50,
        codFeePercent: 2.0,
        codFeeMin: 60,
        fuelSurchargePercent: 7.0,
        gstPercent: 18.0,
      },
    ]);

    console.log('✅ B2B & B2C Rate Cards Created');

    // 5. Create Seed Orders with Tracking Logs
    // Order 1: Ready for dynamic Antigravity Dispatch
    const order1 = await Order.create({
      trackingNumber: 'AGY-748921-IN',
      customer: customerUser1._id,
      pickupAddress: {
        street: '12 Brigade Road',
        area: 'CBD',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560025',
        contactPerson: 'Karan Mehra',
        contactPhone: '+91 98888 11111',
        coordinates: { lat: 12.9716, lng: 77.5946 },
      },
      dropAddress: {
        street: '45/B Koramangala 5th Block',
        area: 'Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        contactPerson: 'Ananya Roy',
        contactPhone: '+91 97777 22222',
        coordinates: { lat: 12.9352, lng: 77.6245 },
      },
      packageDetails: {
        lengthCm: 25,
        widthCm: 20,
        heightCm: 15,
        actualWeightKg: 1.2,
        volumetricWeightKg: 1.5, // (25*20*15)/5000 = 1.5kg
        chargeableWeightKg: 1.5,
        category: 'Electronics',
        description: 'Quantum Microcontroller Kit',
        isFragile: true,
      },
      orderType: 'B2C',
      paymentMethod: 'PREPAID',
      declaredValue: 2499,
      zoneCode: 'ZONE_A',
      pricingBreakdown: {
        baseRate: 40,
        additionalWeightKg: 1.0,
        weightCharge: 20,
        codSurcharge: 0,
        fuelSurcharge: 3.0,
        gstAmount: 11.34,
        totalAmount: 74.34,
        formula: 'Base (₹40) + Weight Add (₹20) + Fuel (₹3.00) + GST (₹11.34) = ₹74.34',
      },
      status: 'ORDER_CREATED',
      assignedAgent: null,
      deliveryOtp: '482910',
    });

    await TrackingLog.create({
      order: order1._id,
      trackingNumber: order1.trackingNumber,
      status: 'ORDER_CREATED',
      actorName: 'Priya Sharma (Customer)',
      actorRole: 'CUSTOMER',
      location: order1.pickupAddress.coordinates,
      message: 'Shipment created and awaiting Antigravity agent lift dispatch.',
    });

    // Order 2: Out for delivery with Sneha
    const order2 = await Order.create({
      trackingNumber: 'AGY-938201-IN',
      customer: customerUser2._id,
      pickupAddress: {
        street: '88 MG Road',
        area: 'Central',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        contactPerson: 'Vikram Lab Admin',
        contactPhone: '+91 96666 33333',
        coordinates: { lat: 12.9756, lng: 77.6066 },
      },
      dropAddress: {
        street: '14 Indiranagar 12th Main',
        area: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        contactPerson: 'Devika Singhania',
        contactPhone: '+91 95555 44444',
        coordinates: { lat: 12.9784, lng: 77.6408 },
      },
      packageDetails: {
        lengthCm: 30,
        widthCm: 25,
        heightCm: 20,
        actualWeightKg: 2.5,
        volumetricWeightKg: 3.0,
        chargeableWeightKg: 3.0,
        category: 'Healthcare',
        description: 'Diagnostic Sensor Modules',
        isFragile: true,
      },
      orderType: 'B2C',
      paymentMethod: 'COD',
      declaredValue: 1800,
      zoneCode: 'ZONE_A',
      pricingBreakdown: {
        baseRate: 40,
        additionalWeightKg: 2.5,
        weightCharge: 50,
        codSurcharge: 36, // 2% of 1800 = 36
        fuelSurcharge: 4.5,
        gstAmount: 23.49,
        totalAmount: 153.99,
      },
      status: 'OUT_FOR_DELIVERY',
      assignedAgent: agent1._id,
      antigravityAssignmentScore: 96.4,
      deliveryOtp: '719283',
    });

    await TrackingLog.create([
      {
        order: order2._id,
        trackingNumber: order2.trackingNumber,
        status: 'ORDER_CREATED',
        actorName: 'System',
        actorRole: 'SYSTEM',
        message: 'Order created with COD payment method.',
      },
      {
        order: order2._id,
        trackingNumber: order2.trackingNumber,
        status: 'AGENT_ASSIGNED',
        actorName: 'Antigravity Dispatch Engine',
        actorRole: 'SYSTEM',
        message: 'Agent Rahul Sharma assigned via Antigravity Lift Score 96.4.',
      },
      {
        order: order2._id,
        trackingNumber: order2.trackingNumber,
        status: 'PICKED_UP',
        actorName: 'Rahul Sharma',
        actorRole: 'AGENT',
        message: 'Package picked up from Brigade Road Hub.',
      },
      {
        order: order2._id,
        trackingNumber: order2.trackingNumber,
        status: 'OUT_FOR_DELIVERY',
        actorName: 'Rahul Sharma',
        actorRole: 'AGENT',
        message: 'Out for delivery. Customer OTP required for handover.',
      },
    ]);

    // Order 3: Failed Delivery (Ready for Instant Customer Reschedule Test!)
    const order3 = await Order.create({
      trackingNumber: 'AGY-512049-IN',
      customer: customerUser1._id,
      pickupAddress: {
        street: '72 Commercial Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        contactPerson: 'Store Manager',
        contactPhone: '+91 94444 55555',
        coordinates: { lat: 12.9815, lng: 77.6081 },
      },
      dropAddress: {
        street: 'Flat 402, Green Glen Layout',
        area: 'Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        contactPerson: 'Rohan Gupta',
        contactPhone: '+91 93333 66666',
        coordinates: { lat: 12.9260, lng: 77.6762 },
      },
      packageDetails: {
        lengthCm: 15,
        widthCm: 10,
        heightCm: 10,
        actualWeightKg: 0.8,
        volumetricWeightKg: 0.3,
        chargeableWeightKg: 0.8,
        category: 'Apparel',
        description: 'Smart Fitness Garments',
      },
      orderType: 'B2C',
      paymentMethod: 'PREPAID',
      declaredValue: 1200,
      zoneCode: 'ZONE_A',
      pricingBreakdown: {
        baseRate: 40,
        additionalWeightKg: 0.3,
        weightCharge: 10,
        codSurcharge: 0,
        fuelSurcharge: 2.5,
        gstAmount: 9.45,
        totalAmount: 61.95,
      },
      status: 'FAILED',
      deliveryAttempts: 1,
      failureReason: 'CUSTOMER_UNAVAILABLE',
      failureNotes: 'Door locked, phone unanswered after 3 attempts.',
      deliveryOtp: '394812',
    });

    await TrackingLog.create([
      {
        order: order3._id,
        trackingNumber: order3.trackingNumber,
        status: 'ORDER_CREATED',
        actorName: 'System',
        actorRole: 'SYSTEM',
        message: 'Order created.',
      },
      {
        order: order3._id,
        trackingNumber: order3.trackingNumber,
        status: 'OUT_FOR_DELIVERY',
        actorName: 'Sneha Patel',
        actorRole: 'AGENT',
        message: 'Out for delivery attempt #1.',
      },
      {
        order: order3._id,
        trackingNumber: order3.trackingNumber,
        status: 'FAILED',
        actorName: 'Sneha Patel',
        actorRole: 'AGENT',
        message: 'Delivery failed: Customer unavailable at destination. Automated reschedule link issued.',
      },
    ]);

    // Order 4: Delivered successfully
    const order4 = await Order.create({
      trackingNumber: 'AGY-110022-IN',
      customer: customerUser2._id,
      pickupAddress: {
        street: '55 Electronic City Phase 1',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560100',
        contactPerson: 'Tech Admin',
        contactPhone: '+91 92222 77777',
      },
      dropAddress: {
        street: '10 HSR 5th Main',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560102',
        contactPerson: 'Kavita Joshi',
        contactPhone: '+91 91111 88888',
      },
      packageDetails: {
        lengthCm: 40,
        widthCm: 30,
        heightCm: 20,
        actualWeightKg: 4.8,
        volumetricWeightKg: 4.8,
        chargeableWeightKg: 4.8,
        category: 'Documents',
        description: 'Hardware Specification Dossiers',
      },
      orderType: 'B2B',
      paymentMethod: 'PREPAID',
      declaredValue: 5000,
      zoneCode: 'ZONE_A',
      pricingBreakdown: {
        baseRate: 180,
        additionalWeightKg: 0,
        weightCharge: 0,
        codSurcharge: 0,
        fuelSurcharge: 9.0,
        gstAmount: 34.02,
        totalAmount: 223.02,
      },
      status: 'DELIVERED',
      deliveredAt: new Date(Date.now() - 3600 * 1000 * 3),
      deliveryOtp: '849201',
    });

    await TrackingLog.create([
      {
        order: order4._id,
        trackingNumber: order4.trackingNumber,
        status: 'DELIVERED',
        actorName: 'Arun Kumar',
        actorRole: 'AGENT',
        message: 'Package successfully delivered and signed by Kavita Joshi. OTP verified.',
      },
    ]);

    console.log('✅ Sample Orders & Immutable Tracking Timeline Initialized');
    console.log('🌟 Gourish Logistics Seed Completed Successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
  }
};

module.exports = seedDatabase;
