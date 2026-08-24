const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/overview', protect, authorize('admin'), getDashboardMetrics);

module.exports = router;
