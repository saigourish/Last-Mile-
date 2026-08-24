const Agent = require('../models/Agent');
const Order = require('../models/Order');

/**
 * Get all delivery agents with real-time locations and capacity
 * GET /api/agents
 */
const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find().populate('user', 'name email phone avatar').populate('activeOrders');
    return res.json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single agent profile & assigned missions
 * GET /api/agents/:id
 */
const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate({
        path: 'activeOrders',
        populate: { path: 'customer', select: 'name email phone' },
      });

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    return res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update agent live GPS coordinates & area
 * PATCH /api/agents/:id/location
 */
const updateAgentLocation = async (req, res) => {
  try {
    const { lat, lng, area, city } = req.body;
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    agent.currentLocation = {
      city: city || agent.currentLocation.city,
      area: area || agent.currentLocation.area,
      coordinates: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      lastUpdated: new Date(),
    };

    await agent.save();

    return res.json({
      success: true,
      message: 'Agent live GPS coordinates updated',
      data: agent.currentLocation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update agent status (available, on_delivery, offline, break)
 * PATCH /api/agents/:id/status
 */
const updateAgentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    agent.status = status;
    await agent.save();

    return res.json({
      success: true,
      message: `Agent status updated to ${status}`,
      data: agent,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAgents,
  getAgentById,
  updateAgentLocation,
  updateAgentStatus,
};
