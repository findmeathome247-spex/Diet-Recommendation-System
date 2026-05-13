const sql = require('mssql');
const dotenv = require('dotenv');
const mockDb = require('./mockDatabase');

dotenv.config();

// Database connection pool configuration
const sqlConfig = {
    server: process.env.DB_SERVER || '.\\SQLEXPRESS',  // Use named instance for SQL Server Express
    database: process.env.DB_NAME || 'NutriGuide',
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER || 'nutriguide_user',
            password: process.env.DB_PASSWORD || 'NutriGuide@2024'
        }
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 30000,
        requestTimeout: 30000,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    }
};

let poolPromise;

// Try to connect to SQL Server, fallback to mock database if it fails
async function initializeDatabase() {
    try {
        poolPromise = sql.connect(sqlConfig);
        await poolPromise;
        console.log('✓ Connected to SQL Server');
        return poolPromise;
    } catch (err) {
        console.log('✗ SQL Server connection failed, using Mock Database for testing');
        console.log('  Error:', err.message);
        await mockDb.initialize();
        // Return mockDb directly so dbService can detect it
        return mockDb;
    }
}

const dbPromise = initializeDatabase();

module.exports = dbPromise;
module.exports.mockDb = mockDb;
