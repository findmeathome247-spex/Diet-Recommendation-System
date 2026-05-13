const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const bmiRoutes = require('./src/routes/bmiRoutes');
const dietRoutes = require('./src/routes/dietRoutes');
const foodRoutes = require('./src/routes/foodRoutes');
const mealRoutes = require('./src/routes/mealRoutes');
const waterIntakeRoutes = require('./src/routes/waterIntakeRoutes');
const nutritionRoutes = require('./src/routes/nutritionRoutes');
const goalsRoutes = require('./src/routes/goalsRoutes');
const progressRoutes = require('./src/routes/progressRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'NutriGuide API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/water-intake', waterIntakeRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`NutriGuide API server running on port ${PORT}`);
});
