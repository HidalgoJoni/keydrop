// caseRoutes.js
const express = require('express');
const router = express.Router();
const { getAllCases, openCase } = require('../controllers/caseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllCases); // Ruta pública para ver las cajas
router.post('/open', protect, openCase); // Ruta protegida para abrir una

module.exports = router;
