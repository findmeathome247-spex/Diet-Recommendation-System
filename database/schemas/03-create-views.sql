-- SQL Server Views for NutriGuide

-- 1. View for User Overview
CREATE VIEW vw_UserOverview AS
SELECT
    u.UserID,
    u.Username,
    u.Email,
    u.FirstName,
    u.LastName,
    u.Age,
    u.Gender,
    u.Height,
    u.Weight,
    (SELECT TOP 1 BMI FROM BMIRecords WHERE UserID = u.UserID ORDER BY RecordedDate DESC) AS CurrentBMI,
    (SELECT TOP 1 BMICategory FROM BMIRecords WHERE UserID = u.UserID ORDER BY RecordedDate DESC) AS BMICategory,
    u.CreatedAt,
    u.IsActive,
    u.Role
FROM Users u;

-- 2. View for User Meal History
CREATE VIEW vw_UserMealHistory AS
SELECT
    ml.MealLogID,
    u.UserID,
    u.Username,
    f.FoodID,
    f.FoodName,
    ml.Meal,
    ml.Quantity,
    f.Calories,
    ml.CaloriesConsumed,
    f.Protein,
    f.Carbohydrates,
    f.Fat,
    ml.LogDate,
    ml.LogTime
FROM MealLogs ml
INNER JOIN Users u ON ml.UserID = u.UserID
INNER JOIN Foods f ON ml.FoodID = f.FoodID;

-- 3. View for Daily Calorie Summary
CREATE VIEW vw_DailyCalorieSummary AS
SELECT
    ml.UserID,
    u.Username,
    ml.LogDate,
    ml.Meal,
    COUNT(*) AS FoodCount,
    SUM(ml.CaloriesConsumed) AS TotalCalories,
    AVG(f.Protein) AS AvgProtein,
    AVG(f.Carbohydrates) AS AvgCarbs,
    AVG(f.Fat) AS AvgFat
FROM MealLogs ml
INNER JOIN Users u ON ml.UserID = u.UserID
INNER JOIN Foods f ON ml.FoodID = f.FoodID
GROUP BY ml.UserID, u.Username, ml.LogDate, ml.Meal;

-- 4. View for User Progress Report
CREATE VIEW vw_UserProgressReport AS
SELECT
    up.UserID,
    u.Username,
    u.Email,
    up.StartWeight,
    up.CurrentWeight,
    up.TargetWeight,
    (up.StartWeight - up.CurrentWeight) AS WeightLost,
    (up.TargetWeight - up.CurrentWeight) AS RemainingToTarget,
    CASE
        WHEN up.TargetWeight = up.CurrentWeight THEN 'Goal Reached'
        WHEN up.CurrentWeight < up.TargetWeight THEN 'On Track'
        ELSE 'Need Progress'
    END AS Status,
    up.ProgressDate,
    up.ProgressNote
FROM UserProgress up
INNER JOIN Users u ON up.UserID = u.UserID;

-- 5. View for BMI Category Distribution
CREATE VIEW vw_BMICategoryDistribution AS
SELECT
    br.BMICategory,
    COUNT(DISTINCT br.UserID) AS UserCount,
    ROUND(AVG(br.BMI), 2) AS AvgBMI,
    ROUND(MIN(br.BMI), 2) AS MinBMI,
    ROUND(MAX(br.BMI), 2) AS MaxBMI
FROM BMIRecords br
GROUP BY br.BMICategory;

-- 6. View for Food Nutritional Summary
CREATE VIEW vw_FoodNutritionSummary AS
SELECT
    FoodID,
    FoodName,
    Category,
    Calories,
    Protein,
    Carbohydrates,
    Fat,
    Fiber,
    ServingSize,
    (Protein * 4 + Carbohydrates * 4 + Fat * 9) AS TotalCaloriesCalculated,
    CASE
        WHEN (Protein * 4) / (Protein * 4 + Carbohydrates * 4 + Fat * 9) * 100 > 30 THEN 'High Protein'
        WHEN (Carbohydrates * 4) / (Protein * 4 + Carbohydrates * 4 + Fat * 9) * 100 > 60 THEN 'High Carbs'
        WHEN (Fat * 9) / (Protein * 4 + Carbohydrates * 4 + Fat * 9) * 100 > 30 THEN 'High Fat'
        ELSE 'Balanced'
    END AS MacroProfile
FROM Foods;

