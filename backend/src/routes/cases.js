// src/routes/cases.js
const express = require('express');
const router = express.Router();
const { listCases, openCase } = require('../controllers/caseController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.get('/', listCases);
router.post('/open', auth, [body('caseId').isMongoId(), validate], openCase);

module.exports = router;
