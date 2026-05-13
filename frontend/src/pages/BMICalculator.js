import React, { useState, useEffect } from 'react';
import { bmiAPI } from '../services/api';
import './BMICalculator.css';

const BMICalculator = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState(null);
    const [bmiCategory, setBmiCategory] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBMIHistory();
    }, []);

    // Calculate BMI locally for real-time feedback
    const calculateBMILocally = (h, w) => {
        console.log('🧮 Calculating BMI locally - height:', h, 'weight:', w);
        
        if (!h || !w) return null;
        
        const heightInMeters = h / 100;
        const calculatedBMI = w / (heightInMeters * heightInMeters);
        
        return Math.round(calculatedBMI * 10) / 10; // Round to 1 decimal
    };

    // Get BMI category based on value
    const getBMICategoryFromValue = (bmiValue) => {
        if (bmiValue < 18.5) return 'Underweight';
        if (bmiValue < 25) return 'Normal';
        if (bmiValue < 30) return 'Overweight';
        return 'Obese';
    };

    // Update BMI dynamically as user types
    useEffect(() => {
        if (height && weight) {
            const heightNum = parseFloat(height);
            const weightNum = parseFloat(weight);
            
            if (heightNum > 0 && weightNum > 0) {
                const calculatedBMI = calculateBMILocally(heightNum, weightNum);
                if (calculatedBMI && !isNaN(calculatedBMI)) {
                    setBmi(calculatedBMI);
                    setBmiCategory(getBMICategoryFromValue(calculatedBMI));
                    setError('');
                }
            }
        } else {
            setBmi(null);
            setBmiCategory('');
        }
    }, [height, weight]);

    const fetchBMIHistory = async () => {
        try {
            console.log('📋 Fetching BMI history...');
            const response = await bmiAPI.getBMIHistory();
            console.log('✓ BMI history loaded:', response.data);
            setHistory(response.data || []);
        } catch (err) {
            console.error('✗ Error fetching BMI history:', err);
            setError('Could not load BMI history');
        }
    };

    const saveBMI = async (e) => {
        e.preventDefault();
        
        // Validate inputs
        if (!height || !weight) {
            setError('Please enter both height and weight');
            console.warn('⚠️ Missing height or weight');
            return;
        }

        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);

        if (isNaN(heightNum) || isNaN(weightNum)) {
            setError('Height and weight must be numbers');
            console.warn('⚠️ Invalid input - not a number');
            return;
        }

        if (heightNum <= 0 || weightNum <= 0) {
            setError('Height and weight must be greater than 0');
            console.warn('⚠️ Invalid input - zero or negative');
            return;
        }

        if (heightNum > 300 || heightNum < 50) {
            setError('Height seems invalid (should be between 50-300 cm)');
            console.warn('⚠️ Invalid height range');
            return;
        }

        if (weightNum > 500 || weightNum < 20) {
            setError('Weight seems invalid (should be between 20-500 kg)');
            console.warn('⚠️ Invalid weight range');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('💾 Saving BMI to database...', { height: heightNum, weight: weightNum });
            const response = await bmiAPI.calculateBMI(heightNum, weightNum);
            
            if (response && response.data) {
                console.log('✓ BMI saved successfully:', response.data);
                setBmi(response.data.BMI);
                setBmiCategory(response.data.BMICategory);
                setHeight('');
                setWeight('');
                fetchBMIHistory();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('✗ Error saving BMI:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Error calculating BMI';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getBMICategoryColor = (category) => {
        const colors = {
            'Underweight': '#4299e1',
            'Normal': '#48bb78',
            'Overweight': '#ed8936',
            'Obese': '#f56565'
        };
        return colors[category] || '#666';
    };

    return (
        <div className="bmi-calculator">
            <h1>⚖️ BMI Calculator</h1>

            <div className="bmi-container">
                <div className="bmi-input-card">
                    <h2>Calculate Your BMI</h2>
                    <form onSubmit={saveBMI}>
                        <div className="form-group">
                            <label>Height (cm)</label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="Enter height in cm (e.g., 175)"
                                step="0.1"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Enter weight in kg (e.g., 75)"
                                step="0.1"
                                min="0"
                            />
                        </div>

                        {error && <div className="error-message">⚠️ {error}</div>}

                        <button type="submit" disabled={loading || !bmi} className="btn-calculate">
                            {loading ? 'Saving...' : 'Save BMI'}
                        </button>
                    </form>
                </div>

                {bmi && (
                    <div className="bmi-result-card" style={{ borderColor: getBMICategoryColor(bmiCategory) }}>
                        <h2>Your BMI Result</h2>
                        <div className="bmi-display">
                            <div className="bmi-value">{bmi}</div>
                            <div className="bmi-text">
                                <p className="bmi-category" style={{ color: getBMICategoryColor(bmiCategory) }}>
                                    {bmiCategory}
                                </p>
                                <p className="bmi-description">
                                    {bmiCategory === 'Underweight' && 'You may need to gain weight for optimal health'}
                                    {bmiCategory === 'Normal' && 'You have a healthy weight!'}
                                    {bmiCategory === 'Overweight' && 'Consider a balanced diet and exercise'}
                                    {bmiCategory === 'Obese' && 'Consult a healthcare provider'}
                                </p>
                            </div>
                        </div>

                        <div className="bmi-chart">
                            <div className="chart-label">BMI Categories</div>
                            <div className="chart-bar">
                                <div className="chart-segment underweight" style={{ width: '20%' }}>
                                    <span>&lt;18.5</span>
                                </div>
                                <div className="chart-segment normal" style={{ width: '30%' }}>
                                    <span>18.5-25</span>
                                </div>
                                <div className="chart-segment overweight" style={{ width: '25%' }}>
                                    <span>25-30</span>
                                </div>
                                <div className="chart-segment obese" style={{ width: '25%' }}>
                                    <span>&gt;30</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {history.length > 0 && (
                <div className="bmi-history">
                    <h2>📋 BMI History</h2>
                    <div className="history-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Weight (kg)</th>
                                    <th>Height (cm)</th>
                                    <th>BMI</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((record, index) => (
                                    <tr key={index}>
                                        <td>{new Date(record.RecordedDate).toLocaleDateString()}</td>
                                        <td>{record.Weight}</td>
                                        <td>{record.Height}</td>
                                        <td><strong>{record.BMI}</strong></td>
                                        <td>
                                            <span style={{
                                                color: getBMICategoryColor(record.BMICategory),
                                                fontWeight: 'bold'
                                            }}>
                                                {record.BMICategory}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BMICalculator;
