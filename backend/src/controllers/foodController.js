const sql = require('mssql');
const poolPromise = require('../config/database');

// Get all foods
exports.getAllFoods = async (req, res) => {
    try {
        const { category, minCalories, maxCalories } = req.query;
        const pool = await poolPromise;
        let query = 'SELECT * FROM Foods WHERE 1=1';
        const request = pool.request();

        if (category) {
            query += ' AND Category = @Category';
            request.input('Category', sql.NVarChar, category);
        }
        if (minCalories) {
            query += ' AND Calories >= @MinCalories';
            request.input('MinCalories', sql.Int, parseInt(minCalories));
        }
        if (maxCalories) {
            query += ' AND Calories <= @MaxCalories';
            request.input('MaxCalories', sql.Int, parseInt(maxCalories));
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get food by ID
exports.getFoodByID = async (req, res) => {
    try {
        const { foodID } = req.params;
        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('FoodID', sql.Int, foodID)
            .query('SELECT * FROM Foods WHERE FoodID = @FoodID');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Food not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Search foods
exports.searchFoods = async (req, res) => {
    try {
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({ error: 'Search term required' });
        }

        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('SearchTerm', sql.NVarChar, `%${search}%`)
            .query('SELECT * FROM Foods WHERE FoodName LIKE @SearchTerm');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get food nutrition summary view
exports.getFoodNutritionSummary = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM vw_FoodNutritionSummary');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin: Add food
exports.addFood = async (req, res) => {
    try {
        const { foodName, calories, protein, carbohydrates, fat, fiber, servingSize, category } = req.body;

        if (!foodName || calories === undefined) {
            return res.status(400).json({ error: 'Food name and calories are required' });
        }

        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('FoodName', sql.NVarChar, foodName)
            .input('Calories', sql.Int, calories)
            .input('Protein', sql.Float, protein || 0)
            .input('Carbohydrates', sql.Float, carbohydrates || 0)
            .input('Fat', sql.Float, fat || 0)
            .input('Fiber', sql.Float, fiber || 0)
            .input('ServingSize', sql.NVarChar, servingSize || '1 serving')
            .input('Category', sql.NVarChar, category || 'General')
            .query(`
                INSERT INTO Foods (FoodName, Calories, Protein, Carbohydrates, Fat, Fiber, ServingSize, Category)
                VALUES (@FoodName, @Calories, @Protein, @Carbohydrates, @Fat, @Fiber, @ServingSize, @Category);
                SELECT SCOPE_IDENTITY() AS FoodID;
            `);

        res.status(201).json({
            message: 'Food added successfully',
            foodID: result.recordset[0].FoodID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin: Update food
exports.updateFood = async (req, res) => {
    try {
        const { foodID } = req.params;
        const { foodName, calories, protein, carbohydrates, fat, fiber, servingSize, category } = req.body;

        const pool = await poolPromise;
        const request = pool.request();

        await request
            .input('FoodID', sql.Int, foodID)
            .input('FoodName', sql.NVarChar, foodName)
            .input('Calories', sql.Int, calories)
            .input('Protein', sql.Float, protein)
            .input('Carbohydrates', sql.Float, carbohydrates)
            .input('Fat', sql.Float, fat)
            .input('Fiber', sql.Float, fiber)
            .input('ServingSize', sql.NVarChar, servingSize)
            .input('Category', sql.NVarChar, category)
            .query(`
                UPDATE Foods
                SET FoodName = @FoodName, Calories = @Calories, Protein = @Protein,
                    Carbohydrates = @Carbohydrates, Fat = @Fat, Fiber = @Fiber,
                    ServingSize = @ServingSize, Category = @Category, UpdatedAt = GETDATE()
                WHERE FoodID = @FoodID
            `);

        res.json({ message: 'Food updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin: Delete food
exports.deleteFood = async (req, res) => {
    try {
        const { foodID } = req.params;
        const pool = await poolPromise;
        const request = pool.request();

        await request
            .input('FoodID', sql.Int, foodID)
            .query('DELETE FROM Foods WHERE FoodID = @FoodID');

        res.json({ message: 'Food deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
