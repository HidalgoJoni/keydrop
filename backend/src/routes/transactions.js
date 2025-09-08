// src/routes/transactions.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listUserTransactions } = require('../controllers/transactionController');
const { query } = require('express-validator');
const validate = require('../middleware/validate');

router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 500 }),
  query('type').optional().isString(),
  validate
], listUserTransactions);

module.exports = router;
