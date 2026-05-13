// Mock In-Memory Database for Testing
// Stores data in memory (will be lost on server restart)

class MockDatabase {
  constructor() {
    this.users = [];
    this.userNextId = 1;
    this.waterIntake = []; // Store water intake logs: { userID, date, glassCount }
    this.waterIntakeNextId = 1;
    this.meals = []; // Store meal logs
    this.mealsNextId = 1;
    this.goals = []; // Store user goals
    this.goalsNextId = 1;
    this.foods = [ // Sample food database
      { FoodID: 1, FoodName: 'Oatmeal with berries', Calories: 250 },
      { FoodID: 2, FoodName: 'Chicken salad', Calories: 380 },
      { FoodID: 3, FoodName: 'Apple', Calories: 95 },
      { FoodID: 4, FoodName: 'Whole wheat bread', Calories: 80 },
      { FoodID: 5, FoodName: 'Salmon', Calories: 280 }
    ];
  }

  async initialize() {
    // Ensure default test user exists
    console.log('📝 Mock DB: Initializing... Current users:', this.users.length);
    const existingUser = this.users.find(u => u.Username === 'aymen');
    if (!existingUser) {
      // bcrypt hash for password "password123" (verified with bcrypt.compare)
      const testUser = {
        UserID: this.userNextId++,
        Username: 'aymen',
        Email: 'aymen@test.com',
        FirstName: 'Aymen',
        LastName: 'Test',
        Age: 30,
        Gender: 'Male',
        Height: 180,
        Weight: 75,
        PasswordHash: '$2a$10$LJupn6H3dH2cEHkZy/4hpefYb0oToWF2OTETwjOCPNXx4xbOsmwg2', // bcrypt hash of "password123"
        Role: 'user',
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      };
      this.users.push(testUser);
      console.log('✓ Default test user "aymen" created (password: password123)');
      console.log('✓ Password hash stored:', testUser.PasswordHash);
      console.log('✓ Users in array now:', this.users.length);
    } else {
      console.log('✓ Test user "aymen" already exists');
    }
    console.log('Mock Database initialized');
    return true;
  }

  async createUser(userData) {
    const userId = this.userNextId++;
    const user = {
      UserID: userId,
      Username: userData.username,
      Email: userData.email,
      FirstName: userData.firstName,
      LastName: userData.lastName,
      Age: userData.age || null,
      Gender: userData.gender || null,
      Height: userData.height || null,
      Weight: userData.weight || null,
      PasswordHash: userData.passwordHash,
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    };
    
    this.users.push(user);
    console.log(`Mock: Created user ${user.Username} with ID ${userId}`);
    return { recordset: [{ UserID: userId }] };
  }

  async findUserByUsername(username) {
    console.log('🔍 Mock DB: Looking up user:', username);
    console.log('📝 Mock DB: Total users in database:', this.users.length);
    if (this.users.length > 0) {
      console.log('📝 Mock DB: First user:', this.users[0].Username, 'Hash:', this.users[0].PasswordHash?.substring(0, 20));
    }
    const user = this.users.find(u => u.Username === username);
    console.log('✓ Mock DB: User found:', !!user);
    if (user) {
      console.log('✓ Mock DB: User object:', { Username: user.Username, PasswordHash: user.PasswordHash?.substring(0, 20) });
    }
    return {
      recordset: user ? [user] : []
    };
  }

  async findUserByEmail(email) {
    const user = this.users.find(u => u.Email === email);
    return {
      recordset: user ? [user] : []
    };
  }

  async findUserById(userId) {
    const user = this.users.find(u => u.UserID === userId);
    return {
      recordset: user ? [user] : []
    };
  }

  async updateUserProfile(userId, profileData) {
    const user = this.users.find(u => u.UserID === userId);
    if (user) {
      Object.assign(user, profileData, { UpdatedAt: new Date() });
      return { rowsAffected: [1] };
    }
    return { rowsAffected: [0] };
  }

  async getAllUsers() {
    return {
      recordset: this.users
    };
  }

  // Water Intake Methods
  async addWaterIntake(userId, glassCount = 1) {
    const today = new Date().toISOString().split('T')[0];
    let entry = this.waterIntake.find(w => w.UserID === userId && w.Date === today);
    
    if (entry) {
      entry.GlassCount += glassCount;
    } else {
      entry = {
        WaterIntakeID: this.waterIntakeNextId++,
        UserID: userId,
        Date: today,
        GlassCount: glassCount,
        CreatedAt: new Date()
      };
      this.waterIntake.push(entry);
    }
    
    return {
      recordset: [{ WaterIntakeID: entry.WaterIntakeID, GlassCount: entry.GlassCount }]
    };
  }

