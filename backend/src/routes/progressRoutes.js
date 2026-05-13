const express = require('express');
const progressController = require('../controllers/progressController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', progressController.getUserProgress);
router.get('/weekly', progressController.getWeeklyProgress);
router.post('/add', progressController.addProgressRecord);
router.get('/statistics', progressController.getUserStatistics);

module.exports = router;
