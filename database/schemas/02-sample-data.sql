-- Sample Data for NutriGuide Database

-- Insert Medical Conditions
INSERT INTO MedicalConditions (ConditionName, Description, DietaryRestrictions)
VALUES
('Diabetes', 'Blood sugar regulation disorder', 'Low sugar, High fiber'),
('Hypertension', 'High blood pressure', 'Low sodium, Low fat'),
('High Cholesterol', 'Elevated cholesterol levels', 'Low saturated fat, High fiber'),
('Heart Disease', 'Cardiovascular disease', 'Low fat, Low sodium, Low cholesterol'),
('Obesity', 'Excess body weight', 'Low calorie, High protein'),
('Celiac Disease', 'Gluten sensitivity', 'Gluten-free foods'),
('Lactose Intolerance', 'Milk sugar intolerance', 'Dairy-free products'),
('PCOS', 'Polycystic ovary syndrome', 'Low glycemic index, High fiber');

-- Insert Health Goals
INSERT INTO HealthGoals (GoalName, Description, TargetCalories, RecommendedDuration)
VALUES
('Weight Loss', 'Reduce body weight safely', 1800, 90),
('Weight Gain', 'Healthy weight increase', 2500, 90),
('Muscle Gain', 'Build lean muscle mass', 2800, 120),
('Weight Maintenance', 'Maintain current weight', 2200, 365),
('Athletic Performance', 'Optimize athletic performance', 2600, 180),
('General Health', 'Improve overall health', 2000, 365);

-- Insert Sample Foods
INSERT INTO Foods (FoodName, Calories, Protein, Carbohydrates, Fat, Fiber, ServingSize, Category)
VALUES
-- Breakfast Foods
('Oatmeal', 150, 5, 27, 3, 4, '1 cup cooked', 'Breakfast'),
('Eggs (2)', 155, 13, 1, 11, 2, '2 large eggs', 'Breakfast'),
('Whole Wheat Toast', 80, 4, 14, 1, 2, '1 slice', 'Breakfast'),
('Almond Butter', 98, 3, 3, 9, 1, '1 tbsp', 'Breakfast'),
('Low-fat Yogurt', 100, 17, 7, 0, 0, '6 oz', 'Breakfast'),
('Banana', 89, 1, 23, 0, 3, '1 medium', 'Breakfast'),
('Blueberries', 42, 0, 11, 0, 2, '1 cup', 'Breakfast'),
('Honey', 64, 0, 17, 0, 0, '1 tbsp', 'Breakfast'),

-- Lunch Foods
('Chicken Breast', 165, 31, 0, 3, 0, '100g cooked', 'Lunch'),
('Brown Rice', 111, 3, 23, 1, 2, '1 cup cooked', 'Lunch'),
('Salmon', 280, 25, 0, 20, 0, '100g', 'Lunch'),
('Broccoli', 55, 4, 11, 0, 2, '1 cup cooked', 'Lunch'),
('Sweet Potato', 86, 2, 20, 0, 3, '1 medium', 'Lunch'),
('Tuna', 132, 30, 0, 1, 0, '100g canned', 'Lunch'),
('Spinach', 7, 1, 1, 0, 1, '1 cup raw', 'Lunch'),
('Olive Oil', 119, 0, 0, 14, 0, '1 tbsp', 'Lunch'),

-- Dinner Foods
('Lean Ground Beef', 180, 27, 0, 8, 0, '100g', 'Dinner'),
('Turkey Breast', 165, 29, 0, 4, 0, '100g', 'Dinner'),
('Tofu', 76, 8, 2, 5, 1, '100g', 'Dinner'),
('Quinoa', 111, 4, 20, 2, 3, '1 cup cooked', 'Dinner'),
('Carrots', 25, 0, 6, 0, 2, '1 cup raw', 'Dinner'),
('Cabbage', 22, 1, 5, 0, 1, '1 cup raw', 'Dinner'),
('Garlic', 4, 0, 1, 0, 0, '1 clove', 'Dinner'),
('Tomato', 18, 1, 4, 0, 1, '1 medium', 'Dinner'),

-- Snacks
('Apple', 95, 0, 25, 0, 4, '1 medium', 'Snack'),
('Almonds', 164, 6, 6, 14, 3, '1 oz (23 nuts)', 'Snack'),
('Greek Yogurt', 130, 23, 9, 0, 0, '7 oz', 'Snack'),
('Whole Grain Crackers', 110, 3, 20, 2, 3, '5 crackers', 'Snack'),
('Peanut Butter', 95, 4, 3, 8, 1, '1 tbsp', 'Snack'),
('Dark Chocolate', 170, 2, 16, 12, 2, '1 oz', 'Snack'),
('Orange', 62, 1, 15, 0, 3, '1 medium', 'Snack'),
('Cheese', 113, 7, 0, 9, 0, '1 oz', 'Snack');

