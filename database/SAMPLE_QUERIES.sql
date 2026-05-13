-- Sample SQL Queries for NutriGuide

-- 1. Get all users with their latest BMI
SELECT 
    u.UserID,
    u.Username,
    u.Email,
    br.BMI,
    br.BMICategory,
    u.Weight,
    u.Height
FROM Users u
LEFT JOIN (
    SELECT UserID, BMI, BMICategory, Weight, Height,
           ROW_NUMBER() OVER (PARTITION BY UserID ORDER BY RecordedDate DESC) as rn
    FROM BMIRecords
) br ON u.UserID = br.UserID AND br.rn = 1
ORDER BY u.Username;

-- 2. Get users with specific medical conditions
SELECT 
    u.Username,
    u.Email,
    mc.ConditionName,
    mc.Description,
    umc.DiagnosedDate
FROM Users u
INNER JOIN UserMedicalConditions umc ON u.UserID = umc.UserID
INNER JOIN MedicalConditions mc ON umc.ConditionID = mc.ConditionID
WHERE mc.ConditionName = 'Diabetes'
ORDER BY u.Username;

-- 3. Calculate daily calorie intake for a specific user
SELECT 
    u.Username,
    CAST(ml.LogDate AS DATE) AS Date,
    ml.Meal,
    COUNT(*) AS FoodCount,
    SUM(ml.CaloriesConsumed) AS TotalCalories
FROM MealLogs ml
INNER JOIN Users u ON ml.UserID = u.UserID
WHERE u.UserID = 1
GROUP BY u.Username, CAST(ml.LogDate AS DATE), ml.Meal
ORDER BY Date DESC, 
    CASE 
        WHEN ml.Meal = 'Breakfast' THEN 1
        WHEN ml.Meal = 'Lunch' THEN 2
        WHEN ml.Meal = 'Dinner' THEN 3
        ELSE 4
    END;

-- 4. Find recommended foods for users with diabetes
SELECT DISTINCT
    f.FoodName,
    f.Calories,
    f.Protein,
    f.Carbohydrates,
    f.Fat,
    f.Category,
    'Recommended for Diabetes' AS Recommendation
FROM Foods f
INNER JOIN FoodConditionCompatibility fcc ON f.FoodID = fcc.FoodID
INNER JOIN MedicalConditions mc ON fcc.ConditionID = mc.ConditionID
WHERE mc.ConditionName = 'Diabetes' AND fcc.IsRecommended = 1
ORDER BY f.FoodName;

-- 5. Get user progress over time
SELECT TOP 10
    u.Username,
    up.ProgressDate,
    up.StartWeight,
    up.CurrentWeight,
    up.TargetWeight,
    (up.StartWeight - up.CurrentWeight) AS WeightLost,
    ROUND(100.0 * (up.StartWeight - up.CurrentWeight) / NULLIF(up.StartWeight - up.TargetWeight, 0), 2) AS ProgressPercentage
FROM UserProgress up
INNER JOIN Users u ON up.UserID = u.UserID
WHERE u.UserID = 1
ORDER BY up.ProgressDate DESC;

-- 6. BMI Category Distribution
SELECT 
    br.BMICategory,
    COUNT(DISTINCT br.UserID) AS UserCount,
    ROUND(AVG(br.BMI), 2) AS AvgBMI,
    ROUND(MIN(br.BMI), 2) AS MinBMI,
    ROUND(MAX(br.BMI), 2) AS MaxBMI
FROM BMIRecords br
GROUP BY br.BMICategory
ORDER BY 
    CASE 
        WHEN br.BMICategory = 'Underweight' THEN 1
        WHEN br.BMICategory = 'Normal' THEN 2
        WHEN br.BMICategory = 'Overweight' THEN 3
        WHEN br.BMICategory = 'Obese' THEN 4
    END;

-- 7. Get active diet plans with associated foods
SELECT 
    dp.DietPlanID,
    u.Username,
    hg.GoalName,
    dp.BMICategory,
    dp.TargetCalories,
    dp.StartDate,
    dp.EndDate,
    dpi.Meal,
    f.FoodName,
    f.Calories,
    dpi.Quantity
FROM DietPlans dp
INNER JOIN Users u ON dp.UserID = u.UserID
INNER JOIN HealthGoals hg ON dp.HealthGoalID = hg.GoalID
INNER JOIN DietPlanItems dpi ON dp.DietPlanID = dpi.DietPlanID
INNER JOIN Foods f ON dpi.FoodID = f.FoodID
WHERE dp.IsActive = 1
ORDER BY u.Username, dpi.Meal;

-- 8. High calorie foods (potential health warning)
SELECT TOP 10
    FoodName,
    Category,
    Calories,
    Protein,
    Carbohydrates,
    Fat,
    Fiber
FROM Foods
WHERE Calories > 250
ORDER BY Calories DESC;

-- 9. Low calorie, high protein foods (good for weight loss)
SELECT 
    FoodName,
    Category,
    Calories,
    Protein,
    Carbohydrates,
    Fat,
    ROUND(CAST(Protein * 4 AS FLOAT) / NULLIF(Calories, 0) * 100, 2) AS ProteinPercentage
FROM Foods
WHERE Calories < 150 AND Protein > 10
ORDER BY ProteinPercentage DESC;

