const express = require('express');
const waterIntakeController = require('../controllers/waterIntakeController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Add water intake (log new glasses)
router.post('/', waterIntakeController.addWaterIntake);

// Get today's water intake
router.get('/today', waterIntakeController.getTodayWaterIntake);

// Set water intake to specific amount
router.put('/', waterIntakeController.setWaterIntake);

// Decrease water intake by 1 glass
router.put('/decrease', waterIntakeController.decreaseWaterIntake);

// Reset water intake
router.post('/reset', waterIntakeController.resetWaterIntake);

module.exports = router;
