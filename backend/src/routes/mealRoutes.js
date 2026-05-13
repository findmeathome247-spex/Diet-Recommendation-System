const express = require('express');
const mealController = require('../controllers/mealController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/log', mealController.logMeal);
router.get('/today', mealController.getTodayMeals);
router.get('/daily', mealController.getDailyMealLogs);
router.get('/daily-summary', mealController.getDailyCalorieSummary);
router.get('/history', mealController.getMealHistory);
router.delete('/:mealLogID', mealController.deleteMealLog);

module.exports = router;
