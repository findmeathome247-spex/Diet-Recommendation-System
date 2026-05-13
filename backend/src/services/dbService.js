const sql = require('mssql');
const poolPromise = require('../config/database');
const mockDb = require('../config/mockDatabase');

// User service functions
const dbService = {
    async checkUserExists(username, email) {
        try {
            // Try to get pool, if it fails or doesn't have request method, use mock
            const pool = await poolPromise;
            
            if (typeof pool.findUserByUsername === 'function') {
                // Using mock database
                const byUsername = await pool.findUserByUsername(username);
                const byEmail = await pool.findUserByEmail(email);
                return {
                    exists: byUsername.recordset.length > 0 || byEmail.recordset.length > 0,
                    byUsername: byUsername.recordset.length > 0,
                    byEmail: byEmail.recordset.length > 0
                };
            }

            const request = pool.request();
            const result = await request
                .input('Username', sql.NVarChar, username)
                .input('Email', sql.NVarChar, email)
                .query('SELECT UserID FROM Users WHERE Username = @Username OR Email = @Email');
            
            return {
                exists: result.recordset.length > 0,
                byUsername: result.recordset.length > 0,
                byEmail: result.recordset.length > 0
            };
        } catch (err) {
            console.error('Error checking user existence:', err);
            throw err;
        }
    },

    async createUser(userData) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                const mockUser = {
                    username: userData.username,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    age: userData.age,
                    gender: userData.gender,
                    height: userData.height,
                    weight: userData.weight,
                    passwordHash: userData.passwordHash
                };
                return await pool.createUser(mockUser);
            }

            const request = pool.request();
            const result = await request
                .input('Username', sql.NVarChar, userData.username)
                .input('Email', sql.NVarChar, userData.email)
                .input('PasswordHash', sql.NVarChar, userData.passwordHash)
                .input('FirstName', sql.NVarChar, userData.firstName)
                .input('LastName', sql.NVarChar, userData.lastName)
                .input('Age', sql.Int, userData.age || 0)
                .input('Gender', sql.NVarChar, userData.gender || 'Male')
                .input('Height', sql.Float, userData.height || 0)
                .input('Weight', sql.Float, userData.weight || 0)
                .execute('sp_CreateUser');

            return result;
        } catch (err) {
            console.error('Error creating user:', err);
            throw err;
        }
    },

    async getUserByUsername(username) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.findUserByUsername === 'function') {
                // Using mock database
                return await pool.findUserByUsername(username);
            }

            const request = pool.request();
            const result = await request
                .input('Username', sql.NVarChar, username)
                .query('SELECT UserID, Username, Email, PasswordHash, FirstName, LastName, Role FROM Users WHERE Username = @Username');
            
            return result;
        } catch (err) {
            console.error('Error getting user:', err);
            throw err;
        }
    },

    async getUserById(userId) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.findUserById === 'function') {
                // Using mock database
                return await pool.findUserById(userId);
            }

            const request = pool.request();
            const result = await request
                .input('UserID', sql.Int, userId)
                .query('SELECT UserID, Username, Email, FirstName, LastName, Age, Gender, Height, Weight, Role FROM Users WHERE UserID = @UserID');
            
            return result;
        } catch (err) {
            console.error('Error getting user by ID:', err);
            throw err;
        }
    },

    async updateUserProfile(userId, profileData) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.updateUserProfile === 'function') {
                // Using mock database
                return await pool.updateUserProfile(userId, profileData);
            }

            const request = pool.request();
            let updateFields = [];

            for (const [key, value] of Object.entries(profileData)) {
                updateFields.push(`${key} = @${key}`);
                request.input(key, sql.NVarChar, value);
            }

            if (updateFields.length === 0) {
                return { rowsAffected: [0] };
            }

            request.input('UserID', sql.Int, userId);
            const query = `UPDATE Users SET ${updateFields.join(', ')} WHERE UserID = @UserID`;
            
            const result = await request.query(query);
            return result;
        } catch (err) {
            console.error('Error updating user profile:', err);
            throw err;
        }
    },

    // Water Intake Methods
    async addWaterIntake(userId, glassCount = 1) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.addWaterIntake(userId, glassCount);
            }

            const today = new Date().toISOString().split('T')[0];
            const request = pool.request();
            
            const result = await request
                .input('UserID', sql.Int, userId)
                .input('Date', sql.Date, today)
                .input('GlassCount', sql.Int, glassCount)
                .query(`
                    MERGE INTO WaterIntake AS target
                    USING (SELECT @UserID as UserID, @Date as Date) AS source
                    ON target.UserID = source.UserID AND CAST(target.LogDate AS DATE) = source.Date
                    WHEN MATCHED THEN UPDATE SET GlassCount = GlassCount + @GlassCount
                    WHEN NOT MATCHED THEN INSERT (UserID, LogDate, GlassCount) 
                                       VALUES (@UserID, @Date, @GlassCount);
                    
                    SELECT GlassCount FROM WaterIntake 
                    WHERE UserID = @UserID AND CAST(LogDate AS DATE) = @Date;
                `);

            return { recordset: [{ GlassCount: result.recordset[result.recordset.length - 1]?.GlassCount || glassCount }] };
        } catch (err) {
            console.error('Error adding water intake:', err);
            throw err;
        }
    },

    async getTodayWaterIntake(userId) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.getTodayWaterIntake(userId);
            }

            const today = new Date().toISOString().split('T')[0];
            const request = pool.request();
            
            const result = await request
                .input('UserID', sql.Int, userId)
                .input('Date', sql.Date, today)
                .query(`
                    SELECT ISNULL(GlassCount, 0) as GlassCount 
                    FROM WaterIntake 
                    WHERE UserID = @UserID AND CAST(LogDate AS DATE) = @Date
                `);

            return { recordset: result.recordset.length > 0 ? result.recordset : [{ GlassCount: 0 }] };
        } catch (err) {
            console.error('Error getting today water intake:', err);
            throw err;
        }
    },

    async resetWaterIntake(userId) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.resetWaterIntake(userId);
            }

            const today = new Date().toISOString().split('T')[0];
            const request = pool.request();
            
            const result = await request
                .input('UserID', sql.Int, userId)
                .input('Date', sql.Date, today)
                .query(`
                    UPDATE WaterIntake 
                    SET GlassCount = 0 
                    WHERE UserID = @UserID AND CAST(LogDate AS DATE) = @Date
                `);

            return { rowsAffected: [result.rowsAffected[0]] };
        } catch (err) {
            console.error('Error resetting water intake:', err);
            throw err;
        }
    },

    async setWaterIntake(userId, glassCount) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.setWaterIntake(userId, glassCount);
            }

            const today = new Date().toISOString().split('T')[0];
            const request = pool.request();
            
            const result = await request
                .input('UserID', sql.Int, userId)
                .input('Date', sql.Date, today)
                .input('GlassCount', sql.Int, glassCount)
                .query(`
                    MERGE INTO WaterIntake AS target
                    USING (SELECT @UserID as UserID, @Date as Date) AS source
                    ON target.UserID = source.UserID AND CAST(target.LogDate AS DATE) = source.Date
                    WHEN MATCHED THEN UPDATE SET GlassCount = @GlassCount
                    WHEN NOT MATCHED THEN INSERT (UserID, LogDate, GlassCount) 
                                       VALUES (@UserID, @Date, @GlassCount);
                    
                    SELECT GlassCount FROM WaterIntake 
                    WHERE UserID = @UserID AND CAST(LogDate AS DATE) = @Date;
                `);

            return { recordset: [{ GlassCount: glassCount }] };
        } catch (err) {
            console.error('Error setting water intake:', err);
            throw err;
        }
    },

    // Meal Methods
    async getTodayMeals(userId) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                const result = await mockDb.getTodayMeals(userId);
                // Return in expected format
                return {
                    recordset: result.recordset[0].meals || []
                };
            }

            const today = new Date().toISOString().split('T')[0];
            const request = pool.request();

            const result = await request
                .input('UserID', sql.Int, userId)
                .input('LogDate', sql.Date, today)
                .query(`
                    SELECT TOP 10
                        MealLogID as id,
                        FoodID as foodId,
                        (SELECT FoodName FROM Foods WHERE FoodID = MealLogs.FoodID) as name,
                        (SELECT Calories FROM Foods WHERE FoodID = MealLogs.FoodID) * Quantity as calories,
                        Meal as mealType,
                        LogTime as time,
                        Quantity,
                        LogDate as date
                    FROM MealLogs
                    WHERE UserID = @UserID AND LogDate = @LogDate
                    ORDER BY LogTime DESC
                `);

            return { recordset: result.recordset };
        } catch (err) {
            console.error('Error getting today meals:', err);
            throw err;
        }
    },

    async logMeal(userId, foodID, mealType, quantity) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.logMeal(userId, foodID, mealType, quantity);
            }

            const today = new Date().toISOString().split('T')[0];
            const request = pool.request();

            const result = await request
                .input('UserID', sql.Int, userId)
                .input('FoodID', sql.Int, foodID)
                .input('Meal', sql.NVarChar, mealType)
                .input('Quantity', sql.Int, quantity)
                .input('LogDate', sql.Date, today)
                .query(`
                    INSERT INTO MealLogs (UserID, FoodID, Meal, Quantity, LogDate)
                    VALUES (@UserID, @FoodID, @Meal, @Quantity, @LogDate);
                    SELECT SCOPE_IDENTITY() AS MealLogID;
                `);

            return { recordset: [{ MealLogID: result.recordset[0].MealLogID }] };
        } catch (err) {
            console.error('Error logging meal:', err);
            throw err;
        }
    },

    async deleteMeal(mealLogID, userId) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.deleteMeal(mealLogID, userId);
            }

            const request = pool.request();

            const result = await request
                .input('MealLogID', sql.Int, mealLogID)
                .input('UserID', sql.Int, userId)
                .query('DELETE FROM MealLogs WHERE MealLogID = @MealLogID AND UserID = @UserID');

            return { rowsAffected: result.rowsAffected };
        } catch (err) {
            console.error('Error deleting meal:', err);
            throw err;
        }
    },

    // Nutrition Methods
    async getTodayNutrition(userId) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database - return empty nutrition for now
                return {
                    recordset: [{
                        totalCalories: 0,
                        totalProtein: 0,
                        totalCarbs: 0,
                        totalFat: 0
                    }]
                };
            }

            const today = new Date().toISOString().split('T')[0];
            const request = pool.request();

            const result = await request
                .input('UserID', sql.Int, userId)
                .input('LogDate', sql.Date, today)
                .query(`
                    SELECT
                        ISNULL(SUM(f.Calories * ml.Quantity), 0) as totalCalories,
                        ISNULL(SUM(f.Protein * ml.Quantity), 0) as totalProtein,
                        ISNULL(SUM(f.Carbs * ml.Quantity), 0) as totalCarbs,
                        ISNULL(SUM(f.Fat * ml.Quantity), 0) as totalFat
                    FROM MealLogs ml
                    LEFT JOIN Foods f ON ml.FoodID = f.FoodID
                    WHERE ml.UserID = @UserID AND ml.LogDate = @LogDate
                `);

            return { recordset: result.recordset };
        } catch (err) {
            console.error('Error getting today nutrition:', err);
            throw err;
        }
    },

    async getNutritionByDate(userId, date) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return {
                    recordset: [{
                        totalCalories: 0,
                        totalProtein: 0,
                        totalCarbs: 0,
                        totalFat: 0
                    }]
                };
            }

            const request = pool.request();

            const result = await request
                .input('UserID', sql.Int, userId)
                .input('LogDate', sql.Date, date)
                .query(`
                    SELECT
                        ISNULL(SUM(f.Calories * ml.Quantity), 0) as totalCalories,
                        ISNULL(SUM(f.Protein * ml.Quantity), 0) as totalProtein,
                        ISNULL(SUM(f.Carbs * ml.Quantity), 0) as totalCarbs,
                        ISNULL(SUM(f.Fat * ml.Quantity), 0) as totalFat
                    FROM MealLogs ml
                    LEFT JOIN Foods f ON ml.FoodID = f.FoodID
                    WHERE ml.UserID = @UserID AND ml.LogDate = @LogDate
                `);

            return { recordset: result.recordset };
        } catch (err) {
            console.error('Error getting nutrition by date:', err);
            throw err;
        }
    },

    async getNutritionHistory(userId, days) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return { recordset: [] };
            }

            const request = pool.request();

            const result = await request
                .input('UserID', sql.Int, userId)
                .input('Days', sql.Int, days)
                .query(`
                    SELECT
                        ml.LogDate as date,
                        ISNULL(SUM(f.Calories * ml.Quantity), 0) as totalCalories,
                        ISNULL(SUM(f.Protein * ml.Quantity), 0) as totalProtein,
                        ISNULL(SUM(f.Carbs * ml.Quantity), 0) as totalCarbs,
                        ISNULL(SUM(f.Fat * ml.Quantity), 0) as totalFat
                    FROM MealLogs ml
                    LEFT JOIN Foods f ON ml.FoodID = f.FoodID
                    WHERE ml.UserID = @UserID 
                        AND ml.LogDate >= DATEADD(DAY, -@Days, CAST(GETDATE() AS DATE))
                    GROUP BY ml.LogDate
                    ORDER BY ml.LogDate DESC
                `);

            return { recordset: result.recordset };
        } catch (err) {
            console.error('Error getting nutrition history:', err);
            throw err;
        }
    },

    // Goals Methods
    async getUserGoals(userId) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.getUserGoals(userId);
            }

            const request = pool.request();

            const result = await request
                .input('UserID', sql.Int, userId)
                .query(`
                    SELECT 
                        GoalID as id,
                        UserID,
                        Title,
                        Description,
                        TargetValue,
                        CurrentProgress,
                        Category,
                        DueDate,
                        CreatedAt,
                        UpdatedAt
                    FROM Goals
                    WHERE UserID = @UserID
                    ORDER BY CreatedAt DESC
                `);

            return { recordset: result.recordset };
        } catch (err) {
            console.error('Error getting user goals:', err);
            throw err;
        }
    },

    async createGoal(goalData) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.createGoal(goalData);
            }

            const request = pool.request();

            const result = await request
                .input('UserID', sql.Int, goalData.userId)
                .input('Title', sql.NVarChar, goalData.title)
                .input('Description', sql.NVarChar, goalData.description || '')
                .input('TargetValue', sql.Float, goalData.targetValue)
                .input('CurrentProgress', sql.Float, goalData.currentProgress || 0)
                .input('Category', sql.NVarChar, goalData.category || 'General')
                .input('DueDate', sql.Date, goalData.dueDate)
                .query(`
                    INSERT INTO Goals (UserID, Title, Description, TargetValue, CurrentProgress, Category, DueDate)
                    VALUES (@UserID, @Title, @Description, @TargetValue, @CurrentProgress, @Category, @DueDate);
                    SELECT SCOPE_IDENTITY() AS GoalID;
                `);

            return { recordset: [{ GoalID: result.recordset[0].GoalID }] };
        } catch (err) {
            console.error('Error creating goal:', err);
            throw err;
        }
    },

    async updateGoal(goalId, userId, updates) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.updateGoal(goalId, userId, updates);
            }

            const request = pool.request();
            let updateFields = [];

            if (updates.title !== undefined) {
                updateFields.push('Title = @Title');
                request.input('Title', sql.NVarChar, updates.title);
            }
            if (updates.description !== undefined) {
                updateFields.push('Description = @Description');
                request.input('Description', sql.NVarChar, updates.description);
            }
            if (updates.targetValue !== undefined) {
                updateFields.push('TargetValue = @TargetValue');
                request.input('TargetValue', sql.Float, updates.targetValue);
            }
            if (updates.currentProgress !== undefined) {
                updateFields.push('CurrentProgress = @CurrentProgress');
                request.input('CurrentProgress', sql.Float, updates.currentProgress);
            }
            if (updates.category !== undefined) {
                updateFields.push('Category = @Category');
                request.input('Category', sql.NVarChar, updates.category);
            }
            if (updates.dueDate !== undefined) {
                updateFields.push('DueDate = @DueDate');
                request.input('DueDate', sql.Date, updates.dueDate);
            }

            if (updateFields.length === 0) {
                return { rowsAffected: [0] };
            }

            request.input('GoalID', sql.Int, goalId);
            request.input('UserID', sql.Int, userId);

            const result = await request.query(
                `UPDATE Goals SET ${updateFields.join(', ')}, UpdatedAt = GETDATE()
                 WHERE GoalID = @GoalID AND UserID = @UserID`
            );

            return { rowsAffected: result.rowsAffected };
        } catch (err) {
            console.error('Error updating goal:', err);
            throw err;
        }
    },

    async updateGoalProgress(goalId, userId, progress) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.updateGoalProgress(goalId, userId, progress);
            }

            const request = pool.request();

            const result = await request
                .input('GoalID', sql.Int, goalId)
                .input('UserID', sql.Int, userId)
                .input('Progress', sql.Float, progress)
                .query(`
                    UPDATE Goals 
                    SET CurrentProgress = @Progress, UpdatedAt = GETDATE()
                    WHERE GoalID = @GoalID AND UserID = @UserID
                `);

            return { rowsAffected: result.rowsAffected };
        } catch (err) {
            console.error('Error updating goal progress:', err);
            throw err;
        }
    },

    async deleteGoal(goalId, userId) {
        try {
            const pool = await poolPromise;
            
            if (typeof pool.createUser === 'function') {
                // Using mock database
                return await mockDb.deleteGoal(goalId, userId);
            }

            const request = pool.request();

            const result = await request
                .input('GoalID', sql.Int, goalId)
                .input('UserID', sql.Int, userId)
                .query('DELETE FROM Goals WHERE GoalID = @GoalID AND UserID = @UserID');

            return { rowsAffected: result.rowsAffected };
        } catch (err) {
            console.error('Error deleting goal:', err);
            throw err;
        }
    }

};

module.exports = dbService;
