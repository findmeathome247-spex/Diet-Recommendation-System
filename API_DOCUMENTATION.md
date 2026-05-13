# NutriGuide API Documentation

Complete REST API reference for the NutriGuide Diet Recommendation System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Authentication Endpoints

### 1. User Registration

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "age": 30,
  "gender": "Male",
  "height": 175,
  "weight": 85
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userID": 1
}
```

**Errors:**
- 400: Missing required fields
- 500: Registration failed

---

### 2. User Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userID": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

**Errors:**
- 400: Missing credentials
- 401: Invalid credentials
- 500: Authentication failed

---

## Profile Endpoints

### 3. Get User Profile

**GET** `/profile`

Retrieve authenticated user's profile information.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "UserID": 1,
  "Username": "johndoe",
  "Email": "john@example.com",
  "FirstName": "John",
  "LastName": "Doe",
  "Age": 30,
  "Gender": "Male",
  "Height": 175,
  "Weight": 85,
  "CreatedAt": "2024-01-15T10:30:00",
  "Role": "USER"
}
```

**Errors:**
- 401: Unauthorized
- 404: User not found

---

### 4. Update User Profile

**PUT** `/profile`

Update authenticated user's profile information.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "age": 31,
  "gender": "Male",
  "height": 175,
  "weight": 82
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully"
}
```

**Errors:**
- 400: Invalid data
- 401: Unauthorized
- 500: Update failed

---

## BMI Endpoints

### 5. Get Current BMI

**GET** `/bmi/current`

Retrieve the user's latest BMI record.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "BMI": 27.76,
  "BMICategory": "Overweight",
  "Weight": 85,
  "Height": 175,
  "RecordedDate": "2024-01-20T14:30:00"
}
```

**Errors:**
- 401: Unauthorized
- 404: No BMI record found

---

### 6. Calculate BMI

**POST** `/bmi/calculate`

Calculate and save a new BMI record.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "height": 175,
  "weight": 82
}
```

**Response (200):**
```json
{
  "message": "BMI calculated successfully",
  "BMI": 26.73,
  "BMICategory": "Overweight"
}
```

**Errors:**
- 400: Invalid height/weight
- 401: Unauthorized
- 500: Calculation failed

---

### 7. Get BMI History

**GET** `/bmi/history`

Retrieve all BMI records for the authenticated user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "BMI": 26.73,
    "BMICategory": "Overweight",
    "Weight": 82,
    "Height": 175,
    "RecordedDate": "2024-01-20T14:30:00"
  },
  {
    "BMI": 27.76,
    "BMICategory": "Overweight",
    "Weight": 85,
    "Height": 175,
    "RecordedDate": "2024-01-15T10:30:00"
  }
]
```

---

## Diet Endpoints

### 8. Get Diet Recommendation

**GET** `/diet/recommendation`

Get personalized diet recommendations based on BMI and conditions.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Diet recommendation retrieved",
  "foods": [
    {
      "FoodID": 10,
      "FoodName": "Chicken Breast",
      "Calories": 165,
      "Protein": 31,
      "Carbohydrates": 0,
      "Fat": 3,
      "Category": "Lunch"
    },
    ...
  ]
}
```

---

### 9. Get Active Diet Plan

**GET** `/diet/active-plan`

Retrieve user's active diet plan with associated foods.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "DietPlanID": 1,
  "BMICategory": "Overweight",
  "TargetCalories": 1800,
  "GoalName": "Weight Loss",
  "StartDate": "2024-01-15",
  "EndDate": "2024-04-15",
  "IsActive": 1,
  "items": [
    {
      "DietPlanItemID": 1,
      "FoodID": 1,
      "FoodName": "Oatmeal",
      "Calories": 150,
      "Protein": 5,
      "Carbohydrates": 27,
      "Fat": 3,
      "Meal": "Breakfast",
      "Quantity": 100
    }
  ]
}
```

---

### 10. Create Diet Plan

**POST** `/diet/create-plan`

