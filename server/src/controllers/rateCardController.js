const RateCard = require('../models/RateCard');

/**
 * Get all configured rate cards
 * GET /api/rate-cards
 */
const getRateCards = async (req, res) => {
  try {
    const filter = {};
    if (req.query.orderType) filter.orderType = req.query.orderType;
    if (req.query.zoneCode) filter.zoneCode = req.query.zoneCode;

    const rateCards = await RateCard.find(filter).sort({ orderType: 1, zoneCode: 1 });
    return res.json({
      success: true,
      count: rateCards.length,
      data: rateCards,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new Rate Card
 * POST /api/rate-cards
 */
const createRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Rate card created successfully',
      data: rateCard,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an existing Rate Card
 * PUT /api/rate-cards/:id
 */
const updateRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!rateCard) {
      return res.status(404).json({ success: false, message: 'Rate card not found' });
    }

    return res.json({
      success: true,
      message: 'Rate card updated successfully',
      data: rateCard,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a Rate Card
 * DELETE /api/rate-cards/:id
 */
const deleteRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.findByIdAndDelete(req.params.id);
    if (!rateCard) {
      return res.status(404).json({ success: false, message: 'Rate card not found' });
    }

    return res.json({ success: true, message: 'Rate card deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRateCards,
  createRateCard,
  updateRateCard,
  deleteRateCard,
};
