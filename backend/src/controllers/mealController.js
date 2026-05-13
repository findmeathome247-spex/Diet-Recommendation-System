const sql = require('mssql');
const poolPromise = require('../config/database');
const dbService = require('../services/dbService');

// Log meal
exports.logMeal = async (req, res) => {
    try {
        const { foodID, meal, quantity } = req.body;

        if (!foodID || !meal || !quantity) {
            return res.status(400).json({ error: 'FoodID, meal type, and quantity are required' });
        }

        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .input('FoodID', sql.Int, foodID)
            .input('Meal', sql.NVarChar, meal)
            .input('Quantity', sql.Int, quantity)
            .query(`
                INSERT INTO MealLogs (UserID, FoodID, Meal, Quantity, LogDate)
                VALUES (@UserID, @FoodID, @Meal, @Quantity, CAST(GETDATE() AS DATE));
                SELECT SCOPE_IDENTITY() AS MealLogID;
            `);

        res.status(201).json({
            message: 'Meal logged successfully',
            mealLogID: result.recordset[0].MealLogID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get daily meal logs
exports.getDailyMealLogs = async (req, res) => {
    try {
        const { date } = req.query;
        const logDate = date || new Date().toISOString().split('T')[0];

        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .input('LogDate', sql.Date, logDate)
            .query('SELECT * FROM vw_UserMealHistory WHERE UserID = @UserID AND LogDate = @LogDate ORDER BY Meal, LogTime');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get daily calorie summary
exports.getDailyCalorieSummary = async (req, res) => {
    try {
        const { date } = req.query;
        const logDate = date || new Date().toISOString().split('T')[0];

        const pool = await poolPromise;
        const request = pool.request();

        // Get daily total
        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .input('LogDate', sql.Date, logDate)
            .query('SELECT * FROM vw_DailyCalorieSummary WHERE UserID = @UserID AND LogDate = @LogDate');

        const summary = {
            date: logDate,
            meals: result.recordset
        };

        // Calculate total
        const totalResult = await pool.request()
            .input('UserID', sql.Int, req.user.userID)
            .input('LogDate', sql.Date, logDate)
            .query(`
                SELECT 
                    SUM(CaloriesConsumed) AS TotalCalories,
                    COUNT(*) AS TotalItems
                FROM MealLogs
                WHERE UserID = @UserID AND LogDate = @LogDate
            `);

        summary.total = totalResult.recordset[0];
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get meal history
exports.getMealHistory = async (req, res) => {
    try {
        const { days } = req.query;
        const daysBack = parseInt(days) || 7;

        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .input('DaysBack', sql.Int, daysBack)
            .query(`
                SELECT * FROM vw_UserMealHistory 
                WHERE UserID = @UserID AND LogDate >= DATEADD(DAY, -@DaysBack, CAST(GETDATE() AS DATE))
                ORDER BY LogDate DESC, LogTime DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete meal log
exports.deleteMealLog = async (req, res) => {
    try {
        const { mealLogID } = req.params;
        const pool = await poolPromise;
        const request = pool.request();

        await request
            .input('MealLogID', sql.Int, mealLogID)
            .input('UserID', sql.Int, req.user.userID)
            .query('DELETE FROM MealLogs WHERE MealLogID = @MealLogID AND UserID = @UserID');

        res.json({ message: 'Meal log deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get today's meals (simplified for dashboard)
exports.getTodayMeals = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const result = await dbService.getTodayMeals(req.user.userID);

        const meals = result.recordset.map(meal => ({
            id: meal.id,
            name: meal.name || 'Unknown Food',
            calories: Math.round(meal.calories || 0),
            time: meal.time ? new Date(meal.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Unknown Time',
            mealType: meal.mealType || 'Other'
        }));

        res.json({
            date: today,
            meals: meals,
            totalMeals: meals.length,
            totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0)
        });
    } catch (err) {
        console.error('Error fetching today meals:', err);
        res.status(500).json({ error: err.message });
    }
};