Create a new diet plan for the user.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "healthGoalID": 1,
  "bmiBCategory": "Overweight",
  "targetCalories": 1800
}
```

**Response (201):**
```json
{
  "message": "Diet plan created successfully",
  "dietPlanID": 1
}
```

---

## Food Endpoints

### 11. Get All Foods

**GET** `/foods?category=Breakfast&minCalories=50&maxCalories=200`

Get foods with optional filters.

**Query Parameters:**
- `category` (optional): Filter by food category
- `minCalories` (optional): Minimum calories
- `maxCalories` (optional): Maximum calories

**Response (200):**
```json
[
  {
    "FoodID": 1,
    "FoodName": "Oatmeal",
    "Calories": 150,
    "Protein": 5,
    "Carbohydrates": 27,
    "Fat": 3,
    "Fiber": 4,
    "ServingSize": "1 cup cooked",
    "Category": "Breakfast"
  },
  ...
]
```

---

### 12. Search Foods

**GET** `/foods/search?search=chicken`

Search foods by name.

**Query Parameters:**
- `search` (required): Search term

**Response (200):**
```json
[
  {
    "FoodID": 10,
    "FoodName": "Chicken Breast",
    "Calories": 165,
    "Protein": 31,
    "Carbohydrates": 0,
    "Fat": 3,
    "Category": "Lunch"
  }
]
```

---

### 13. Get Food by ID

**GET** `/foods/{foodID}`

Get detailed information about a specific food.

**Response (200):**
```json
{
  "FoodID": 10,
  "FoodName": "Chicken Breast",
  "Calories": 165,
  "Protein": 31,
  "Carbohydrates": 0,
  "Fat": 3,
  "Fiber": 0,
  "ServingSize": "100g cooked",
  "Category": "Lunch"
}
```

---

### 14. Add Food (Admin Only)

**POST** `/foods`

Add a new food item to database.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "foodName": "Grilled Salmon",
  "calories": 280,
  "protein": 25,
  "carbohydrates": 0,
  "fat": 20,
  "fiber": 0,
  "servingSize": "100g",
  "category": "Lunch"
}
```

**Response (201):**
```json
{
  "message": "Food added successfully",
  "foodID": 45
}
```

---

### 15. Update Food (Admin Only)

**PUT** `/foods/{foodID}`

Update an existing food item.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "foodName": "Grilled Salmon",
  "calories": 280,
  "protein": 25,
  "carbohydrates": 0,
  "fat": 20,
  "fiber": 0,
  "servingSize": "100g",
  "category": "Lunch"
}
```

**Response (200):**
```json
{
  "message": "Food updated successfully"
}
```

---

### 16. Delete Food (Admin Only)

**DELETE** `/foods/{foodID}`

Delete a food item.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Response (200):**
```json
{
  "message": "Food deleted successfully"
}
```

---

## Meal Endpoints

### 17. Log Meal

**POST** `/meals/log`

Log a meal for the current day.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "foodID": 10,
  "meal": "Lunch",
  "quantity": 150
}
```

**Response (201):**
```json
{
  "message": "Meal logged successfully",
  "mealLogID": 45
}
```

**Meal Types:** Breakfast, Lunch, Dinner, Snack

---

### 18. Get Daily Meal Logs

**GET** `/meals/daily?date=2024-01-20`

Get all meals logged for a specific date.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (default: today)

**Response (200):**
```json
[
  {
    "MealLogID": 1,
    "UserID": 1,
    "Username": "johndoe",
    "FoodID": 10,
    "FoodName": "Chicken Breast",
    "Meal": "Lunch",
    "Quantity": 100,
    "Calories": 165,
    "CaloriesConsumed": 165,
    "Protein": 31,
    "Carbohydrates": 0,
    "Fat": 3,
    "LogDate": "2024-01-20",
    "LogTime": "2024-01-20T12:30:00"
  }
]
```

---

### 19. Get Daily Calorie Summary

**GET** `/meals/daily-summary?date=2024-01-20`

Get daily calorie totals by meal type.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "date": "2024-01-20",
  "meals": [
    {
      "Meal": "Breakfast",
      "ItemCount": 2,
      "TotalCalories": 305,
      "AvgProtein": 5,
      "AvgCarbs": 25,
      "AvgFat": 7
    },
    {
      "Meal": "Lunch",
      "ItemCount": 1,
      "TotalCalories": 165,
      "AvgProtein": 31,
      "AvgCarbs": 0,
      "AvgFat": 3
    }
  ],
  "total": {
    "TotalCalories": 470,
    "TotalItems": 3
  }
}
```

---

### 20. Get Meal History

**GET** `/meals/history?days=7`

Get meal history for the past X days.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `days` (optional): Number of days (default: 7)

**Response (200):**
```json
[
  {
    "MealLogID": 1,
    "FoodName": "Chicken Breast",
    "Meal": "Lunch",
    "CaloriesConsumed": 165,
    "LogDate": "2024-01-20",
    "LogTime": "2024-01-20T12:30:00"
  }
]
```

---

### 21. Delete Meal Log

**DELETE** `/meals/{mealLogID}`

Delete a meal log entry.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Meal log deleted successfully"
}
```

---

