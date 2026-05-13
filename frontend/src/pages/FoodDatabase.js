import React, { useState, useEffect } from 'react';
import { foodAPI } from '../services/api';
import './FoodDatabase.css';

const FoodDatabase = () => {
    const [foods, setFoods] = useState([]);
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFoods();
    }, []);

    useEffect(() => {
        filterFoods();
    }, [foods, searchTerm, selectedCategory]);

    const fetchFoods = async () => {
        try {
            const response = await foodAPI.getAllFoods();
            setFoods(response.data);
        } catch (error) {
            console.error('Error fetching foods:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterFoods = () => {
        let filtered = foods;

        if (searchTerm) {
            filtered = filtered.filter(food =>
                food.FoodName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(food => food.Category === selectedCategory);
        }

        setFilteredFoods(filtered);
    };

    const categories = [...new Set(foods.map(f => f.Category))];

    if (loading) return <div className="foods-loading">Loading foods...</div>;

    return (
        <div className="food-database">
            <h1>🥦 Food Database</h1>

            <div className="filter-section">
                <div className="filter-group">
                    <label>Search</label>
                    <input
                        type="text"
                        placeholder="Search foods..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>Category</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="foods-grid">
                {filteredFoods.length > 0 ? (
                    filteredFoods.map(food => (
                        <div key={food.FoodID} className="food-card">
                            <div className="food-header">
                                <h3>{food.FoodName}</h3>
                                <span className="food-category">{food.Category}</span>
                            </div>

                            <div className="food-nutrition">
                                <div className="nutrition-item">
                                    <span>Calories</span>
                                    <span className="nutrition-value">{food.Calories}</span>
                                </div>
                                <div className="nutrition-item">
                                    <span>Protein</span>
                                    <span className="nutrition-value">{food.Protein}g</span>
                                </div>
                                <div className="nutrition-item">
                                    <span>Carbs</span>
                                    <span className="nutrition-value">{food.Carbohydrates}g</span>
                                </div>
                                <div className="nutrition-item">
                                    <span>Fat</span>
                                    <span className="nutrition-value">{food.Fat}g</span>
                                </div>
                                <div className="nutrition-item">
                                    <span>Fiber</span>
                                    <span className="nutrition-value">{food.Fiber}g</span>
                                </div>
                            </div>

                            <p className="serving-size">Serving: {food.ServingSize}</p>
                        </div>
                    ))
                ) : (
                    <div className="no-results">No foods found</div>
                )}
            </div>
        </div>
    );
};

export default FoodDatabase;
