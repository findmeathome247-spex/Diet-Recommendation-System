const dbService = require('../services/dbService');

// Get all user goals
exports.getUserGoals = async (req, res) => {
    try {
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const result = await dbService.getUserGoals(userId);

        res.json({
            goals: result.recordset || [],
            total: result.recordset?.length || 0
        });
    } catch (err) {
        console.error('Error fetching goals:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch goals' });
    }
};

// Create new goal
exports.createGoal = async (req, res) => {
    try {
        const { title, description, targetValue, category, dueDate } = req.body;
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!title || !category) {
            return res.status(400).json({ error: 'Title and category are required' });
        }

        const result = await dbService.createGoal({
            userId,
            title,
            description: description || '',
            targetValue: targetValue || null,
            category: category || 'General',
            dueDate: dueDate || null,
            currentProgress: 0
        });

        res.status(201).json({
            message: 'Goal created successfully',
            goal: result.recordset[0] || { title, category }
        });
    } catch (err) {
        console.error('Error creating goal:', err);
        res.status(500).json({ error: err.message || 'Failed to create goal' });
    }
};

// Update goal
exports.updateGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { title, description, targetValue, currentProgress, category, dueDate } = req.body;
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!goalId) {
            return res.status(400).json({ error: 'Goal ID is required' });
        }

        const result = await dbService.updateGoal(goalId, userId, {
            title,
            description,
            targetValue,
            currentProgress,
            category,
            dueDate
        });

        res.json({
            message: 'Goal updated successfully',
            rowsAffected: result.rowsAffected?.[0] || 0
        });
    } catch (err) {
        console.error('Error updating goal:', err);
        res.status(500).json({ error: err.message || 'Failed to update goal' });
    }
};

// Update goal progress
exports.updateGoalProgress = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { progress } = req.body;
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!goalId || progress === undefined) {
            return res.status(400).json({ error: 'Goal ID and progress are required' });
        }

        const result = await dbService.updateGoalProgress(goalId, userId, progress);

        res.json({
            message: 'Goal progress updated',
            progress: progress,
            rowsAffected: result.rowsAffected?.[0] || 0
        });
    } catch (err) {
        console.error('Error updating goal progress:', err);
        res.status(500).json({ error: err.message || 'Failed to update goal progress' });
    }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        const userId = req.user.userID;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!goalId) {
            return res.status(400).json({ error: 'Goal ID is required' });
        }

        const result = await dbService.deleteGoal(goalId, userId);

        res.json({
            message: 'Goal deleted successfully',
            rowsAffected: result.rowsAffected?.[0] || 0
        });
    } catch (err) {
        console.error('Error deleting goal:', err);
        res.status(500).json({ error: err.message || 'Failed to delete goal' });
    }
};