## Progress Endpoints

### 22. Get User Progress

**GET** `/progress`

Get all progress records for the user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "UserID": 1,
    "Username": "johndoe",
    "StartWeight": 85,
    "CurrentWeight": 82,
    "TargetWeight": 75,
    "WeightLost": 3,
    "RemainingToTarget": -7,
    "Status": "On Track",
    "ProgressDate": "2024-01-20"
  }
]
```

---

### 23. Get Weekly Progress

**GET** `/progress/weekly`

Get last 7 days of progress.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "ProgressDate": "2024-01-20",
    "CurrentWeight": 82,
    "WeightLost": 3,
    "BMI": 26.73
  }
]
```

---

### 24. Add Progress Record

**POST** `/progress/add`

Add a new progress record.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "currentWeight": 82,
  "targetWeight": 75,
  "progressNote": "Feeling better!"
}
```

**Response (201):**
```json
{
  "message": "Progress record added successfully",
  "progressID": 10
}
```

---

### 25. Get User Statistics

**GET** `/progress/statistics`

Get overall statistics for the user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "TotalMealsLogged": 45,
  "DaysLogged": 15,
  "AvgDailyCalories": 1750,
  "BMIRecordsCount": 5,
  "TotalWeightLost": 3.5
}
```

---

## Admin Endpoints

All admin endpoints require admin role.

### 26. Get All Users (Admin)

**GET** `/admin/users`

Get list of all users in the system.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Response (200):**
```json
[
  {
    "UserID": 1,
    "Username": "johndoe",
    "Email": "john@example.com",
    "FirstName": "John",
    "LastName": "Doe",
    "Age": 30,
    "Gender": "Male",
    "CreatedAt": "2024-01-15T10:30:00",
    "IsActive": 1,
    "Role": "USER"
  }
]
```

---

### 27. Get User Report (Admin)

**GET** `/admin/users/report?userID=1&startDate=2024-01-01&endDate=2024-01-31`

Generate user report for date range.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Query Parameters:**
- `userID` (required): User ID
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**Response (200):**
```json
{
  "Username": "johndoe",
  "Email": "john@example.com",
  "FirstName": "John",
  "LastName": "Doe",
  "CurrentBMI": 26.73,
  "BMICategory": "Overweight",
  "Weight": 82,
  "Height": 175,
  "DaysLogged": 15,
  "TotalCaloriesConsumed": 26250,
  "AvgDailyCalories": 1750
}
```

---

### 28. Get System Statistics (Admin)

**GET** `/admin/statistics`

Get system-wide statistics.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Response (200):**
```json
{
  "TotalUsers": 25,
  "AdminCount": 2,
  "ActiveUsers": 22,
  "InactiveUsers": 3,
  "TotalBMIRecords": 85,
  "TotalMealLogs": 450
}
```

---

### 29. Get Admin Dashboard

**GET** `/admin/dashboard`

Get admin dashboard metrics.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Response (200):**
```json
{
  "Total Users": "25",
  "Active Users": "22",
  "Total Meal Logs": "450",
  "Foods in Database": "30",
  "Active Diet Plans": "15"
}
```

---

### 30. Deactivate User (Admin)

**POST** `/admin/users/deactivate`

Deactivate a user account.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "userID": 5
}
```

**Response (200):**
```json
{
  "message": "User account deactivated"
}
```

---

### 31. Get Medical Conditions (Admin)

**GET** `/admin/conditions`

Get all medical conditions.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Response (200):**
```json
[
  {
    "ConditionID": 1,
    "ConditionName": "Diabetes",
    "Description": "Blood sugar regulation disorder",
    "DietaryRestrictions": "Low sugar, High fiber"
  }
]
```

---

### 32. Add Medical Condition (Admin)

**POST** `/admin/conditions`

Add a new medical condition.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "conditionName": "Metabolic Syndrome",
  "description": "Cluster of health conditions",
  "dietaryRestrictions": "Low carb, Low salt"
}
```

**Response (201):**
```json
{
  "message": "Medical condition added",
  "conditionID": 9
}
```

---

### 33. Get Health Goals (Admin)

**GET** `/admin/goals`

Get all health goals.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Response (200):**
```json
[
  {
    "GoalID": 1,
    "GoalName": "Weight Loss",
    "Description": "Reduce body weight safely",
    "TargetCalories": 1800,
    "RecommendedDuration": 90
  }
]
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Admin access required |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal server error |

---

## Rate Limiting

No rate limiting is currently implemented. For production, consider adding rate limiting middleware.

---

## Version

API Version: 1.0.0
Last Updated: 2024
