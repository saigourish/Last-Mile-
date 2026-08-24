const express = require('express');
const router = express.Router();
const {
  getRateCards,
  createRateCard,
  updateRateCard,
  deleteRateCard,
} = require('../controllers/rateCardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getRateCards);

router.post('/', protect, authorize('admin'), createRateCard);
router.put('/:id', protect, authorize('admin'), updateRateCard);
router.delete('/:id', protect, authorize('admin'), deleteRateCard);

module.exports = router;
