const express = require('express');
const router = express.Router();
const { getInventory, sellSkin, me } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/inventory', protect, getInventory);
router.post('/inventory/sell', protect, sellSkin);
router.get('/me', protect, me);

module.exports = router;