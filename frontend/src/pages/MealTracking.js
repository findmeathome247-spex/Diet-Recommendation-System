import React, { useState, useEffect } from 'react';
import { mealAPI, foodAPI } from '../services/api';
import './MealTracking.css';

const MealTracking = () => {
    const [meals, setMeals] = useState([]);
    const [dailySummary, setDailySummary] = useState(null);
    const [foods, setFoods] = useState([]);
    const [selectedFood, setSelectedFood] = useState('');
    const [selectedMeal, setSelectedMeal] = useState('Breakfast');
    const [quantity, setQuantity] = useState(100);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [mealsData, summaryData, foodsData] = await Promise.all([
                mealAPI.getDailyMealLogs(),
                mealAPI.getDailyCalorieSummary(),
                foodAPI.getAllFoods()
            ]);
            setMeals(mealsData.data);
            setDailySummary(summaryData.data);
            setFoods(foodsData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleLogMeal = async (e) => {
        e.preventDefault();
        if (!selectedFood) {
            alert('Please select a food');
            return;
        }

        setLoading(true);
        try {
            await mealAPI.logMeal({
                foodID: parseInt(selectedFood),
                meal: selectedMeal,
                quantity: parseInt(quantity)
            });
            setSelectedFood('');
            setQuantity(100);
            fetchData();
        } catch (error) {
            alert('Error logging meal: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="meal-tracking">
            <h1>🍴 Meal Tracking</h1>

            <div className="tracking-container">
                <div className="log-meal-card">
                    <h2>Log New Meal</h2>
                    <form onSubmit={handleLogMeal}>
                        <div className="form-group">
                            <label>Meal Type</label>
                            <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)}>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snack">Snack</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Food Item</label>
                            <select value={selectedFood} onChange={(e) => setSelectedFood(e.target.value)}>
                                <option value="">Select a food...</option>
                                {foods.map(food => (
                                    <option key={food.FoodID} value={food.FoodID}>
                                        {food.FoodName} ({food.Calories} cal per {food.ServingSize})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quantity (g)</label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-log">
                            {loading ? 'Logging...' : 'Log Meal'}
                        </button>
                    </form>
                </div>

                <div className="daily-summary-card">
                    <h2>Today's Summary</h2>
                    {dailySummary?.total ? (
                        <>
                            <div className="summary-stat">
                                <span>Total Calories</span>
                                <span className="stat-value">{dailySummary.total.TotalCalories || 0}</span>
                            </div>
                            <div className="summary-stat">
                                <span>Items Logged</span>
                                <span className="stat-value">{dailySummary.total.TotalItems || 0}</span>
                            </div>
                        </>
                    ) : (
                        <p>No meals logged yet</p>
                    )}
                </div>
            </div>

            {meals.length > 0 && (
                <div className="meals-list">
                    <h2>Today's Meals</h2>
                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(mealType => {
                        const mealItems = meals.filter(m => m.Meal === mealType);
                        if (mealItems.length === 0) return null;
                        return (
                            <div key={mealType} className="meal-group">
                                <h3>{mealType}</h3>
                                <div className="meal-items">
                                    {mealItems.map(item => (
                                        <div key={item.MealLogID} className="meal-item">
                                            <div className="meal-info">
                                                <span className="food-name">{item.FoodName}</span>
                                                <span className="meal-time">{new Date(item.LogTime).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="meal-calories">
                                                {item.CaloriesConsumed} cal
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MealTracking;
