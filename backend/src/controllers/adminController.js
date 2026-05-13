const sql = require('mssql');
const poolPromise = require('../config/database');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT UserID, Username, Email, FirstName, LastName, Age, Gender, CreatedAt, IsActive, Role FROM Users');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get user report
exports.getUserReport = async (req, res) => {
    try {
        const { userID, startDate, endDate } = req.query;

        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, userID)
            .input('StartDate', sql.Date, startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .input('EndDate', sql.Date, endDate || new Date())
            .execute('sp_GenerateUserReport');

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get system statistics
exports.getSystemStatistics = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_AdminGetUserStatistics');

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get BMI distribution
exports.getBMIDistribution = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM vw_BMICategoryDistribution');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Deactivate user account
exports.deactivateUser = async (req, res) => {
    try {
        const { userID } = req.body;

        if (!userID) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const pool = await poolPromise;
        const request = pool.request();

        await request
            .input('UserID', sql.Int, userID)
            .query('UPDATE Users SET IsActive = 0 WHERE UserID = @UserID');

        res.json({ message: 'User account deactivated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get admin dashboard data
exports.getAdminDashboard = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM vw_AdminDashboard');

        const dashboard = {};
        result.recordset.forEach(row => {
            dashboard[row.Metric] = row.Value;
        });

        res.json(dashboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get medical conditions (admin)
exports.getMedicalConditions = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM MedicalConditions');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add medical condition (admin)
exports.addMedicalCondition = async (req, res) => {
    try {
        const { conditionName, description, dietaryRestrictions } = req.body;

        if (!conditionName) {
            return res.status(400).json({ error: 'Condition name is required' });
        }

        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('ConditionName', sql.NVarChar, conditionName)
            .input('Description', sql.NVarChar, description || null)
            .input('DietaryRestrictions', sql.NVarChar, dietaryRestrictions || null)
            .query(`
                INSERT INTO MedicalConditions (ConditionName, Description, DietaryRestrictions)
                VALUES (@ConditionName, @Description, @DietaryRestrictions);
                SELECT SCOPE_IDENTITY() AS ConditionID;
            `);

        res.status(201).json({
            message: 'Medical condition added',
            conditionID: result.recordset[0].ConditionID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get health goals
exports.getHealthGoals = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM HealthGoals');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
