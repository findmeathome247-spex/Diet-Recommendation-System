-- NutriGuide Database Schema
-- SQL Server script for creating all tables with relationships

-- Create Users table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Age INT NOT NULL,
    Gender NVARCHAR(10) NOT NULL,
    Height FLOAT NOT NULL, -- in cm
    Weight FLOAT NOT NULL, -- in kg
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1,
    Role NVARCHAR(20) DEFAULT 'USER' -- USER or ADMIN
);

-- Create BMIRecords table
CREATE TABLE BMIRecords (
    BMIRecordID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    BMI FLOAT NOT NULL,
    BMICategory NVARCHAR(20) NOT NULL, -- Underweight, Normal, Overweight, Obese
    Weight FLOAT NOT NULL,
    Height FLOAT NOT NULL,
    RecordedDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Create Medical Conditions table
CREATE TABLE MedicalConditions (
    ConditionID INT PRIMARY KEY IDENTITY(1,1),
    ConditionName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    DietaryRestrictions NVARCHAR(500)
);

-- Create Junction table for User Medical Conditions (Many-to-Many)
CREATE TABLE UserMedicalConditions (
    UserConditionID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    ConditionID INT NOT NULL,
    DiagnosedDate DATETIME,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ConditionID) REFERENCES MedicalConditions(ConditionID),
    UNIQUE(UserID, ConditionID)
);

-- Create Health Goals table
CREATE TABLE HealthGoals (
    GoalID INT PRIMARY KEY IDENTITY(1,1),
    GoalName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    TargetCalories INT,
    RecommendedDuration INT -- in days
);

-- Create Food table
CREATE TABLE Foods (
    FoodID INT PRIMARY KEY IDENTITY(1,1),
    FoodName NVARCHAR(100) NOT NULL,
    Calories INT NOT NULL,
    Protein FLOAT NOT NULL, -- in grams
    Carbohydrates FLOAT NOT NULL, -- in grams
    Fat FLOAT NOT NULL, -- in grams
    Fiber FLOAT DEFAULT 0,
    ServingSize NVARCHAR(50),
    Category NVARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Diet Plans table
CREATE TABLE DietPlans (
    DietPlanID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    HealthGoalID INT NOT NULL,
    BMICategory NVARCHAR(20) NOT NULL,
    TargetCalories INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    StartDate DATETIME NOT NULL,
    EndDate DATETIME,
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (HealthGoalID) REFERENCES HealthGoals(GoalID)
);

-- Create DietPlan Items (junction table for foods in diet plans)
CREATE TABLE DietPlanItems (
    DietPlanItemID INT PRIMARY KEY IDENTITY(1,1),
    DietPlanID INT NOT NULL,
    FoodID INT NOT NULL,
    Meal NVARCHAR(20) NOT NULL, -- Breakfast, Lunch, Dinner, Snack
    Quantity INT NOT NULL,
    FOREIGN KEY (DietPlanID) REFERENCES DietPlans(DietPlanID) ON DELETE CASCADE,
    FOREIGN KEY (FoodID) REFERENCES Foods(FoodID)
);

-- Create Meal Logs table
CREATE TABLE MealLogs (
    MealLogID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    FoodID INT NOT NULL,
    Meal NVARCHAR(20) NOT NULL, -- Breakfast, Lunch, Dinner, Snack
    Quantity INT NOT NULL,
    CaloriesConsumed INT,
    LogDate DATE DEFAULT CAST(GETDATE() AS DATE),
    LogTime DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (FoodID) REFERENCES Foods(FoodID)
);

-- Create User Progress table
CREATE TABLE UserProgress (
    ProgressID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    StartWeight FLOAT,
    CurrentWeight FLOAT,
    TargetWeight FLOAT,
    WeightLost FLOAT,
    ProgressDate DATE DEFAULT CAST(GETDATE() AS DATE),
    ProgressNote NVARCHAR(500),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Create Food Condition Compatibility table
CREATE TABLE FoodConditionCompatibility (
    CompatibilityID INT PRIMARY KEY IDENTITY(1,1),
    FoodID INT NOT NULL,
    ConditionID INT NOT NULL,
    IsRecommended BIT DEFAULT 1,
    Notes NVARCHAR(500),
    FOREIGN KEY (FoodID) REFERENCES Foods(FoodID) ON DELETE CASCADE,
    FOREIGN KEY (ConditionID) REFERENCES MedicalConditions(ConditionID) ON DELETE CASCADE,
    UNIQUE(FoodID, ConditionID)
);

-- Create Admin Log table for audit trail
CREATE TABLE AdminLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    AdminID INT NOT NULL,
    Action NVARCHAR(100) NOT NULL,
    TableName NVARCHAR(100) NOT NULL,
    RecordID INT,
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    Timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AdminID) REFERENCES Users(UserID)
);

-- Create indexes for performance optimization
CREATE INDEX idx_Users_Email ON Users(Email);
CREATE INDEX idx_Users_Username ON Users(Username);
CREATE INDEX idx_BMIRecords_UserID ON BMIRecords(UserID);
CREATE INDEX idx_BMIRecords_RecordedDate ON BMIRecords(RecordedDate);
CREATE INDEX idx_UserMedicalConditions_UserID ON UserMedicalConditions(UserID);
CREATE INDEX idx_MealLogs_UserID ON MealLogs(UserID);
CREATE INDEX idx_MealLogs_LogDate ON MealLogs(LogDate);
CREATE INDEX idx_DietPlans_UserID ON DietPlans(UserID);
CREATE INDEX idx_DietPlans_IsActive ON DietPlans(IsActive);
CREATE INDEX idx_UserProgress_UserID ON UserProgress(UserID);
CREATE INDEX idx_Foods_Category ON Foods(Category);
CREATE INDEX idx_Foods_Calories ON Foods(Calories);
