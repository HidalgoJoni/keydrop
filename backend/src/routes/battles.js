// src/routes/battles.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const battleController = require('../controllers/battleController');

router.post('/create', auth, battleController.createBattle);
router.get('/', battleController.listBattles);
router.post('/join', auth, battleController.joinBattle);

module.exports = router;
