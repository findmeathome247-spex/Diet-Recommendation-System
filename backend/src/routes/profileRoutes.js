const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', authController.getProfile);
router.put('/', authController.updateProfile);

module.exports = router;
