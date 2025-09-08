// src/routes/skins.js
const express = require('express');
const router = express.Router();
const { listSkins, getSkin } = require('../controllers/skinController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const { upgrade } = require('../controllers/upgradeController');
const validate = require('../middleware/validate');

router.get('/', listSkins);
router.get('/:id', getSkin);
router.post('/upgrade', auth, [body('inventoryIndex').isInt({ min: 0 }), validate], upgrade);

module.exports = router;
