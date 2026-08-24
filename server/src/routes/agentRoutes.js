const express = require('express');
const router = express.Router();
const {
  getAgents,
  getAgentById,
  updateAgentLocation,
  updateAgentStatus,
} = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAgents);
router.get('/:id', protect, getAgentById);
router.patch('/:id/location', protect, updateAgentLocation);
router.patch('/:id/status', protect, updateAgentStatus);

module.exports = router;