-- 10. Get users not logging meals recently
SELECT 
    u.UserID,
    u.Username,
    u.Email,
    MAX(ml.LogDate) AS LastMealLogged,
    DATEDIFF(DAY, MAX(ml.LogDate), CAST(GETDATE() AS DATE)) AS DaysSinceLastLog
FROM Users u
LEFT JOIN MealLogs ml ON u.UserID = ml.UserID
WHERE u.IsActive = 1
GROUP BY u.UserID, u.Username, u.Email
HAVING MAX(ml.LogDate) < DATEADD(DAY, -7, CAST(GETDATE() AS DATE)) OR MAX(ml.LogDate) IS NULL
ORDER BY DaysSinceLastLog DESC;

-- 11. Daily nutrition macro breakdown for a user
SELECT 
    CAST(ml.LogDate AS DATE) AS Date,
    SUM(ml.CaloriesConsumed) AS TotalCalories,
    ROUND(SUM(f.Protein * ml.Quantity / 100), 1) AS TotalProtein,
    ROUND(SUM(f.Carbohydrates * ml.Quantity / 100), 1) AS TotalCarbs,
    ROUND(SUM(f.Fat * ml.Quantity / 100), 1) AS TotalFat,
    ROUND(CAST(SUM(f.Protein * ml.Quantity / 100) * 4 AS FLOAT) / NULLIF(SUM(ml.CaloriesConsumed), 0) * 100, 1) AS ProteinPercent,
    ROUND(CAST(SUM(f.Carbohydrates * ml.Quantity / 100) * 4 AS FLOAT) / NULLIF(SUM(ml.CaloriesConsumed), 0) * 100, 1) AS CarbsPercent,
    ROUND(CAST(SUM(f.Fat * ml.Quantity / 100) * 9 AS FLOAT) / NULLIF(SUM(ml.CaloriesConsumed), 0) * 100, 1) AS FatPercent
FROM MealLogs ml
INNER JOIN Foods f ON ml.FoodID = f.FoodID
WHERE ml.UserID = 1 AND ml.LogDate >= DATEADD(DAY, -30, CAST(GETDATE() AS DATE))
GROUP BY CAST(ml.LogDate AS DATE)
ORDER BY Date DESC;

-- 12. Get trending foods (most logged in last 7 days)
SELECT TOP 10
    f.FoodName,
    f.Category,
    COUNT(*) AS TimesLogged,
    ROUND(AVG(f.Calories), 0) AS AvgCalories,
    COUNT(DISTINCT ml.UserID) AS UniqueUsers
FROM MealLogs ml
INNER JOIN Foods f ON ml.FoodID = f.FoodID
WHERE ml.LogDate >= DATEADD(DAY, -7, CAST(GETDATE() AS DATE))
GROUP BY f.FoodID, f.FoodName, f.Category
ORDER BY COUNT(*) DESC;

-- 13. User weight loss progress (last 30 days)
SELECT 
    u.Username,
    MIN(up.CurrentWeight) AS MinWeight,
    MAX(up.CurrentWeight) AS MaxWeight,
    MAX(up.CurrentWeight) - MIN(up.CurrentWeight) AS WeightGain,
    MIN(up.CurrentWeight) - MAX(up.CurrentWeight) AS WeightLoss,
    DATEDIFF(DAY, MIN(up.ProgressDate), MAX(up.ProgressDate)) AS DaysTracked
FROM UserProgress up
INNER JOIN Users u ON up.UserID = u.UserID
WHERE up.ProgressDate >= DATEADD(DAY, -30, CAST(GETDATE() AS DATE))
GROUP BY u.UserID, u.Username
ORDER BY WeightLoss DESC;

-- 14. Average daily calorie intake by BMI category
SELECT 
    br.BMICategory,
    ROUND(AVG(DailyCals.TotalCalories), 0) AS AvgDailyCalories,
    COUNT(DISTINCT DailyCals.UserID) AS UserCount
FROM (
    SELECT 
        ml.UserID,
        CAST(ml.LogDate AS DATE) AS LogDate,
        SUM(ml.CaloriesConsumed) AS TotalCalories
    FROM MealLogs ml
    GROUP BY ml.UserID, CAST(ml.LogDate AS DATE)
) DailyCals
INNER JOIN (
    SELECT UserID, BMICategory,
           ROW_NUMBER() OVER (PARTITION BY UserID ORDER BY RecordedDate DESC) as rn
    FROM BMIRecords
) br ON DailyCals.UserID = br.UserID AND br.rn = 1
GROUP BY br.BMICategory
ORDER BY AvgDailyCalories DESC;

-- 15. Admin: System activity report (last 7 days)
SELECT 
    'Total Users' AS Metric,
    CAST(COUNT(DISTINCT UserID) AS NVARCHAR(20)) AS Value
FROM Users
UNION ALL
SELECT 
    'Active Users Last 7 Days',
    CAST(COUNT(DISTINCT UserID) AS NVARCHAR(20))
FROM MealLogs
WHERE LogDate >= DATEADD(DAY, -7, CAST(GETDATE() AS DATE))
UNION ALL
SELECT 
    'Total Meals Logged',
    CAST(COUNT(*) AS NVARCHAR(20))
FROM MealLogs
UNION ALL
SELECT 
    'Active Diet Plans',
    CAST(COUNT(*) AS NVARCHAR(20))
FROM DietPlans
WHERE IsActive = 1
UNION ALL
SELECT 
    'Foods in Database',
    CAST(COUNT(*) AS NVARCHAR(20))
FROM Foods;
