const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect, protectOptional, authorize } = require('../middleware/authMiddleware');

// Public or Protected pricing calculation
router.post('/calculate-rate', calculateRatePreview);

// Public Order Tracking by tracking number
router.get('/track/:trackingNumber', getOrderByTrackingNumber);

// Order creation (Public / Protected) & Order listing (Protected)
router.route('/')
  .post(protectOptional, createOrder)
  .get(protect, getOrders);

// Antigravity dynamic evaluation
router.get('/:id/antigravity-evaluate', protect, evaluateAntigravityAssignment);

// Auto-assign with Antigravity lift simulation
router.post('/:id/auto-assign', protect, autoAssignAgentAntigravity);

// Manual dispatch override (Admin only)
router.post('/:id/manual-assign', protect, authorize('admin'), manualAssignAgent);

// Order status lifecycle update (Agent & Admin)
router.patch('/:id/status', protect, updateOrderStatus);

// Reschedule order (Customer & Admin)
router.post('/:id/reschedule', protect, rescheduleOrder);

// Order immutable audit timeline logs
router.get('/:id/logs', protect, getOrderTrackingLogs);

module.exports = router;
