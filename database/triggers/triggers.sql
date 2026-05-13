-- SQL Server Triggers for NutriGuide

-- 1. Trigger to automatically update User UpdatedAt timestamp
CREATE TRIGGER tr_Users_UpdateTimestamp
ON Users
AFTER UPDATE
AS
BEGIN
    UPDATE Users
    SET UpdatedAt = GETDATE()
    WHERE UserID IN (SELECT DISTINCT UserID FROM inserted);
END;
GO

-- 2. Trigger to automatically calculate calories in MealLogs
CREATE TRIGGER tr_MealLogs_CalculateCalories
ON MealLogs
AFTER INSERT, UPDATE
AS
BEGIN
    UPDATE MealLogs
    SET CaloriesConsumed = (SELECT Calories FROM Foods WHERE FoodID = inserted.FoodID) * inserted.Quantity / 100
    FROM inserted
    WHERE MealLogs.MealLogID = inserted.MealLogID;
END;
GO

-- 3. Trigger to automatically update BMI when weight changes
CREATE TRIGGER tr_Users_UpdateBMIOnWeightChange
ON Users
AFTER UPDATE
AS
BEGIN
    DECLARE @UserID INT;
    DECLARE @Height FLOAT;
    DECLARE @Weight FLOAT;
    
    -- Get the updated user data
    SELECT @UserID = UserID, @Height = Height, @Weight = Weight FROM inserted;
    
    -- Check if weight or height has changed
    IF EXISTS (
        SELECT 1 FROM deleted
        WHERE UserID = @UserID AND (Weight <> @Weight OR Height <> @Height)
    )
    BEGIN
        -- Execute BMI calculation procedure
        EXEC sp_CalculateBMI @UserID, @Height, @Weight;
    END
END;
GO

-- 4. Trigger to create audit log for user modifications
CREATE TRIGGER tr_Users_AuditLog
ON Users
AFTER UPDATE, DELETE
AS
BEGIN
    IF UPDATE(PasswordHash) OR UPDATE(Email) OR UPDATE(Weight) OR UPDATE(Height)
    BEGIN
        INSERT INTO AdminLogs (AdminID, Action, TableName, RecordID, OldValue, NewValue, Timestamp)
        SELECT
            ISNULL((SELECT UserID FROM inserted WHERE UserID IN (SELECT UserID FROM deleted)), 0),
            CASE WHEN EXISTS(SELECT 1 FROM deleted) AND NOT EXISTS(SELECT 1 FROM inserted) THEN 'DELETE'
                 ELSE 'UPDATE' END,
            'Users',
            ISNULL((SELECT UserID FROM inserted), (SELECT UserID FROM deleted)),
            CONCAT('Weight: ', (SELECT Weight FROM deleted), ', Height: ', (SELECT Height FROM deleted)),
            CONCAT('Weight: ', (SELECT Weight FROM inserted), ', Height: ', (SELECT Height FROM inserted)),
            GETDATE();
    END
END;
GO

-- 5. Trigger to maintain User Progress records
CREATE TRIGGER tr_MealLogs_UpdateUserProgress
ON MealLogs
AFTER INSERT
AS
BEGIN
    DECLARE @UserID INT;
    DECLARE @LogDate DATE;
    
    SELECT @UserID = UserID, @LogDate = LogDate FROM inserted;
    
    -- Check if progress record exists for this user and date
    IF NOT EXISTS (SELECT 1 FROM UserProgress WHERE UserID = @UserID AND ProgressDate = @LogDate)
    BEGIN
        -- Insert new progress record
        INSERT INTO UserProgress (UserID, CurrentWeight, ProgressDate)
        SELECT @UserID, Weight, @LogDate
        FROM Users
        WHERE UserID = @UserID;
    END
END;
GO

-- 6. Trigger to prevent deletion of active diet plans
CREATE TRIGGER tr_DietPlans_PreventActiveDeletion
ON DietPlans
INSTEAD OF DELETE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM deleted WHERE IsActive = 1)
    BEGIN
        RAISERROR('Cannot delete active diet plans. Deactivate first.', 16, 1);
        ROLLBACK TRANSACTION;
    END
    ELSE
    BEGIN
        DELETE FROM DietPlans
        WHERE DietPlanID IN (SELECT DietPlanID FROM deleted);
    END
END;
GO

-- 7. Trigger to auto-disable diet plan when end date passes
CREATE TRIGGER tr_DietPlans_AutoDisable
ON DietPlans
AFTER INSERT, UPDATE
AS
BEGIN
    UPDATE DietPlans
    SET IsActive = 0
    FROM inserted
    WHERE DietPlans.DietPlanID = inserted.DietPlanID
    AND inserted.EndDate < GETDATE()
    AND inserted.IsActive = 1;
END;
GO

-- 8. Trigger to ensure Food compatibility records
CREATE TRIGGER tr_Foods_OnInsert
ON Foods
AFTER INSERT
AS
BEGIN
    DECLARE @FoodID INT;
    SELECT @FoodID = FoodID FROM inserted;
    
    -- Log creation in AdminLogs
    INSERT INTO AdminLogs (AdminID, Action, TableName, RecordID, NewValue, Timestamp)
    VALUES (1, 'INSERT', 'Foods', @FoodID, (SELECT FoodName FROM Foods WHERE FoodID = @FoodID), GETDATE());
END;
GO

-- 9. Trigger to prevent BMI records with invalid values
CREATE TRIGGER tr_BMIRecords_ValidateData
ON BMIRecords
INSTEAD OF INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE BMI < 10 OR BMI > 100 OR Weight < 20 OR Weight > 300 OR Height < 100 OR Height > 250
    )
    BEGIN
        RAISERROR('Invalid BMI record data', 16, 1);
        ROLLBACK TRANSACTION;
    END
    ELSE
    BEGIN
        INSERT INTO BMIRecords (UserID, BMI, BMICategory, Weight, Height, RecordedDate)
        SELECT UserID, BMI, BMICategory, Weight, Height, RecordedDate FROM inserted;
    END
END;
GO
