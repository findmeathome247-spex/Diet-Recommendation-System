import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        console.log('🔐 API Interceptor: Adding Bearer token to request:', config.url);
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✓ Authorization header set:', config.headers.Authorization?.substring(0, 20) + '...');
    } else {
        console.log('⚠️  API Interceptor: No token in localStorage for request:', config.url);
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => {
        console.log('✓ API Response successful:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('✗ API Response error:', error.response?.status, error.config?.url);
        if (error.response?.status === 401) {
            console.log('🔓 Unauthorized response, clearing auth...');
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
};

// BMI API
export const bmiAPI = {
    getCurrentBMI: () => api.get('/bmi/current'),
    calculateBMI: (height, weight) => api.post('/bmi/calculate', { height, weight }),
    getBMIHistory: () => api.get('/bmi/history'),
};

// Diet API
export const dietAPI = {
    getDietRecommendation: () => api.get('/diet/recommendation'),
    getActiveDietPlan: () => api.get('/diet/active-plan'),
    createDietPlan: (data) => api.post('/diet/create-plan', data),
};

// Food API
export const foodAPI = {
    getAllFoods: (params) => api.get('/foods', { params }),
    getFoodByID: (foodID) => api.get(`/foods/${foodID}`),
    searchFoods: (search) => api.get('/foods/search', { params: { search } }),
    getFoodNutritionSummary: () => api.get('/foods/nutrition-summary'),
    addFood: (data) => api.post('/foods', data),
    updateFood: (foodID, data) => api.put(`/foods/${foodID}`, data),
    deleteFood: (foodID) => api.delete(`/foods/${foodID}`),
};

// Meal API
export const mealAPI = {
    logMeal: (data) => api.post('/meals/log', data),
    getDailyMealLogs: (date) => api.get('/meals/daily', { params: { date } }),
    getDailyCalorieSummary: (date) => api.get('/meals/daily-summary', { params: { date } }),
    getMealHistory: (days) => api.get('/meals/history', { params: { days } }),
    deleteMealLog: (mealLogID) => api.delete(`/meals/${mealLogID}`),
};

// Progress API
export const progressAPI = {
    getUserProgress: () => api.get('/progress'),
    getWeeklyProgress: () => api.get('/progress/weekly'),
    addProgressRecord: (data) => api.post('/progress/add', data),
    getUserStatistics: () => api.get('/progress/statistics'),
};

// Admin API
export const adminAPI = {
    getAllUsers: () => api.get('/admin/users'),
    getUserReport: (params) => api.get('/admin/users/report', { params }),
    getSystemStatistics: () => api.get('/admin/statistics'),
    getBMIDistribution: () => api.get('/admin/statistics/bmi-distribution'),
    getAdminDashboard: () => api.get('/admin/dashboard'),
    deactivateUser: (userID) => api.post('/admin/users/deactivate', { userID }),
    getMedicalConditions: () => api.get('/admin/conditions'),
    addMedicalCondition: (data) => api.post('/admin/conditions', data),
    getHealthGoals: () => api.get('/admin/goals'),
};

export default api;
