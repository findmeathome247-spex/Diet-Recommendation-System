-- Extra Tables for NutriGuide
-- These tables were missing from the initial schema but are used by the backend services

-- Create WaterIntake table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WaterIntake')
BEGIN
    CREATE TABLE WaterIntake (
        WaterIntakeID INT PRIMARY KEY IDENTITY(1,1),
        UserID INT NOT NULL,
        LogDate DATE DEFAULT CAST(GETDATE() AS DATE),
        GlassCount INT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    );
    CREATE INDEX idx_WaterIntake_UserID ON WaterIntake(UserID);
    CREATE INDEX idx_WaterIntake_LogDate ON WaterIntake(LogDate);
END
GO

-- Ensure Goals table exists (renaming or creating from HealthGoals)
-- The dbService uses 'Goals' but schema has 'HealthGoals'
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Goals')
BEGIN
    CREATE TABLE Goals (
        GoalID INT PRIMARY KEY IDENTITY(1,1),
        UserID INT NOT NULL,
        Title NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        TargetValue FLOAT NOT NULL,
        CurrentProgress FLOAT DEFAULT 0,
        Category NVARCHAR(50) DEFAULT 'General',
        DueDate DATE,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    );
    CREATE INDEX idx_Goals_UserID ON Goals(UserID);
END
GO

-- Add missing views if needed
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vw_UserWeeklyProgress')
BEGIN
    EXEC('
    CREATE VIEW vw_UserWeeklyProgress AS
    SELECT 
        UserID,
        CAST(LogDate AS DATE) as ProgressDate,
        SUM(CaloriesConsumed) as TotalCalories
    FROM MealLogs
    WHERE LogDate >= DATEADD(DAY, -7, GETDATE())
    GROUP BY UserID, CAST(LogDate AS DATE)
    ')
END
