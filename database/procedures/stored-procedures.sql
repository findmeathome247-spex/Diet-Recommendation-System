-- SQL Server Stored Procedures for NutriGuide

-- 1. Stored Procedure to Calculate and Insert BMI Record
CREATE PROCEDURE sp_CalculateBMI
    @UserID INT,
    @Height FLOAT,
    @Weight FLOAT
AS
BEGIN
    DECLARE @BMI FLOAT;
    DECLARE @BMICategory NVARCHAR(20);
    
    -- Calculate BMI: weight (kg) / (height (m))^2
    -- Height is stored in cm, so convert to meters
    SET @BMI = @Weight / ((@Height / 100) * (@Height / 100));
    
    -- Determine BMI Category
    IF @BMI < 18.5
        SET @BMICategory = 'Underweight'
    ELSE IF @BMI >= 18.5 AND @BMI < 25
        SET @BMICategory = 'Normal'
    ELSE IF @BMI >= 25 AND @BMI < 30
        SET @BMICategory = 'Overweight'
    ELSE
        SET @BMICategory = 'Obese'
    
    -- Insert BMI Record
    INSERT INTO BMIRecords (UserID, BMI, BMICategory, Weight, Height)
    VALUES (@UserID, ROUND(@BMI, 2), @BMICategory, @Weight, @Height);
    
    -- Update User's height and weight
    UPDATE Users
    SET Height = @Height, Weight = @Weight, UpdatedAt = GETDATE()
    WHERE UserID = @UserID;
    
    SELECT @BMI AS BMI, @BMICategory AS BMICategory;
END;
GO

-- 2. Stored Procedure to Get Diet Recommendation
CREATE PROCEDURE sp_GetDietRecommendation
    @UserID INT
AS
BEGIN
    DECLARE @BMICategory NVARCHAR(20);
    DECLARE @TargetCalories INT;
    
    -- Get latest BMI category
    SELECT TOP 1 @BMICategory = BMICategory, @TargetCalories = 2000
    FROM BMIRecords
    WHERE UserID = @UserID
    ORDER BY RecordedDate DESC;
    
    -- Adjust calories based on BMI and goals
    IF @BMICategory = 'Underweight'
        SET @TargetCalories = 2500
    ELSE IF @BMICategory = 'Overweight'
        SET @TargetCalories = 1800
    ELSE IF @BMICategory = 'Obese'
        SET @TargetCalories = 1500
    
    -- Return recommended foods (simplified logic)
    SELECT TOP 10
        f.FoodID,
        f.FoodName,
        f.Calories,
        f.Protein,
        f.Carbohydrates,
        f.Fat,
        f.Category
    FROM Foods f
    WHERE f.Calories <= @TargetCalories / 3 -- Approximate per meal
    ORDER BY f.Calories ASC;
END;
GO

-- 3. Stored Procedure to Get Daily Calorie Summary
CREATE PROCEDURE sp_GetDailyCalorieSummary
    @UserID INT,
    @Date DATE
AS
BEGIN
    SELECT
        Meal,
        COUNT(*) AS ItemCount,
        SUM(CaloriesConsumed) AS TotalCalories
    FROM MealLogs
    WHERE UserID = @UserID AND LogDate = @Date
    GROUP BY Meal;
    
    -- Also return total daily calories
    SELECT
        'DAILY_TOTAL' AS Meal,
        COUNT(*) AS ItemCount,
        SUM(CaloriesConsumed) AS TotalCalories
    FROM MealLogs
    WHERE UserID = @UserID AND LogDate = @Date;
END;
GO

-- 4. Stored Procedure to Create User with Initial Data
CREATE PROCEDURE sp_CreateUser
    @Username NVARCHAR(50),
    @Email NVARCHAR(100),
    @PasswordHash NVARCHAR(255),
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @Age INT,
    @Gender NVARCHAR(10),
    @Height FLOAT,
    @Weight FLOAT
