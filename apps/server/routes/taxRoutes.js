const router = require('express').Router();
const taxController = require('../controllers/TaxCalculator');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/calculate', authMiddleware, taxController.calculateTax);

module.exports = router;