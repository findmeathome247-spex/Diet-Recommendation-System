const dbService = require('../services/dbService');

// Get today's nutrition summary
exports.getTodayNutrition = async (req, res) => {
    try {
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const result = await dbService.getTodayNutrition(userId);

        res.json({
            date: new Date().toISOString().split('T')[0],
            nutrition: result.recordset[0] || {
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0
            },
            targets: {
                calories: 2000,
                protein: 150,
                carbs: 250,
                fat: 65
            }
        });
    } catch (err) {
        console.error('Error fetching nutrition summary:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch nutrition summary' });
    }
};

// Get nutrition for specific date
exports.getNutritionByDate = async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const result = await dbService.getNutritionByDate(userId, date);

        res.json({
            date: date,
            nutrition: result.recordset[0] || {
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0
            },
            targets: {
                calories: 2000,
                protein: 150,
                carbs: 250,
                fat: 65
            }
        });
    } catch (err) {
        console.error('Error fetching nutrition by date:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch nutrition' });
    }
};

// Get nutrition history (last N days)
exports.getNutritionHistory = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const result = await dbService.getNutritionHistory(userId, parseInt(days));

        res.json({
            days: parseInt(days),
            nutrition: result.recordset || [],
            targets: {
                calories: 2000,
                protein: 150,
                carbs: 250,
                fat: 65
            }
        });
    } catch (err) {
        console.error('Error fetching nutrition history:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch nutrition history' });
    }
};
