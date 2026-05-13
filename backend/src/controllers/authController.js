const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const poolPromise = require('../config/database');
const dbService = require('../services/dbService');

// Register User
exports.register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, age, gender, height, weight } = req.body;

        console.log('📝 Registration attempt for:', username);
        console.log('Request body:', { username, email, firstName, lastName });

        // Validate input
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Hash password using bcrypt
        console.log('🔒 Hashing password with bcrypt...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('✓ Password hashed:', hashedPassword.substring(0, 10) + '...');

        // Check if user already exists
        const userCheck = await dbService.checkUserExists(username, email);
        if (userCheck.exists) {
            console.log('⚠️ User already exists:', username);
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Create user
        console.log('💾 Creating user in database...');
        const result = await dbService.createUser({
            username,
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            age: age || 0,
            gender: gender || 'Male',
            height: height || 0,
            weight: weight || 0
        });

        console.log('✓ User created, result:', result);

        if (result.recordset && result.recordset.length > 0) {
            const userID = result.recordset[0].UserID;
            console.log('✓ New user ID:', userID);
            
            // Generate JWT token for auto-login
            const token = jwt.sign(
                {
                    userID: userID,
                    username: username,
                    email: email,
                    role: 'user'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );
            
            console.log('✓ Registration successful, auto-login token generated');
            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    userID: userID,
                    username: username,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    role: 'user'
                }
            });
        } else {
            res.status(201).json({ message: 'User registered successfully' });
        }
    } catch (err) {
        console.error('❌ Registration error:', err);
        res.status(500).json({ error: err.message || 'Registration failed' });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('🔐 Login attempt for user:', username);
        console.log('Request body username:', username, 'password length:', password?.length || 0);

        if (!username || !password) {
            console.log('⚠️ Missing credentials');
            return res.status(400).json({ error: 'Username and password required' });
        }

        console.log('🔍 Looking up user in database...');
        const result = await dbService.getUserByUsername(username);

        if (result.recordset.length === 0) {
            console.log('❌ User not found:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.recordset[0];
        console.log('✓ User found:', user.Username);
        console.log('📋 DB Password hash:', user.PasswordHash);
        console.log('📋 Provided password:', password);
        
        // Use bcrypt.compare for password verification
        console.log('🔒 Comparing passwords with bcrypt...');
        const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
        console.log('✓ Password match result:', passwordMatch);

        if (!passwordMatch) {
            console.log('❌ Password mismatch for user:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        console.log('🎫 Generating JWT token...');
        const token = jwt.sign(
            {
                userID: user.UserID,
                username: user.Username,
                email: user.Email,
                role: user.Role || 'user'
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('✅ Login successful for user:', user.Username);
        console.log('🎫 Token generated:', token.substring(0, 20) + '...');
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                userID: user.UserID,
                username: user.Username,
                email: user.Email,
                firstName: user.FirstName,
                lastName: user.LastName,
                role: user.Role || 'user'
            }
        });
    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Get User Profile
exports.getProfile = async (req, res) => {
    try {
        const dbService = require('../services/dbService');
        const result = await dbService.getUserById(req.user.userID);

        if (!result.recordset || result.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: err.message });
    }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, age, gender, height, weight } = req.body;
        const pool = await poolPromise;
        const request = pool.request();

        await request
            .input('UserID', sql.Int, req.user.userID)
            .input('FirstName', sql.NVarChar, firstName)
            .input('LastName', sql.NVarChar, lastName)
            .input('Age', sql.Int, age)
            .input('Gender', sql.NVarChar, gender)
            .input('Height', sql.Float, height)
            .input('Weight', sql.Float, weight)
            .query(`
                UPDATE Users 
                SET FirstName = @FirstName, LastName = @LastName, Age = @Age, 
                    Gender = @Gender, Height = @Height, Weight = @Weight
                WHERE UserID = @UserID
            `);

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
