import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../services/authContext';
import { bmiAPI, progressAPI } from '../services/api';
import Footer from '../components/Footer';
import './Dashboard.css';

const Dashboard = ({ onNavigate }) => {
    const { user } = useContext(AuthContext);
    const [bmi, setBmi] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            console.log('📊 Loading dashboard...');
            const [bmiRes, statsRes] = await Promise.all([
                bmiAPI.getCurrentBMI().catch(() => null),
                progressAPI.getUserStatistics().catch(() => null)
            ]);
            setBmi(bmiRes?.data || null);
            setStats(statsRes?.data || null);
            console.log('✓ Dashboard loaded');
        } catch (err) {
            console.error('✗ Dashboard error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-wrapper">
                <div className="dashboard page-loading">
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard">
                <div className="dashboard-container">
                    <h1>Welcome, {user?.firstName}! 👋</h1>
                    <p>Track your health and nutrition journey</p>

                    {error && <div className="error-message">{error}</div>}

                    <div className="dashboard-grid">
                        {/* BMI Section */}
                        <div className="card">
                            <div className="card-header">
                                <h2>BMI Status</h2>
                            </div>
                            {bmi ? (
                                <div className="card-content">
                                    <div className="stat-large">
                                        <div className="stat-value">{bmi.BMI}</div>
                                        <div className="stat-label">Your BMI</div>
                                    </div>
                                    <div className="stat-description">{bmi.Category}</div>
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => onNavigate('bmi')}
                                    >
                                        Update BMI
                                    </button>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No BMI data yet. Calculate your BMI to get started.</p>
                                    <button 
                                        className="btn-primary"
                                        onClick={() => onNavigate('bmi')}
                                    >
                                        Calculate BMI
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Progress Section */}
                        <div className="card">
                            <div className="card-header">
                                <h2>Your Progress</h2>
                            </div>
                            {stats ? (
                                <div className="card-content">
                                    <div className="stat-row">
                                        <span>Total Meals Logged:</span>
                                        <strong>{stats.mealsLogged || 0}</strong>
                                    </div>
                                    <div className="stat-row">
                                        <span>Active Goals:</span>
                                        <strong>{stats.activeGoals || 0}</strong>
                                    </div>
                                    <div className="stat-row">
                                        <span>Streak:</span>
                                        <strong>{stats.currentStreak || 0} days</strong>
                                    </div>
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => onNavigate('progress')}
                                    >
                                        View Details
                                    </button>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>Start tracking to see your progress.</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="card">
                            <div className="card-header">
                                <h2>Quick Actions</h2>
                            </div>
                            <div className="quick-actions">
                                <button 
                                    className="action-btn"
                                    onClick={() => onNavigate('meals')}
                                >
                                    📝 Log Meal
                                </button>
                                <button 
                                    className="action-btn"
                                    onClick={() => onNavigate('nutrition')}
                                >
                                    🥗 Nutrition
                                </button>
                                <button 
                                    className="action-btn"
                                    onClick={() => onNavigate('profile')}
                                >
                                    👤 Profile
                                </button>
                                <button 
                                    className="action-btn"
                                    onClick={() => onNavigate('goals')}
                                >
                                    🎯 Goals
                                </button>
                            </div>
                        </div>

                        {/* Health Tips */}
                        <div className="card">
                            <div className="card-header">
                                <h2>Health Tips</h2>
                            </div>
                            <div className="tips-container">
                                <div className="tip">
                                    <span className="tip-icon">💧</span>
                                    <span>Drink 8-10 glasses of water daily</span>
                                </div>
                                <div className="tip">
                                    <span className="tip-icon">🥗</span>
                                    <span>Include more vegetables in your meals</span>
                                </div>
                                <div className="tip">
                                    <span className="tip-icon">💪</span>
                                    <span>Exercise at least 30 minutes a day</span>
                                </div>
                                <div className="tip">
                                    <span className="tip-icon">😴</span>
                                    <span>Get 7-8 hours of quality sleep</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;