-- 7. View for Medical Conditions and Compatible Foods
CREATE VIEW vw_ConditionFoodCompatibility AS
SELECT
    mc.ConditionID,
    mc.ConditionName,
    mc.Description,
    f.FoodID,
    f.FoodName,
    fcc.IsRecommended,
    fcc.Notes,
    f.Calories,
    f.Protein,
    f.Carbohydrates,
    f.Fat
FROM MedicalConditions mc
LEFT JOIN FoodConditionCompatibility fcc ON mc.ConditionID = fcc.ConditionID
LEFT JOIN Foods f ON fcc.FoodID = f.FoodID;

-- 8. View for User Medical Conditions
CREATE VIEW vw_UserMedicalConditions AS
SELECT
    u.UserID,
    u.Username,
    u.Email,
    mc.ConditionID,
    mc.ConditionName,
    mc.Description,
    mc.DietaryRestrictions,
    umc.DiagnosedDate
FROM Users u
LEFT JOIN UserMedicalConditions umc ON u.UserID = umc.UserID
LEFT JOIN MedicalConditions mc ON umc.ConditionID = mc.ConditionID;

-- 9. View for Active Diet Plans
CREATE VIEW vw_ActiveDietPlans AS
SELECT
    dp.DietPlanID,
    u.UserID,
    u.Username,
    u.Email,
    dp.BMICategory,
    dp.TargetCalories,
    hg.GoalName,
    hg.TargetCalories AS GoalCalories,
    dp.StartDate,
    dp.EndDate,
    DATEDIFF(DAY, GETDATE(), dp.EndDate) AS DaysRemaining,
    dp.IsActive
FROM DietPlans dp
INNER JOIN Users u ON dp.UserID = u.UserID
INNER JOIN HealthGoals hg ON dp.HealthGoalID = hg.GoalID
WHERE dp.IsActive = 1;

-- 10. View for Daily Nutritional Balance
CREATE VIEW vw_DailyNutritionBalance AS
SELECT
    ml.UserID,
    u.Username,
    ml.LogDate,
    SUM(ml.CaloriesConsumed) AS TotalCalories,
    SUM(f.Protein * ml.Quantity / 100) AS TotalProtein,
    SUM(f.Carbohydrates * ml.Quantity / 100) AS TotalCarbs,
    SUM(f.Fat * ml.Quantity / 100) AS TotalFat,
    SUM(f.Fiber * ml.Quantity / 100) AS TotalFiber,
    COUNT(DISTINCT ml.Meal) AS MealsLogged,
    ROUND(
        CAST(SUM(f.Protein * ml.Quantity / 100) * 4 AS FLOAT) / 
        NULLIF(SUM(ml.CaloriesConsumed), 0) * 100, 2
    ) AS ProteinPercentage,
    ROUND(
        CAST(SUM(f.Carbohydrates * ml.Quantity / 100) * 4 AS FLOAT) / 
        NULLIF(SUM(ml.CaloriesConsumed), 0) * 100, 2
    ) AS CarbsPercentage,
    ROUND(
        CAST(SUM(f.Fat * ml.Quantity / 100) * 9 AS FLOAT) / 
        NULLIF(SUM(ml.CaloriesConsumed), 0) * 100, 2
    ) AS FatPercentage
FROM MealLogs ml
INNER JOIN Users u ON ml.UserID = u.UserID
INNER JOIN Foods f ON ml.FoodID = f.FoodID
GROUP BY ml.UserID, u.Username, ml.LogDate;

-- 11. View for Admin Dashboard Statistics
CREATE VIEW vw_AdminDashboard AS
SELECT
    'Total Users' AS Metric,
    CAST(COUNT(DISTINCT UserID) AS NVARCHAR(20)) AS Value
FROM Users
UNION ALL
SELECT
    'Active Users',
    CAST(COUNT(DISTINCT UserID) AS NVARCHAR(20))
FROM Users
WHERE IsActive = 1
UNION ALL
SELECT
    'Total Meal Logs',
    CAST(COUNT(*) AS NVARCHAR(20))
FROM MealLogs
UNION ALL
SELECT
    'Foods in Database',
    CAST(COUNT(*) AS NVARCHAR(20))
FROM Foods
UNION ALL
SELECT
    'Active Diet Plans',
    CAST(COUNT(*) AS NVARCHAR(20))
FROM DietPlans
WHERE IsActive = 1;
