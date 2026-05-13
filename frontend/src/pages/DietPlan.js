import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';
import './DietPlan.css';

const DietPlan = () => {
    const [activePlan, setActivePlan] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDietData();
    }, []);

    const fetchDietData = async () => {
        try {
            setLoading(true);
            const [planRes, recRes] = await Promise.all([
                dietAPI.getActiveDietPlan().catch(() => ({ data: null })),
                dietAPI.getDietRecommendation().catch(() => ({ data: { foods: [] } }))
            ]);
            
            setActivePlan(planRes.data);
            setRecommendations(recRes.data?.foods || []);
        } catch (err) {
            console.error('Error fetching diet data:', err);
            setError('Failed to load diet information');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="diet-loading">Loading your diet plan...</div>;

    return (
        <div className="diet-plan">
            <h1>🍽️ My Diet Plan</h1>

            {error && <div className="error-message">{error}</div>}

            {activePlan ? (
                <div className="active-plan-section">
                    <div className="plan-header-card">
                        <h2>Active Plan: {activePlan.GoalName}</h2>
                        <div className="plan-meta">
                            <span><strong>Target:</strong> {activePlan.TargetCalories} kcal/day</span>
                            <span><strong>BMI Category:</strong> {activePlan.BMICategory}</span>
                            <span><strong>Ends:</strong> {new Date(activePlan.EndDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="plan-items">
                        <h3>Daily Meals</h3>
                        {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(mealType => {
                            const items = activePlan.items?.filter(i => i.Meal === mealType) || [];
                            return (
                                <div key={mealType} className="meal-type-section">
                                    <h4>{mealType}</h4>
                                    {items.length > 0 ? (
                                        <div className="food-grid">
                                            {items.map(item => (
                                                <div key={item.DietPlanItemID} className="food-card">
                                                    <span className="food-name">{item.FoodName}</span>
                                                    <span className="food-details">{item.Calories} cal | {item.Quantity}g</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-items">No items planned for this meal.</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="no-plan-state">
                    <p>You don't have an active diet plan yet.</p>
                    <button className="btn-primary" onClick={() => {/* TODO: Implement create plan modal */}}>
                        Create New Plan
                    </button>
                </div>
            )}

            <div className="recommendations-section">
                <h2>💡 Personalized Recommendations</h2>
                <p className="subtitle">Based on your BMI and medical conditions</p>
                {recommendations.length > 0 ? (
                    <div className="recommendations-grid">
                        {recommendations.map((food, index) => (
                            <div key={index} className="rec-card">
                                <h3>{food.FoodName}</h3>
                                <div className="rec-stats">
                                    <span>🔥 {food.Calories} cal</span>
                                    <span>🥩 {food.Protein}g protein</span>
                                </div>
                                <p className="rec-category">{food.Category}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Complete your profile and BMI calculation to get recommendations.</p>
                )}
            </div>
        </div>
    );
};

export default DietPlan;