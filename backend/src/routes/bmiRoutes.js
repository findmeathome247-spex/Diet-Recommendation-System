const express = require('express');
const bmiController = require('../controllers/bmiController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/current', bmiController.getBMI);
router.post('/calculate', bmiController.calculateBMI);
router.get('/history', bmiController.getBMIHistory);

module.exports = router;