AS
BEGIN
    DECLARE @UserID INT;
    
    BEGIN TRY
        -- Insert User
        INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Age, Gender, Height, Weight)
        VALUES (@Username, @Email, @PasswordHash, @FirstName, @LastName, @Age, @Gender, @Height, @Weight);
        
        SET @UserID = SCOPE_IDENTITY();
        
        -- Calculate initial BMI
        EXEC sp_CalculateBMI @UserID, @Height, @Weight;
        
        -- Create initial progress record
        INSERT INTO UserProgress (UserID, StartWeight, CurrentWeight, TargetWeight)
        VALUES (@UserID, @Weight, @Weight, @Weight);
        
        SELECT @UserID AS UserID, 'User created successfully' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END;
GO

-- 5. Stored Procedure to Get User Weekly Progress
CREATE PROCEDURE sp_GetUserWeeklyProgress
    @UserID INT
AS
BEGIN
    SELECT TOP 7
        ProgressDate,
        CurrentWeight,
        WeightLost,
        BMI = (SELECT TOP 1 BMI FROM BMIRecords WHERE UserID = @UserID AND CAST(RecordedDate AS DATE) = ProgressDate ORDER BY RecordedDate DESC)
    FROM UserProgress
    WHERE UserID = @UserID
    ORDER BY ProgressDate DESC;
END;
GO

-- 6. Stored Procedure to Get Foods by Medical Condition
CREATE PROCEDURE sp_GetFoodsByCondition
    @ConditionID INT
AS
BEGIN
    SELECT DISTINCT
        f.FoodID,
        f.FoodName,
        f.Calories,
        f.Protein,
        f.Carbohydrates,
        f.Fat,
        f.Category,
        fcc.IsRecommended,
        fcc.Notes
    FROM Foods f
    INNER JOIN FoodConditionCompatibility fcc ON f.FoodID = fcc.FoodID
    WHERE fcc.ConditionID = @ConditionID AND fcc.IsRecommended = 1
    ORDER BY f.FoodName;
END;
GO

-- 7. Stored Procedure to Generate User Report
CREATE PROCEDURE sp_GenerateUserReport
    @UserID INT,
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SELECT
        u.Username,
        u.Email,
        u.FirstName,
        u.LastName,
        (SELECT TOP 1 BMI FROM BMIRecords WHERE UserID = @UserID ORDER BY RecordedDate DESC) AS CurrentBMI,
        (SELECT TOP 1 BMICategory FROM BMIRecords WHERE UserID = @UserID ORDER BY RecordedDate DESC) AS BMICategory,
        u.Weight,
        u.Height,
        COUNT(DISTINCT CAST(ml.LogDate AS DATE)) AS DaysLogged,
        SUM(ml.CaloriesConsumed) AS TotalCaloriesConsumed,
        AVG(ml.CaloriesConsumed) AS AvgDailyCalories
    FROM Users u
    LEFT JOIN MealLogs ml ON u.UserID = ml.UserID AND ml.LogDate BETWEEN @StartDate AND @EndDate
    WHERE u.UserID = @UserID
    GROUP BY u.UserID, u.Username, u.Email, u.FirstName, u.LastName, u.Weight, u.Height;
END;
GO

-- 8. Stored Procedure for Admin: Get User Statistics
CREATE PROCEDURE sp_AdminGetUserStatistics
AS
BEGIN
    SELECT
        COUNT(*) AS TotalUsers,
        COUNT(CASE WHEN Role = 'ADMIN' THEN 1 END) AS AdminCount,
        COUNT(CASE WHEN IsActive = 1 THEN 1 END) AS ActiveUsers,
        COUNT(CASE WHEN IsActive = 0 THEN 1 END) AS InactiveUsers,
        (SELECT COUNT(*) FROM BMIRecords) AS TotalBMIRecords,
        (SELECT COUNT(*) FROM MealLogs) AS TotalMealLogs
    FROM Users;
END;
GO
