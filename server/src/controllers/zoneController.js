const Zone = require('../models/Zone');
const { detectZone } = require('../services/pricingEngine');

/**
 * Get all configured delivery zones
 * GET /api/zones
 */
const getZones = async (req, res) => {
  try {
    const zones = await Zone.find().sort({ code: 1 });
    return res.json({
      success: true,
      count: zones.length,
      data: zones,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new Zone
 * POST /api/zones
 */
const createZone = async (req, res) => {
  try {
    const { code, name, type, description, pincodePrefixes, maxDistanceKm, estimatedDeliveryHours } = req.body;

    const existing = await Zone.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Zone code ${code} already exists.` });
    }

    const zone = await Zone.create({
      code: code.toUpperCase(),
      name,
      type,
      description,
      pincodePrefixes: pincodePrefixes || [],
      maxDistanceKm: maxDistanceKm || 50,
      estimatedDeliveryHours: estimatedDeliveryHours || 24,
    });

    return res.status(201).json({
      success: true,
      message: 'Zone created successfully',
      data: zone,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an existing Zone
 * PUT /api/zones/:id
 */
const updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    return res.json({
      success: true,
      message: 'Zone updated successfully',
      data: zone,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a Zone
 * DELETE /api/zones/:id
 */
const deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    return res.json({ success: true, message: 'Zone deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Test Zone Resolution based on input pincodes/cities
 * POST /api/zones/lookup
 */
const testZoneLookup = async (req, res) => {
  try {
    const { pickupPincode, dropPincode, pickupCity, dropCity } = req.body;
    const detectedZoneCode = await detectZone(pickupPincode, dropPincode, pickupCity, dropCity);
    const zoneDetails = await Zone.findOne({ code: detectedZoneCode });

    return res.json({
      success: true,
      detectedZoneCode,
      zoneDetails,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getZones,
  createZone,
  updateZone,
  deleteZone,
  testZoneLookup,
};
