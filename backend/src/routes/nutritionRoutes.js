const express = require('express');
const nutritionController = require('../controllers/nutritionController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get today's nutrition summary
router.get('/today', nutritionController.getTodayNutrition);

// Get nutrition for specific date
router.get('/by-date', nutritionController.getNutritionByDate);

// Get nutrition history (last N days)
router.get('/history', nutritionController.getNutritionHistory);

module.exports = router;
