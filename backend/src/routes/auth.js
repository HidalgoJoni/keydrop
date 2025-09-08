// src/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { me } = require('../controllers/userController');

router.post('/register', [
  body('username').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validate
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').exists(),
  validate
], login);

router.get('/me', auth, me);

module.exports = router;
