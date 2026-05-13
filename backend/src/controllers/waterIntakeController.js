const dbService = require('../services/dbService');

// Log water intake (add glasses)
exports.addWaterIntake = async (req, res) => {
    try {
        const { glassCount = 1 } = req.body;
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (glassCount < 0 || isNaN(glassCount)) {
            return res.status(400).json({ error: 'Glass count must be a positive number' });
        }

        const result = await dbService.addWaterIntake(userId, glassCount);

        res.status(200).json({
            message: 'Water intake logged successfully',
            glassCount: result.recordset[0].GlassCount
        });
    } catch (err) {
        console.error('Error logging water intake:', err);
        res.status(500).json({ error: err.message || 'Failed to log water intake' });
    }
};

// Get today's water intake
exports.getTodayWaterIntake = async (req, res) => {
    try {
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const result = await dbService.getTodayWaterIntake(userId);
        const glassCount = result.recordset[0]?.GlassCount || 0;

        res.json({
            date: new Date().toISOString().split('T')[0],
            glassCount: glassCount,
            targetGlasses: 8, // Recommended daily intake
            percentage: Math.min(Math.round((glassCount / 8) * 100), 100)
        });
    } catch (err) {
        console.error('Error fetching water intake:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch water intake' });
    }
};

// Reset water intake for today
exports.resetWaterIntake = async (req, res) => {
    try {
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        await dbService.resetWaterIntake(userId);

        res.json({
            message: 'Water intake reset successfully',
            glassCount: 0
        });
    } catch (err) {
        console.error('Error resetting water intake:', err);
        res.status(500).json({ error: err.message || 'Failed to reset water intake' });
    }
};

// Set water intake to specific amount
exports.setWaterIntake = async (req, res) => {
    try {
        const { glassCount } = req.body;
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (glassCount === undefined || isNaN(glassCount) || glassCount < 0) {
            return res.status(400).json({ error: 'Glass count must be a non-negative number' });
        }

        const result = await dbService.setWaterIntake(userId, glassCount);

        res.json({
            message: 'Water intake updated successfully',
            glassCount: result.recordset[0].GlassCount
        });
    } catch (err) {
        console.error('Error setting water intake:', err);
        res.status(500).json({ error: err.message || 'Failed to set water intake' });
    }
};

// Decrease water intake
exports.decreaseWaterIntake = async (req, res) => {
    try {
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const currentResult = await dbService.getTodayWaterIntake(userId);
        const currentCount = currentResult.recordset[0]?.GlassCount || 0;

        if (currentCount > 0) {
            const result = await dbService.setWaterIntake(userId, currentCount - 1);
            res.json({
                message: 'Water intake decreased',
                glassCount: result.recordset[0].GlassCount
            });
        } else {
            res.json({
                message: 'Water intake is already at 0',
                glassCount: 0
            });
        }
    } catch (err) {
        console.error('Error decreasing water intake:', err);
        res.status(500).json({ error: err.message || 'Failed to decrease water intake' });
    }
};
