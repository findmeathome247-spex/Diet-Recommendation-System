const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Admin routes - all require admin middleware
router.use(authMiddleware, adminMiddleware);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users/deactivate', adminController.deactivateUser);
router.get('/users/report', adminController.getUserReport);

// Statistics
router.get('/statistics', adminController.getSystemStatistics);
router.get('/statistics/bmi-distribution', adminController.getBMIDistribution);
router.get('/dashboard', adminController.getAdminDashboard);

// Medical conditions
router.get('/conditions', adminController.getMedicalConditions);
router.post('/conditions', adminController.addMedicalCondition);

// Health goals
router.get('/goals', adminController.getHealthGoals);

module.exports = router;
