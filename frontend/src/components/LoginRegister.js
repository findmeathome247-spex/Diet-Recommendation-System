import React, { useState, useContext } from 'react';
import { AuthContext } from '../services/authContext';
import './LoginRegister.css';

const LoginRegister = ({ onSwitchToHome }) => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [heightUnit, setHeightUnit] = useState('cm');
    const [weightUnit, setWeightUnit] = useState('kg');
    const [heightFeet, setHeightFeet] = useState('');
    const [heightInches, setHeightInches] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        age: '',
        gender: 'Male',
        height: '',
        weight: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateAge = (age) => {
        const ageNum = parseInt(age);
        return ageNum >= 13 && ageNum <= 120;
    };

    const validateForm = () => {
        setError('');

        if (!isLogin) {
            if (!formData.firstName.trim()) {
                setError('First name is required');
                return false;
            }
            if (!formData.lastName.trim()) {
                setError('Last name is required');
                return false;
            }
            if (!formData.username.trim() || formData.username.length < 3) {
                setError('Username must be at least 3 characters');
                return false;
            }
            if (!validateEmail(formData.email)) {
                setError('Invalid email address');
                return false;
            }
            if (!validateAge(formData.age)) {
                setError('Age must be between 13 and 120');
                return false;
            }
            if (heightUnit === 'ft-in') {
                if (!heightFeet || !heightInches) {
                    setError('Please enter valid height');
                    return false;
                }
            } else {
                if (!formData.height || formData.height <= 0) {
                    setError('Please enter valid height');
                    return false;
                }
            }
            if (!formData.weight || formData.weight <= 0) {
                setError('Please enter valid weight');
                return false;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        } else {
            if (!formData.username.trim()) {
                setError('Username is required');
                return false;
            }
            if (!formData.password) {
                setError('Password is required');
                return false;
            }
        }

        return true;
    };

    const convertHeightToCm = () => {
        if (heightUnit === 'cm') {
            return parseFloat(formData.height);
        }
        const feet = parseFloat(heightFeet);
        const inches = parseFloat(heightInches);
        return (feet * 30.48) + (inches * 2.54);
    };

    const convertWeightToKg = () => {
        if (weightUnit === 'kg') {
            return parseFloat(formData.weight);
        }
        return parseFloat(formData.weight) * 0.453592;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                console.log('🔐 Starting login process...');
                await login(formData.username, formData.password);
                console.log('✓ Login completed, user should be redirected by App.js');
                // After successful login, the token is set and App.js should auto-redirect to dashboard
            } else {
                console.log('📝 Starting registration process...');
                const registrationData = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    height: convertHeightToCm(),
                    weight: convertWeightToKg(),
                };

                const response = await register(registrationData);
                console.log('✓ Registration successful:', response);
                
                // If registration returns a token, auto-login
                if (response && response.token) {
                    console.log('✓ Auto-logging in after registration...');
                    setSuccess('Registration successful! Logging in...');
                    // Store token and user in auth context
                    await login(formData.username, formData.password);
                    console.log('✓ Auto-login completed, App.js should redirect to dashboard');
                } else {
                    console.log('✓ Registration complete, switching to login form');
                    setSuccess('Registration successful! Redirecting to login...');
                    
                    // Reset form and switch to login
                    setTimeout(() => {
                        setIsLogin(true);
                        setFormData({
                            username: registrationData.username, // Pre-fill username
                            email: '',
                            password: registrationData.password, // Pre-fill password
                            confirmPassword: '',
                            firstName: '',
                            lastName: '',
                            age: '',
                            gender: 'Male',
                            height: '',
                            weight: '',
                        });
                        setHeightFeet('');
                        setHeightInches('');
                        setSuccess('');
                        console.log('✓ Form reset, user can now login');
                    }, 1500);
                }
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'An error occurred';
            console.error('✗ Error:', errorMsg);
            setError(errorMsg);
            setLoading(false);
        }
    };

    return (
        <div className="login-register-container">
            <div className="form-container">
                <div className="form-header">
                    <h1>🥗 NutriGuide</h1>
                    <p>Your Personalized Diet Recommendation System</p>
                </div>

                <button className="btn-back" onClick={onSwitchToHome}>
                    ← Back to Home
                </button>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {isLogin ? (
                        <>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="First name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Last name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose username (min 3 characters)"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Age (13-120) *</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="Age"
                                        min="13"
                                        max="120"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender *</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Height Unit *</label>
                                <div className="unit-toggle">
                                    <button
                                        type="button"
                                        className={`unit-btn ${heightUnit === 'cm' ? 'active' : ''}`}
                                        onClick={() => setHeightUnit('cm')}
                                    >
                                        Centimeters
                                    </button>
                                    <button
                                        type="button"
                                        className={`unit-btn ${heightUnit === 'ft-in' ? 'active' : ''}`}
                                        onClick={() => setHeightUnit('ft-in')}
                                    >
                                        Feet/Inches
                                    </button>
                                </div>
                            </div>

                            {heightUnit === 'cm' ? (
                                <div className="form-group">
                                    <label>Height (cm) *</label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        placeholder="e.g., 170"
                                        step="0.1"
                                        min="50"
                                        max="250"
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Feet *</label>
                                        <input
                                            type="number"
                                            value={heightFeet}
                                            onChange={(e) => setHeightFeet(e.target.value)}
                                            placeholder="Feet"
                                            min="3"
                                            max="8"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Inches *</label>
                                        <input
                                            type="number"
                                            value={heightInches}
                                            onChange={(e) => setHeightInches(e.target.value)}
                                            placeholder="Inches"
                                            min="0"
                                            max="11"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Weight Unit *</label>
                                <div className="unit-toggle">
                                    <button
                                        type="button"
                                        className={`unit-btn ${weightUnit === 'kg' ? 'active' : ''}`}
                                        onClick={() => setWeightUnit('kg')}
                                    >
                                        Kilograms
                                    </button>
                                    <button
                                        type="button"
                                        className={`unit-btn ${weightUnit === 'lbs' ? 'active' : ''}`}
                                        onClick={() => setWeightUnit('lbs')}
                                    >
                                        Pounds
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Weight ({weightUnit === 'kg' ? 'kg' : 'lbs'}) *</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder={weightUnit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
                                    step="0.1"
                                    min="20"
                                    max="300"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password (min 6 characters) *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm Password *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                {isLogin ? 'Logging in...' : 'Registering...'}
                            </>
                        ) : (
                            isLogin ? 'Login' : 'Register'
                        )}
                    </button>
                </form>

                <div className="form-footer">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setSuccess('');
                            }}
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginRegister;
