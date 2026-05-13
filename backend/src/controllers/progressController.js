const sql = require('mssql');
const poolPromise = require('../config/database');

// Get user progress
exports.getUserProgress = async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .query('SELECT * FROM vw_UserProgressReport WHERE UserID = @UserID ORDER BY ProgressDate DESC');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get weekly progress
exports.getWeeklyProgress = async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .execute('sp_GetUserWeeklyProgress');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add progress record
exports.addProgressRecord = async (req, res) => {
    try {
        const { currentWeight, targetWeight, progressNote } = req.body;

        if (currentWeight === undefined) {
            return res.status(400).json({ error: 'Current weight is required' });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Get start weight
        const userResult = await pool.request()
            .input('UserID', sql.Int, req.user.userID)
            .query('SELECT Weight FROM Users WHERE UserID = @UserID');

        const startWeight = userResult.recordset[0]?.Weight || currentWeight;
        const weightLost = startWeight - currentWeight;

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .input('StartWeight', sql.Float, startWeight)
            .input('CurrentWeight', sql.Float, currentWeight)
            .input('TargetWeight', sql.Float, targetWeight || null)
            .input('WeightLost', sql.Float, weightLost)
            .input('ProgressNote', sql.NVarChar, progressNote || null)
            .query(`
                INSERT INTO UserProgress (UserID, StartWeight, CurrentWeight, TargetWeight, WeightLost, ProgressDate, ProgressNote)
                VALUES (@UserID, @StartWeight, @CurrentWeight, @TargetWeight, @WeightLost, CAST(GETDATE() AS DATE), @ProgressNote);
                SELECT SCOPE_IDENTITY() AS ProgressID;
            `);

        res.status(201).json({
            message: 'Progress record added successfully',
            progressID: result.recordset[0].ProgressID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get user statistics
exports.getUserStatistics = async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .query(`
                SELECT
                    (SELECT COUNT(*) FROM MealLogs WHERE UserID = @UserID) AS TotalMealsLogged,
                    (SELECT COUNT(DISTINCT CAST(LogDate AS DATE)) FROM MealLogs WHERE UserID = @UserID) AS DaysLogged,
                    (SELECT AVG(CaloriesConsumed) FROM MealLogs WHERE UserID = @UserID) AS AvgDailyCalories,
                    (SELECT COUNT(*) FROM BMIRecords WHERE UserID = @UserID) AS BMIRecordsCount,
                    (SELECT MAX(StartWeight) - MIN(CurrentWeight) FROM UserProgress WHERE UserID = @UserID) AS TotalWeightLost
            `);

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
