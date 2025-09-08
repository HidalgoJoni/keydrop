// src/routes/market.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const marketController = require('../controllers/marketController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.get('/', marketController.listActive);
router.get('/my', auth, marketController.myListings);
router.post('/create', auth, [body('skinId').isMongoId(), body('price').isFloat({ gt: 0 }), validate], marketController.createListing);
router.post('/sell', auth, [body('skinId').isMongoId(), body('price').isFloat({ gt: 0 }), validate], marketController.sellSkin);
router.post('/buy', auth, [body('listingId').isMongoId(), validate], marketController.buyListing);
router.post('/cancel', auth, [body('listingId').isMongoId(), validate], marketController.cancelListing);

module.exports = router;
