const express = require('express');
const router = express.Router();
const { register, login, getMe, quickPersonaLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/quick-persona', quickPersonaLogin);
router.get('/me', protect, getMe);

module.exports = router;
