const sql = require('mssql');
const poolPromise = require('../config/database');

// Get Diet Recommendation
exports.getDietRecommendation = async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .execute('sp_GetDietRecommendation');

        res.json({
            message: 'Diet recommendation retrieved',
            foods: result.recordset
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Active Diet Plan
exports.getActiveDietPlan = async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .query(`
                SELECT dp.DietPlanID, dp.BMICategory, dp.TargetCalories, 
                       hg.GoalName, dp.StartDate, dp.EndDate, dp.IsActive
                FROM DietPlans dp
                INNER JOIN HealthGoals hg ON dp.HealthGoalID = hg.GoalID
                WHERE dp.UserID = @UserID AND dp.IsActive = 1
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No active diet plan found' });
        }

        const dietPlan = result.recordset[0];

        // Get diet plan items
        const itemsResult = await pool.request()
            .input('DietPlanID', sql.Int, dietPlan.DietPlanID)
            .query(`
                SELECT dpi.DietPlanItemID, f.FoodID, f.FoodName, f.Calories, 
                       f.Protein, f.Carbohydrates, f.Fat, dpi.Meal, dpi.Quantity
                FROM DietPlanItems dpi
                INNER JOIN Foods f ON dpi.FoodID = f.FoodID
                WHERE dpi.DietPlanID = @DietPlanID
                ORDER BY dpi.Meal
            `);

        dietPlan.items = itemsResult.recordset;
        res.json(dietPlan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Diet Plan
exports.createDietPlan = async (req, res) => {
    try {
        const { healthGoalID, bmiBCategory, targetCalories } = req.body;

        if (!healthGoalID || !bmiBCategory) {
            return res.status(400).json({ error: 'Health goal and BMI category are required' });
        }

        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .input('HealthGoalID', sql.Int, healthGoalID)
            .input('BMICategory', sql.NVarChar, bmiBCategory)
            .input('TargetCalories', sql.Int, targetCalories || 2000)
            .input('StartDate', sql.DateTime, new Date())
            .input('EndDate', sql.DateTime, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
            .query(`
                INSERT INTO DietPlans (UserID, HealthGoalID, BMICategory, TargetCalories, StartDate, EndDate, IsActive)
                VALUES (@UserID, @HealthGoalID, @BMICategory, @TargetCalories, @StartDate, @EndDate, 1);
                SELECT SCOPE_IDENTITY() AS DietPlanID;
            `);

        res.status(201).json({
            message: 'Diet plan created successfully',
            dietPlanID: result.recordset[0].DietPlanID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
