const express = require('express');
const router = express.Router();
const { getInventory, sellSkin } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/inventory', protect, getInventory);
router.post('/inventory/sell', protect, sellSkin);

module.exports = router;