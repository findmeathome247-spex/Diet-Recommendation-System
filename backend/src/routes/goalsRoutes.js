const express = require('express');
const goalsController = require('../controllers/goalsController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all user goals
router.get('/', goalsController.getUserGoals);

// Create new goal
router.post('/', goalsController.createGoal);

// Update goal
router.put('/:goalId', goalsController.updateGoal);

// Update goal progress
router.patch('/:goalId/progress', goalsController.updateGoalProgress);

// Delete goal
router.delete('/:goalId', goalsController.deleteGoal);

module.exports = router;
