import React, { useState, useEffect } from 'react';
import { foodAPI } from '../services/api';
import './AdminFoods.css';

const AdminFoods = () => {
    const [foods, setFoods] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        foodName: '',
        calories: '',
        protein: '',
        carbohydrates: '',
        fat: '',
        fiber: '',
        servingSize: '',
        category: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFoods();
    }, []);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await foodAPI.addFood(formData);
            setFormData({
                foodName: '',
                calories: '',
                protein: '',
                carbohydrates: '',
                fat: '',
                fiber: '',
                servingSize: '',
                category: ''
            });
            setShowForm(false);
            fetchFoods();
        } catch (error) {
            alert('Error adding food: ' + error.message);
        }
    };

    if (loading) return <div className="admin-loading">Loading...</div>;

    return (
        <div className="admin-foods">
            <h1>🍎 Manage Foods</h1>

            <button onClick={() => setShowForm(!showForm)} className="btn-add-food">
                + Add New Food
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="add-food-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Food Name</label>
                            <input
                                type="text"
                                name="foodName"
                                value={formData.foodName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Calories</label>
                            <input
                                type="number"
                                name="calories"
                                value={formData.calories}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Protein (g)</label>
                            <input
                                type="number"
                                name="protein"
                                value={formData.protein}
                                onChange={handleChange}
                                step="0.1"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Carbohydrates (g)</label>
                            <input
                                type="number"
                                name="carbohydrates"
                                value={formData.carbohydrates}
                                onChange={handleChange}
                                step="0.1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Fat (g)</label>
                            <input
                                type="number"
                                name="fat"
                                value={formData.fat}
                                onChange={handleChange}
                                step="0.1"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fiber (g)</label>
                            <input
                                type="number"
                                name="fiber"
                                value={formData.fiber}
                                onChange={handleChange}
                                step="0.1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Serving Size</label>
                            <input
                                type="text"
                                name="servingSize"
                                value={formData.servingSize}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit">Add Food</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="foods-table">
                <table>
                    <thead>
                        <tr>
                            <th>Food Name</th>
                            <th>Category</th>
                            <th>Calories</th>
                            <th>Protein</th>
                            <th>Carbs</th>
                            <th>Fat</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {foods.map(food => (
                            <tr key={food.FoodID}>
                                <td>{food.FoodName}</td>
                                <td>{food.Category}</td>
                                <td>{food.Calories}</td>
                                <td>{food.Protein}g</td>
                                <td>{food.Carbohydrates}g</td>
                                <td>{food.Fat}g</td>
                                <td>
                                    <button className="action-btn edit">Edit</button>
                                    <button className="action-btn delete">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminFoods;
