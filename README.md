# NutriGuide - Diet Recommendation Database Management System

A comprehensive full-stack web application for personalized diet recommendations based on user BMI, medical conditions, and health goals.

## 🎯 Project Overview

NutriGuide is an advanced DBMS project that demonstrates:
- Complex database relationships and normalization
- SQL stored procedures and triggers
- REST API architecture
- Modern React UI with responsive design
- JWT authentication
- Real-time BMI calculation and meal tracking

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Database Schema](#database-schema)
4. [Setup Instructions](#setup-instructions)
5. [API Documentation](#api-documentation)
6. [Project Structure](#project-structure)

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Axios** - HTTP client
- **CSS3** - Responsive styling

### Backend
- **Node.js** - Runtime
- **Express.js** - API framework
- **mssql** - SQL Server driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

### Database
- **SQL Server** - Relational database
- **SQL Server Management Studio** - Database management

## ✨ Features

### User Authentication
- User registration with health metrics
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Profile management

### BMI Management
- Automatic BMI calculation
- BMI category classification (Underweight, Normal, Overweight, Obese)
- BMI history tracking
- Real-time updates when weight/height changes

### Diet Recommendation System
- Rule-based diet suggestions based on:
  - BMI category
  - Medical conditions
  - Health goals
- Personalized meal plans
- Breakfast, lunch, dinner, and snack recommendations

### Food Database
- Comprehensive food item library
- Nutritional information (calories, protein, carbs, fats, fiber)
- Search and filter capabilities
- Admin management

### Meal Tracking
- Log daily meals
- Track calories consumed
- View daily summaries
- Meal history

### Progress Monitoring
- Weight tracking over time
- Progress visualization
- Goal tracking
- Statistical reports

### Admin Features
- User management
- Food database management
- System statistics
- BMI distribution analysis
- Admin dashboard

## 📊 Database Schema

### Tables

1. **Users** - Store user information and credentials
2. **BMIRecords** - Track BMI history
3. **MedicalConditions** - Store medical conditions
4. **UserMedicalConditions** - Link users to conditions
5. **HealthGoals** - Define health objectives
6. **Foods** - Food database with nutrition info
7. **DietPlans** - User diet plans
8. **DietPlanItems** - Foods in diet plans
9. **MealLogs** - Daily meal tracking
10. **UserProgress** - Progress records
11. **FoodConditionCompatibility** - Food-condition relationships
12. **AdminLogs** - Audit trail

### Key Features
- Proper normalization (3NF)
- Primary and foreign keys
- Indexes for performance
- 8 stored procedures
- 9 triggers
- 11 database views

## 🚀 Setup Instructions

### Prerequisites
- SQL Server 2019 or later
- Node.js 16+
- npm or yarn
- Git

### 1. Database Setup

```bash
# Connect to SQL Server Management Studio
# Open the database folder and run these scripts in order:

# 1. Create tables
database/schemas/01-create-tables.sql

# 2. Create stored procedures
database/procedures/stored-procedures.sql

# 3. Create triggers
database/triggers/triggers.sql

# 4. Create views
database/schemas/03-create-views.sql

# 5. Insert sample data
database/schemas/02-sample-data.sql
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure database connection in .env
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=NutriGuide
DB_USER=sa
DB_PASSWORD=YourPassword123
JWT_SECRET=your-super-secret-jwt-key
PORT=5000

# Start backend server
npm start
# Or for development with auto-reload
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure API endpoint
REACT_APP_API_URL=http://localhost:5000/api

# Start frontend development server
npm start
```

The application will open at `http://localhost:3000`

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "age": 30,
  "gender": "Male",
  "height": 175,
  "weight": 85
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### BMI Endpoints

#### Get Current BMI
```
GET /api/bmi/current
Authorization: Bearer {token}
```

#### Calculate BMI
```
POST /api/bmi/calculate
Authorization: Bearer {token}
Content-Type: application/json

{
  "height": 175,
  "weight": 85
}
```

#### Get BMI History
```
GET /api/bmi/history
Authorization: Bearer {token}
```

### Meal Endpoints

#### Log Meal
```
POST /api/meals/log
Authorization: Bearer {token}
Content-Type: application/json

{
  "foodID": 1,
  "meal": "Breakfast",
  "quantity": 100
}
```

#### Get Daily Meals
```
GET /api/meals/daily?date=2024-01-15
Authorization: Bearer {token}
```

#### Get Daily Calorie Summary
```
GET /api/meals/daily-summary?date=2024-01-15
Authorization: Bearer {token}
```

### Food Endpoints

#### Get All Foods
```
GET /api/foods?category=Breakfast&minCalories=50&maxCalories=200
```

#### Search Foods
```
GET /api/foods/search?search=chicken
```

#### Add Food (Admin)
```
POST /api/foods
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "foodName": "Grilled Chicken",
  "calories": 165,
  "protein": 31,
  "carbohydrates": 0,
  "fat": 3,
  "fiber": 0,
  "servingSize": "100g",
  "category": "Lunch"
}
```

### Admin Endpoints

#### Get All Users
```
GET /api/admin/users
Authorization: Bearer {admin-token}
```

#### Get System Statistics
```
GET /api/admin/statistics
Authorization: Bearer {admin-token}
```

#### Get Admin Dashboard
```
GET /api/admin/dashboard
Authorization: Bearer {admin-token}
```

## 📁 Project Structure

```
NutriGuide/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Sidebar.js
│   │   │   └── LoginRegister.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js
│   │   │   ├── BMICalculator.js
│   │   │   ├── MealTracking.js
│   │   │   ├── DietPlan.js
│   │   │   ├── Progress.js
│   │   │   ├── FoodDatabase.js
│   │   │   ├── AdminUsers.js
│   │   │   ├── AdminFoods.js
│   │   │   └── AdminDashboard.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── authContext.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bmiController.js
│   │   │   ├── dietController.js
│   │   │   ├── foodController.js
│   │   │   ├── mealController.js
│   │   │   ├── progressController.js
│   │   │   └── adminController.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── bmiRoutes.js
│   │       ├── dietRoutes.js
│   │       ├── foodRoutes.js
│   │       ├── mealRoutes.js
│   │       ├── progressRoutes.js
│   │       ├── profileRoutes.js
│   │       └── adminRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── database/
    ├── schemas/
    │   ├── 01-create-tables.sql
    │   ├── 02-sample-data.sql
    │   └── 03-create-views.sql
    ├── procedures/
    │   └── stored-procedures.sql
    └── triggers/
        └── triggers.sql
```

## 🔑 Key SQL Features

### Stored Procedures
1. `sp_CalculateBMI` - Calculate and store BMI
2. `sp_GetDietRecommendation` - Get personalized diet suggestions
3. `sp_GetDailyCalorieSummary` - Daily calorie analysis
4. `sp_CreateUser` - User creation with initial setup
5. `sp_GetUserWeeklyProgress` - Weekly progress tracking
6. `sp_GetFoodsByCondition` - Filter foods by medical condition
7. `sp_GenerateUserReport` - Generate user statistics report
8. `sp_AdminGetUserStatistics` - System-wide statistics

### Triggers
1. Auto-update timestamps on user modifications
2. Auto-calculate calories in meal logs
3. Auto-update BMI on weight changes
4. Audit logging for sensitive operations
5. Auto-maintain progress records
6. Prevent deletion of active diet plans
7. Auto-disable expired diet plans
8. Log food additions

### Views
1. `vw_UserOverview` - Complete user information
2. `vw_UserMealHistory` - Detailed meal logs
3. `vw_DailyCalorieSummary` - Daily nutrition breakdown
4. `vw_UserProgressReport` - Progress tracking
5. `vw_BMICategoryDistribution` - BMI statistics
6. `vw_FoodNutritionSummary` - Food nutrition profiles
7. `vw_ConditionFoodCompatibility` - Condition-based food recommendations
8. `vw_UserMedicalConditions` - User health conditions
9. `vw_ActiveDietPlans` - Current diet plans
10. `vw_DailyNutritionBalance` - Macro tracking
11. `vw_AdminDashboard` - Admin statistics

## 🔐 Security Features

- JWT authentication with 24-hour expiration
- Password hashing with bcryptjs (10 salt rounds)
- Role-based access control (USER/ADMIN)
- Admin-only endpoints for sensitive operations
- Audit logging for administrative actions
- Input validation on all endpoints
- CORS protection

## 📈 BMI Categories

| Category | BMI Range |
|----------|-----------|
| Underweight | < 18.5 |
| Normal | 18.5 - 24.9 |
| Overweight | 25 - 29.9 |
| Obese | ≥ 30 |

## 🧪 Sample Data

The database includes sample data with:
- 3 sample users (2 regular, 1 admin)
- 8 medical conditions
- 6 health goals
- 30+ food items across multiple categories
- Sample BMI records and meal logs

### Test Credentials
```
Username: johndoe
Password: (Use any password during registration)
Email: john@example.com
```

## 🚧 Future Enhancements

- Real-time notifications
- Mobile app version
- Advanced data visualization with charts
- Recipe suggestions
- Nutrition AI recommendations
- Integration with fitness trackers
- Multi-language support
- Export reports to PDF

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## 📞 Support

For support and questions, please contact or create an issue in the repository.

---

**Created:** 2024
**Database:** SQL Server 2019+
**Framework:** React 18 + Express.js
**Node Version:** 16+
