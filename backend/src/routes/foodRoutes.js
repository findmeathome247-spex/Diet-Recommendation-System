const express = require('express');
const foodController = require('../controllers/foodController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', foodController.getAllFoods);
router.get('/search', foodController.searchFoods);
router.get('/nutrition-summary', foodController.getFoodNutritionSummary);
router.get('/:foodID', foodController.getFoodByID);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, foodController.addFood);
router.put('/:foodID', authMiddleware, adminMiddleware, foodController.updateFood);
router.delete('/:foodID', authMiddleware, adminMiddleware, foodController.deleteFood);

module.exports = router;
