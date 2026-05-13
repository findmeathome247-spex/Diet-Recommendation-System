import React, { useState, useEffect } from 'react';
import { progressAPI } from '../services/api';
import './Progress.css';

const Progress = () => {
    const [progressData, setProgressData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const [progressRes, statsRes] = await Promise.all([
                progressAPI.getUserProgress().catch(() => ({ data: [] })),
                progressAPI.getUserStatistics().catch(() => ({ data: null }))
            ]);
            
            setProgressData(progressRes.data || []);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching progress:', err);
            setError('Failed to load progress tracking data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="progress-loading">Loading progress...</div>;

    return (
        <div className="progress-page">
            <h1>📈 Progress Tracking</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-summary-grid">
                <div className="stat-card">
                    <span className="stat-label">Total Weight Lost</span>
                    <span className="stat-value">{stats?.TotalWeightLost?.toFixed(1) || 0} kg</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Meals Logged</span>
                    <span className="stat-value">{stats?.TotalMealsLogged || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Days Active</span>
                    <span className="stat-value">{stats?.DaysLogged || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">BMI Records</span>
                    <span className="stat-value">{stats?.BMIRecordsCount || 0}</span>
                </div>
            </div>

            <div className="progress-history">
                <h2>Weight History</h2>
                {progressData.length > 0 ? (
                    <div className="history-table-container">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Current Weight</th>
                                    <th>Target Weight</th>
                                    <th>Weight Lost</th>
                                    <th>Status</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {progressData.map((record, index) => (
                                    <tr key={index}>
                                        <td>{new Date(record.ProgressDate).toLocaleDateString()}</td>
                                        <td>{record.CurrentWeight} kg</td>
                                        <td>{record.TargetWeight || 'N/A'} kg</td>
                                        <td className={record.WeightLost > 0 ? 'positive' : ''}>
                                            {record.WeightLost?.toFixed(1) || 0} kg
                                        </td>
                                        <td><span className={`badge ${record.Status?.toLowerCase().replace(' ', '-')}`}>{record.Status}</span></td>
                                        <td className="note">{record.ProgressNote || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-history">
                        <p>No progress records found. Update your weight to start tracking!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Progress;
