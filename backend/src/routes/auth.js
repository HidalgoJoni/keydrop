// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController') || {};
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

function safeHandler(maybeFn, name) {
  if (typeof maybeFn === 'function') return maybeFn;
  console.warn(`authController.${name} is not a function; using fallback handler`);
  return (req, res) => res.status(500).json({ message: `Handler ${name} not implemented on authController` });
}

const registerHandler = safeHandler(authController.register || (authController.default && authController.default.register), 'register');
const loginHandler = safeHandler(authController.login || (authController.default && authController.default.login), 'login');
const meHandler = safeHandler(authController.me || (authController.default && authController.default.me), 'me');

router.post('/register', [
  body('username').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validate
], registerHandler);

router.post('/login', [
  body('email').isEmail(),
  body('password').exists(),
  validate
], loginHandler);

router.get('/me', auth, meHandler);

module.exports = router;
