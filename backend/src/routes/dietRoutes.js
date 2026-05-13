const express = require('express');
const dietController = require('../controllers/dietController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/recommendation', dietController.getDietRecommendation);
router.get('/active-plan', dietController.getActiveDietPlan);
router.post('/create-plan', dietController.createDietPlan);

module.exports = router;
