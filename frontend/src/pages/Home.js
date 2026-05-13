import React from 'react';
import '../styles/Home.css';

const Home = ({ onGetStarted }) => {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">🥗 NutriGuide</h1>
                    <p className="hero-subtitle">Your Personalized Diet Recommendation System</p>
                    <p className="hero-description">
                        Achieve your health goals with AI-powered personalized diet recommendations, 
                        BMI tracking, and meal planning. Start your journey to better health today!
                    </p>
                    <button className="btn-hero" onClick={onGetStarted}>
                        Get Started
                    </button>
                </div>
                <div className="hero-image">
                    <div className="hero-icon">🥗🥙🍎</div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2>Why Choose NutriGuide?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>BMI Tracking</h3>
                        <p>Monitor your BMI and track health metrics over time with detailed analytics</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Personalized Plans</h3>
                        <p>Get diet recommendations tailored to your health goals and medical conditions</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🍽️</div>
                        <h3>Meal Tracking</h3>
                        <p>Log meals, track calories, and get nutritional insights for better decisions</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📈</div>
                        <h3>Progress Reports</h3>
                        <p>Visualize your progress with comprehensive reports and achievement tracking</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🏥</div>
                        <h3>Health Compatibility</h3>
                        <p>Smart food recommendations based on your medical conditions and allergies</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure & Private</h3>
                        <p>Your health data is encrypted and protected with enterprise-grade security</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section">
                <h2>About NutriGuide</h2>
                <p>
                    NutriGuide is a comprehensive Diet Recommendation Database Management System designed 
                    to help you make informed nutritional choices. Our advanced system combines personalized 
                    meal planning with health tracking to create a holistic approach to wellness.
                </p>
                <p>
                    Whether you're looking to lose weight, manage a medical condition, or simply eat healthier, 
                    NutriGuide provides the tools and insights you need to succeed.
                </p>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <h2>Ready to Transform Your Diet?</h2>
                <p>Join thousands of users achieving their health goals with NutriGuide</p>
                <button className="btn-hero" onClick={onGetStarted}>
                    Start Your Free Account
                </button>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2026 NutriGuide. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#terms">Terms of Service</a>
                    <a href="#contact">Contact Us</a>
                </div>
            </footer>
        </div>
    );
};

export default Home;
