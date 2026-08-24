const express = require('express');
const router = express.Router();
const {
  getZones,
  createZone,
  updateZone,
  deleteZone,
  testZoneLookup,
} = require('../controllers/zoneController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getZones);
router.post('/lookup', testZoneLookup);

router.post('/', protect, authorize('admin'), createZone);
router.put('/:id', protect, authorize('admin'), updateZone);
router.delete('/:id', protect, authorize('admin'), deleteZone);

module.exports = router;
