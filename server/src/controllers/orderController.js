const Order = require('../models/Order');
const TrackingLog = require('../models/TrackingLog');
const Agent = require('../models/Agent');
const { calculateOrderPrice } = require('../services/pricingEngine');
const { evaluateAgentsForOrder } = require('../services/assignmentEngine');
const { sendNotification } = require('../services/notificationService');
const { getIO, broadcastOrderStatus, broadcastAgentAssignment } = require('../services/socketService');

const User = require('../models/User');

/**
 * Generate a unique Gourish Tracking ID
 */
const generateTrackingNumber = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GSH-${rand}-IN`;
};

/**
 * Calculate rate preview without creating an order
 * POST /api/orders/calculate-rate
 */
const calculateRatePreview = async (req, res) => {
  try {
    const {
      lengthCm,
      widthCm,
      heightCm,
      actualWeightKg,
      orderType = 'B2C',
      paymentMethod = 'PREPAID',
      declaredValue = 0,
      pickupPincode,
      dropPincode,
      pickupCity,
      dropCity,
      customZone,
    } = req.body;

    const rateResult = await calculateOrderPrice({
      lengthCm,
      widthCm,
      heightCm,
      actualWeightKg,
      orderType,
      paymentMethod,
      declaredValue,
      pickupPincode,
      dropPincode,
      pickupCity,
      dropCity,
      customZone,
    });

    return res.json({
      success: true,
      data: rateResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new delivery order
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  try {
    const {
      pickupAddress,
      dropAddress,
      packageDetails,
      orderType = 'B2C',
      paymentMethod = 'PREPAID',
      declaredValue = 500,
    } = req.body;

    let customerId = req.user ? req.user._id : req.body.customerId;
    if (!customerId) {
      let customerUser = await User.findOne({ role: 'customer' });
      if (!customerUser) {
        customerUser = await User.findOne({});
      }
      if (!customerUser) {
        customerUser = await User.create({
          name: dropAddress?.contactPerson || 'Gourish Customer',
          email: `customer_${Date.now()}@gourish.logistics`,
          password: 'password123',
          role: 'customer',
          phone: dropAddress?.contactPhone || '+91 98888 77777',
        });
      }
      customerId = customerUser._id;
    }

    // Calculate smart price
    const pricing = await calculateOrderPrice({
      lengthCm: packageDetails.lengthCm,
      widthCm: packageDetails.widthCm,
      heightCm: packageDetails.heightCm,
      actualWeightKg: packageDetails.actualWeightKg,
      orderType,
      paymentMethod,
      declaredValue,
      pickupPincode: pickupAddress.pincode,
      dropPincode: dropAddress.pincode,
      pickupCity: pickupAddress.city,
      dropCity: dropAddress.city,
    });

    const trackingNumber = generateTrackingNumber();

    const order = await Order.create({
      trackingNumber,
      customer: customerId,
      pickupAddress,
      dropAddress,
      packageDetails: {
        ...packageDetails,
        volumetricWeightKg: pricing.volumetricWeightKg,
        chargeableWeightKg: pricing.chargeableWeightKg,
      },
      orderType,
      paymentMethod,
      declaredValue,
      zoneCode: pricing.zoneCode,
      pricingBreakdown: pricing.pricingBreakdown,
      status: 'ORDER_CREATED',
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours SLA
    });

    // Create Initial Immutable Tracking Log
    const trackingLog = await TrackingLog.create({
      order: order._id,
      trackingNumber: order.trackingNumber,
      status: 'ORDER_CREATED',
      actorName: req.user ? req.user.name : (pickupAddress.contactPerson || 'Gourish Customer'),
      actorRole: req.user ? req.user.role.toUpperCase() : 'CUSTOMER',
      location: {
        city: pickupAddress.city,
        area: pickupAddress.area || pickupAddress.street,
        coordinates: pickupAddress.coordinates || { lat: 12.9716, lng: 77.5946 },
      },
      message: `Shipment order created successfully with Gourish Logistics. Chargeable Weight: ${pricing.chargeableWeightKg}kg (${pricing.chargedBy}). Total Price: ₹${pricing.pricingBreakdown.totalAmount}`,
      metadata: {
        paymentMethod,
        declaredValue,
        zoneCode: pricing.zoneCode,
      },
    });

    // Send Email & SMS notification
    await sendNotification({
      orderId: order._id,
      trackingNumber: order.trackingNumber,
      recipient: {
        name: dropAddress.contactPerson,
        email: req.user ? req.user.email : 'recipient@example.com',
        phone: dropAddress.contactPhone,
      },
      event: 'ORDER_CREATED',
      subject: `Order Confirmed: ${order.trackingNumber}`,
      message: `Your package from ${pickupAddress.city} to ${dropAddress.city} has been booked under ${order.trackingNumber} with Gourish Logistics. Estimated delivery within 24h.`,
      type: 'EMAIL',
      io: getIO(),
    });

    broadcastOrderStatus(order, trackingLog);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully with Gourish Logistics',
      data: order,
      pricing,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all orders with role-based filtering
 * GET /api/orders
 */
const getOrders = async (req, res) => {
  try {
    const query = {};

    // Role-based restrictions
    if (req.user && req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user && req.user.role === 'agent') {
      const agent = await Agent.findOne({ user: req.user._id });
      if (agent) {
        query.assignedAgent = agent._id;
      }
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Zone filter
    if (req.query.zoneCode) {
      query.zoneCode = req.query.zoneCode;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone companyName')
      .populate('assignedAgent', 'name phone vehicleType rating currentLocation')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get order by Tracking Number (Public & Protected)
 * GET /api/orders/track/:trackingNumber
 */
const getOrderByTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const order = await Order.findOne({ trackingNumber: trackingNumber.toUpperCase() })
      .populate('customer', 'name email phone')
      .populate('assignedAgent', 'name phone vehicleType rating currentLocation');

    if (!order) {
      return res.status(404).json({ success: false, message: `No order found with tracking number: ${trackingNumber}` });
    }

    const logs = await TrackingLog.find({ order: order._id }).sort({ timestamp: 1 });

    return res.json({
      success: true,
      data: {
        order,
        timeline: logs,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Antigravity evaluation & candidates for an order
 * GET /api/orders/:id/antigravity-evaluate
 */
const evaluateAntigravityAssignment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const evaluation = await evaluateAgentsForOrder(order);
    return res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Execute Antigravity Auto-Assignment
 * POST /api/orders/:id/auto-assign
 */
const autoAssignAgentAntigravity = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const evaluation = await evaluateAgentsForOrder(order);
    if (!evaluation.bestAgent) {
      return res.status(400).json({
        success: false,
        message: 'No available delivery agents meet capacity/proximity criteria.',
        candidates: evaluation.candidates,
      });
    }

    const bestAgentObj = await Agent.findById(evaluation.bestAgent.agentId);

    // Update order
    order.assignedAgent = bestAgentObj._id;
    order.antigravityAssignmentScore = evaluation.bestAgent.antigravityLiftScore;
    order.status = 'AGENT_ASSIGNED';
    await order.save();

    // Update agent load and active orders
    bestAgentObj.status = 'on_delivery';
    bestAgentObj.currentLoadKg = (bestAgentObj.currentLoadKg || 0) + order.packageDetails.chargeableWeightKg;
    if (!bestAgentObj.activeOrders.includes(order._id)) {
      bestAgentObj.activeOrders.push(order._id);
    }
    await bestAgentObj.save();

    // Create immutable audit log
    const trackingLog = await TrackingLog.create({
      order: order._id,
      trackingNumber: order.trackingNumber,
      status: 'AGENT_ASSIGNED',
      actorName: req.user ? req.user.name : 'Gourish Dispatch Engine',
      actorRole: req.user ? req.user.role.toUpperCase() : 'SYSTEM',
      location: {
        city: bestAgentObj.currentLocation.city,
        area: bestAgentObj.currentLocation.area,
        coordinates: bestAgentObj.currentLocation.coordinates,
      },
      message: `Agent ${bestAgentObj.name} dynamically assigned with Gourish Lift Score ${evaluation.bestAgent.antigravityLiftScore}/100. Proximity: ${evaluation.bestAgent.distanceKm}km. Vehicle: ${bestAgentObj.vehicleType}.`,
      metadata: {
        agentId: bestAgentObj._id,
        liftScore: evaluation.bestAgent.antigravityLiftScore,
        physics: evaluation.bestAgent.physicsSimulation,
      },
    });

    // Notify Customer & Agent
    await sendNotification({
      orderId: order._id,
      trackingNumber: order.trackingNumber,
      recipient: {
        name: order.dropAddress.contactPerson,
        email: 'customer@gourish.logistics',
        phone: order.dropAddress.contactPhone,
      },
      event: 'AGENT_ASSIGNED',
      subject: `Agent Assigned: ${bestAgentObj.name} for ${order.trackingNumber}`,
      message: `Delivery hero ${bestAgentObj.name} (${bestAgentObj.phone}) has accepted your shipment.`,
      type: 'EMAIL',
      io: getIO(),
    });

    broadcastAgentAssignment(order, bestAgentObj, evaluation.bestAgent.physicsSimulation);
    broadcastOrderStatus(order, trackingLog);

    return res.json({
      success: true,
      message: `Agent ${bestAgentObj.name} successfully assigned via Gourish Dynamic Dispatch!`,
      data: {
        order,
        assignedAgent: bestAgentObj,
        score: evaluation.bestAgent.antigravityLiftScore,
        simulation: evaluation.bestAgent.physicsSimulation,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Manual Agent Assignment by Admin
 * POST /api/orders/:id/manual-assign
 */
const manualAssignAgent = async (req, res) => {
  try {
    const { agentId } = req.body;
    const order = await Order.findById(req.params.id);
    const agent = await Agent.findById(agentId);

    if (!order || !agent) {
      return res.status(404).json({ success: false, message: 'Order or Agent not found' });
    }

    order.assignedAgent = agent._id;
    order.status = 'AGENT_ASSIGNED';
    await order.save();

    agent.status = 'on_delivery';
    if (!agent.activeOrders.includes(order._id)) {
      agent.activeOrders.push(order._id);
    }
    await agent.save();

    const trackingLog = await TrackingLog.create({
      order: order._id,
      trackingNumber: order.trackingNumber,
      status: 'AGENT_ASSIGNED',
      actorName: req.user ? req.user.name : 'Admin Dispatcher',
      actorRole: 'ADMIN',
      location: agent.currentLocation,
      message: `Manual dispatch override: Agent ${agent.name} assigned by administrator.`,
      metadata: { agentId: agent._id, manual: true },
    });

    broadcastOrderStatus(order, trackingLog);

    return res.json({
      success: true,
      message: `Agent ${agent.name} manually assigned to order ${order.trackingNumber}`,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Order Status Lifecycle
 * PATCH /api/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes, failureReason, otpEntered, location } = req.body;
    const order = await Order.findById(req.params.id).populate('assignedAgent');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.status;
    order.status = status;

    if (status === 'DELIVERED') {
      // Validate OTP if provided
      if (otpEntered && otpEntered !== order.deliveryOtp) {
        return res.status(400).json({ success: false, message: 'Invalid delivery OTP verification code.' });
      }
      order.deliveredAt = new Date();

      // Free up agent load
      if (order.assignedAgent) {
        const agent = await Agent.findById(order.assignedAgent._id);
        if (agent) {
          agent.currentLoadKg = Math.max(0, agent.currentLoadKg - order.packageDetails.chargeableWeightKg);
          agent.activeOrders = agent.activeOrders.filter((oid) => oid.toString() !== order._id.toString());
          agent.successfulDeliveries += 1;
          agent.totalDeliveries += 1;
          if (agent.activeOrders.length === 0) agent.status = 'available';
          await agent.save();
        }
      }
    } else if (status === 'FAILED') {
      order.deliveryAttempts += 1;
      order.failureReason = failureReason || 'CUSTOMER_UNAVAILABLE';
      order.failureNotes = notes || '';

      if (order.assignedAgent) {
        const agent = await Agent.findById(order.assignedAgent._id);
        if (agent) {
          agent.failedDeliveries += 1;
          agent.totalDeliveries += 1;
          await agent.save();
        }
      }
    }

    await order.save();

    // Create immutable audit entry
    const logLocation = location || {
      city: order.dropAddress.city,
      area: order.dropAddress.area,
      coordinates: order.dropAddress.coordinates,
    };

    let logMessage = `Status updated from [${previousStatus}] to [${status}].`;
    if (notes) logMessage += ` Note: ${notes}`;
    if (status === 'FAILED') logMessage += ` Reason: ${failureReason || 'Customer Unavailable'}`;

    const trackingLog = await TrackingLog.create({
      order: order._id,
      trackingNumber: order.trackingNumber,
      status,
      actorName: req.user ? req.user.name : 'Delivery Agent',
      actorRole: req.user ? req.user.role.toUpperCase() : 'AGENT',
      location: logLocation,
      message: logMessage,
      metadata: {
        previousStatus,
        failureReason: order.failureReason,
        deliveryAttempts: order.deliveryAttempts,
        deliveredAt: order.deliveredAt,
      },
    });

    // Multi-channel Notification for key transitions
    if (status === 'OUT_FOR_DELIVERY') {
      await sendNotification({
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        recipient: {
          name: order.dropAddress.contactPerson,
          email: 'customer@gourish.logistics',
          phone: order.dropAddress.contactPhone,
        },
        event: 'OUT_FOR_DELIVERY',
        subject: `Out for Delivery: ${order.trackingNumber}`,
        message: `Your package is out for delivery! Give OTP [${order.deliveryOtp}] to your agent to confirm receipt.`,
        type: 'SMS',
        io: getIO(),
      });
    } else if (status === 'FAILED') {
      await sendNotification({
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        recipient: {
          name: order.dropAddress.contactPerson,
          email: 'customer@gourish.logistics',
          phone: order.dropAddress.contactPhone,
        },
        event: 'DELIVERY_FAILED',
        subject: `Delivery Attempt Unsuccessful: ${order.trackingNumber}`,
        message: `We could not deliver your shipment due to (${failureReason || 'Customer Unavailable'}). Click link to reschedule delivery time slot.`,
        type: 'SMS',
        io: getIO(),
      });
    } else if (status === 'DELIVERED') {
      await sendNotification({
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        recipient: {
          name: order.dropAddress.contactPerson,
          email: 'customer@gourish.logistics',
          phone: order.dropAddress.contactPhone,
        },
        event: 'ORDER_DELIVERED',
        subject: `Delivered: ${order.trackingNumber}`,
        message: `Your package has been safely delivered! Thank you for shipping with Gourish Logistics.`,
        type: 'EMAIL',
        io: getIO(),
      });
    }

    broadcastOrderStatus(order, trackingLog);

    return res.json({
      success: true,
      message: `Order status changed to ${status}`,
      data: order,
      log: trackingLog,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Reschedule a failed or pending order (Customer or Admin)
 * POST /api/orders/:id/reschedule
 */
const rescheduleOrder = async (req, res) => {
  try {
    const { rescheduledDate, timeSlot, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = 'RESCHEDULED';
    order.rescheduleDetails = {
      rescheduledDate: new Date(rescheduledDate || Date.now() + 24 * 60 * 60 * 1000),
      timeSlot: timeSlot || '02:00 PM - 06:00 PM',
      requestedAt: new Date(),
      notes: notes || '',
    };
    // Reset assigned agent to allow fresh Gourish dynamic re-assignment for new slot
    order.assignedAgent = null;
    await order.save();

    const trackingLog = await TrackingLog.create({
      order: order._id,
      trackingNumber: order.trackingNumber,
      status: 'RESCHEDULED',
      actorName: req.user ? req.user.name : 'Customer',
      actorRole: req.user ? req.user.role.toUpperCase() : 'CUSTOMER',
      location: {
        city: order.dropAddress.city,
        area: order.dropAddress.area,
        coordinates: order.dropAddress.coordinates,
      },
      message: `Shipment rescheduled by recipient for ${new Date(rescheduledDate).toLocaleDateString()} (${timeSlot}). Notes: ${notes || 'None'}. Agent unassigned for fresh dynamic dispatch.`,
      metadata: {
        rescheduledDate,
        timeSlot,
      },
    });

    await sendNotification({
      orderId: order._id,
      trackingNumber: order.trackingNumber,
      recipient: {
        name: order.dropAddress.contactPerson,
        email: 'customer@gourish.logistics',
        phone: order.dropAddress.contactPhone,
      },
      event: 'RESCHEDULE_CONFIRMED',
      subject: `Reschedule Confirmed: ${order.trackingNumber}`,
      message: `Your delivery has been rescheduled to ${new Date(rescheduledDate).toLocaleDateString()} during slot ${timeSlot}.`,
      type: 'EMAIL',
      io: getIO(),
    });

    broadcastOrderStatus(order, trackingLog);

    return res.json({
      success: true,
      message: 'Delivery slot rescheduled successfully. Ready for dynamic Gourish re-assignment.',
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get full immutable audit history for an order
 * GET /api/orders/:id/logs
 */
const getOrderTrackingLogs = async (req, res) => {
  try {
    const logs = await TrackingLog.find({ order: req.params.id }).sort({ timestamp: 1 });
    return res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  calculateRatePreview,
  createOrder,
  getOrders,
  getOrderByTrackingNumber,
  evaluateAntigravityAssignment,
  autoAssignAgentAntigravity,
  manualAssignAgent,
  updateOrderStatus,
  rescheduleOrder,
  getOrderTrackingLogs,
};
