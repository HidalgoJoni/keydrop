const express = require('express');
const router = express.Router();
const { attemptUpgrade } = require('../controllers/upgradeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/attempt', protect, attemptUpgrade);

module.exports = router;