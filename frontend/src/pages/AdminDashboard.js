import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [stats, setStats] = useState(null);
    const [bmiDistribution, setBmiDistribution] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [dashboardData, statsData, bmiData] = await Promise.all([
                adminAPI.getAdminDashboard(),
                adminAPI.getSystemStatistics(),
                adminAPI.getBMIDistribution()
            ]);
            setDashboard(dashboardData.data);
            setStats(statsData.data);
            setBmiDistribution(bmiData.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading dashboard...</div>;

    return (
        <div className="admin-dashboard">
            <h1>📋 Admin Dashboard</h1>

            <div className="stats-grid">
                {dashboard && Object.entries(dashboard).map(([key, value]) => (
                    <div key={key} className="stat-card">
                        <h3>{key}</h3>
                        <p className="stat-value">{value}</p>
                    </div>
                ))}
            </div>

            {stats && (
                <div className="detailed-stats">
                    <h2>System Statistics</h2>
                    <div className="stats-row">
                        <div className="stat-item">
                            <span>Total Users</span>
                            <span className="value">{stats.TotalUsers}</span>
                        </div>
                        <div className="stat-item">
                            <span>Active Users</span>
                            <span className="value">{stats.ActiveUsers}</span>
                        </div>
                        <div className="stat-item">
                            <span>Inactive Users</span>
                            <span className="value">{stats.InactiveUsers}</span>
                        </div>
                        <div className="stat-item">
                            <span>Admins</span>
                            <span className="value">{stats.AdminCount}</span>
                        </div>
                    </div>
                </div>
            )}

            {bmiDistribution.length > 0 && (
                <div className="bmi-distribution">
                    <h2>BMI Distribution</h2>
                    <div className="distribution-grid">
                        {bmiDistribution.map((item, index) => (
                            <div key={index} className="distribution-item">
                                <h3>{item.BMICategory}</h3>
                                <p>Users: {item.UserCount}</p>
                                <p>Avg BMI: {item.AvgBMI}</p>
                                <p>Range: {item.MinBMI} - {item.MaxBMI}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