-- Insert Food-Condition Compatibility
INSERT INTO FoodConditionCompatibility (FoodID, ConditionID, IsRecommended, Notes)
VALUES
-- For Diabetes (ConditionID = 1)
(3, 1, 1, 'Whole grain - low glycemic index'),
(6, 1, 1, 'High fiber content'),
(19, 1, 1, 'High protein, low carbs'),
(33, 1, 0, 'Contains sugar'),

-- For Hypertension (ConditionID = 2)
(8, 2, 1, 'Low sodium'),
(7, 2, 1, 'Low salt'),
(21, 2, 0, 'High sodium if processed'),

-- For High Cholesterol (ConditionID = 3)
(12, 3, 1, 'Omega-3 fatty acids'),
(13, 3, 1, 'Soluble fiber'),
(9, 3, 1, 'High fiber'),

-- For Heart Disease (ConditionID = 4)
(12, 4, 1, 'Heart-healthy omega-3s'),
(19, 4, 1, 'Lean protein'),
(27, 4, 0, 'High saturated fat');

-- Create sample user (password should be hashed in real application)
-- This is a demonstration - replace with actual hashed password
INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Age, Gender, Height, Weight, Role)
VALUES
('johndoe', 'john@example.com', 'hashed_password_here_123', 'John', 'Doe', 30, 'Male', 175, 85, 'USER'),
('janedoe', 'jane@example.com', 'hashed_password_here_456', 'Jane', 'Doe', 28, 'Female', 165, 65, 'USER'),
('admin', 'admin@example.com', 'hashed_admin_password_789', 'Admin', 'User', 35, 'Male', 180, 80, 'ADMIN');

-- Insert medical conditions for users
INSERT INTO UserMedicalConditions (UserID, ConditionID, DiagnosedDate)
VALUES
(1, 1, '2023-01-15'), -- John has Diabetes
(1, 2, '2023-06-20'), -- John has Hypertension
(2, 3, '2023-03-10'); -- Jane has High Cholesterol

-- Calculate BMI for sample users
EXEC sp_CalculateBMI 1, 175, 85;
EXEC sp_CalculateBMI 2, 165, 65;

-- Insert sample meal logs
INSERT INTO MealLogs (UserID, FoodID, Meal, Quantity, CaloriesConsumed, LogDate)
VALUES
(1, 1, 'Breakfast', 100, 150, CAST(GETDATE() AS DATE)),
(1, 2, 'Breakfast', 100, 155, CAST(GETDATE() AS DATE)),
(1, 10, 'Lunch', 100, 165, CAST(GETDATE() AS DATE)),
(1, 13, 'Lunch', 100, 111, CAST(GETDATE() AS DATE)),
(1, 29, 'Snack', 100, 95, CAST(GETDATE() AS DATE)),
(2, 1, 'Breakfast', 100, 150, CAST(GETDATE() AS DATE)),
(2, 6, 'Breakfast', 100, 89, CAST(GETDATE() AS DATE));

-- Insert sample health goal assignment
INSERT INTO UserProgress (UserID, StartWeight, CurrentWeight, TargetWeight, ProgressDate)
VALUES
(1, 85, 85, 75, CAST(GETDATE() AS DATE)),
(2, 65, 65, 60, CAST(GETDATE() AS DATE));

-- Create sample diet plans
INSERT INTO DietPlans (UserID, HealthGoalID, BMICategory, TargetCalories, StartDate, EndDate, IsActive)
VALUES
(1, 1, 'Overweight', 1800, CAST(GETDATE() AS DATE), DATEADD(DAY, 90, CAST(GETDATE() AS DATE)), 1),
(2, 1, 'Normal', 1800, CAST(GETDATE() AS DATE), DATEADD(DAY, 90, CAST(GETDATE() AS DATE)), 1);

-- Insert sample diet plan items
INSERT INTO DietPlanItems (DietPlanID, FoodID, Meal, Quantity)
VALUES
(1, 1, 'Breakfast', 1),
(1, 2, 'Breakfast', 2),
(1, 10, 'Lunch', 100),
(1, 13, 'Lunch', 100),
(1, 29, 'Snack', 1),
(2, 1, 'Breakfast', 1),
(2, 6, 'Breakfast', 1),
(2, 12, 'Lunch', 150),
(2, 13, 'Lunch', 100);