  async getTodayWaterIntake(userId) {
    const today = new Date().toISOString().split('T')[0];
    const entry = this.waterIntake.find(w => w.UserID === userId && w.Date === today);
    
    return {
      recordset: entry ? [{ GlassCount: entry.GlassCount }] : [{ GlassCount: 0 }]
    };
  }

  async resetWaterIntake(userId) {
    const today = new Date().toISOString().split('T')[0];
    const entry = this.waterIntake.find(w => w.UserID === userId && w.Date === today);
    
    if (entry) {
      entry.GlassCount = 0;
    }
    
    return { rowsAffected: [1] };
  }

  async setWaterIntake(userId, glassCount) {
    const today = new Date().toISOString().split('T')[0];
    let entry = this.waterIntake.find(w => w.UserID === userId && w.Date === today);
    
    if (entry) {
      entry.GlassCount = glassCount;
    } else {
      entry = {
        WaterIntakeID: this.waterIntakeNextId++,
        UserID: userId,
        Date: today,
        GlassCount: glassCount,
        CreatedAt: new Date()
      };
      this.waterIntake.push(entry);
    }
    
    return {
      recordset: [{ WaterIntakeID: entry.WaterIntakeID, GlassCount: entry.GlassCount }]
    };
  }

  // Meal Methods
  async getTodayMeals(userId) {
    const today = new Date().toISOString().split('T')[0];
    const userMeals = this.meals.filter(m => m.UserID === userId && m.LogDate === today);
    
    const formattedMeals = userMeals.map(meal => {
      const food = this.foods.find(f => f.FoodID === meal.FoodID);
      return {
        id: meal.MealLogID,
        foodId: meal.FoodID,
        name: food?.FoodName || 'Unknown Food',
        calories: (food?.Calories || 0) * meal.Quantity,
        time: meal.LogTime,
        mealType: meal.Meal,
        quantity: meal.Quantity
      };
    });
    
    return {
      recordset: [{
        date: today,
        meals: formattedMeals,
        totalMeals: formattedMeals.length,
        totalCalories: formattedMeals.reduce((sum, m) => sum + m.calories, 0)
      }]
    };
  }

  async logMeal(userId, foodID, mealType, quantity) {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const meal = {
      MealLogID: this.mealsNextId++,
      UserID: userId,
      FoodID: foodID,
      Meal: mealType,
      Quantity: quantity,
      LogDate: today,
      LogTime: time
    };
    
    this.meals.push(meal);
    
    return {
      recordset: [{ MealLogID: meal.MealLogID }]
    };
  }

  async deleteMeal(mealLogID, userId) {
    const index = this.meals.findIndex(m => m.MealLogID === mealLogID && m.UserID === userId);
    if (index !== -1) {
      this.meals.splice(index, 1);
      return { rowsAffected: [1] };
    }
    return { rowsAffected: [0] };
  }

  // Goal Methods
  async getUserGoals(userId) {
    const userGoals = this.goals.filter(g => g.UserID === userId);
    return {
      recordset: userGoals
    };
  }

  async createGoal(goalData) {
    const goal = {
      GoalID: this.goalsNextId++,
      UserID: goalData.userId,
      Title: goalData.title,
      Description: goalData.description || '',
      TargetValue: goalData.targetValue,
      CurrentProgress: goalData.currentProgress || 0,
      Category: goalData.category || 'General',
      DueDate: goalData.dueDate,
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    };
    
    this.goals.push(goal);
    return {
      recordset: [goal]
    };
  }

  async updateGoal(goalId, userId, updates) {
    const goal = this.goals.find(g => g.GoalID === goalId && g.UserID === userId);
    if (goal) {
      Object.assign(goal, updates, { UpdatedAt: new Date() });
      return { rowsAffected: [1] };
    }
    return { rowsAffected: [0] };
  }

  async updateGoalProgress(goalId, userId, progress) {
    const goal = this.goals.find(g => g.GoalID === goalId && g.UserID === userId);
    if (goal) {
      goal.CurrentProgress = progress;
      goal.UpdatedAt = new Date();
      return { rowsAffected: [1] };
    }
    return { rowsAffected: [0] };
  }

  async deleteGoal(goalId, userId) {
    const index = this.goals.findIndex(g => g.GoalID === goalId && g.UserID === userId);
    if (index !== -1) {
      this.goals.splice(index, 1);
      return { rowsAffected: [1] };
    }
    return { rowsAffected: [0] };
  }
}

const mockDb = new MockDatabase();

module.exports = mockDb;
