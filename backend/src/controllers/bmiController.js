const sql = require('mssql');
const poolPromise = require('../config/database');

// Get User's Current BMI
exports.getBMI = async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .query('SELECT TOP 1 BMI, BMICategory, Weight, Height, RecordedDate FROM BMIRecords WHERE UserID = @UserID ORDER BY RecordedDate DESC');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No BMI record found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Calculate BMI
exports.calculateBMI = async (req, res) => {
    try {
        const { height, weight } = req.body;

        if (!height || !weight) {
            return res.status(400).json({ error: 'Height and weight are required' });
        }

        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .input('Height', sql.Float, height)
            .input('Weight', sql.Float, weight)
            .execute('sp_CalculateBMI');

        res.json({
            message: 'BMI calculated successfully',
            BMI: result.recordset[0].BMI,
            BMICategory: result.recordset[0].BMICategory
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get BMI History
exports.getBMIHistory = async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        const result = await request
            .input('UserID', sql.Int, req.user.userID)
            .query('SELECT BMI, BMICategory, Weight, Height, RecordedDate FROM BMIRecords WHERE UserID = @UserID ORDER BY RecordedDate DESC');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
