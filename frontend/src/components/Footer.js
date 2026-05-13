import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>NutriGuide</h4>
                        <p>Your personal nutrition and health companion.</p>
                    </div>

                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="#dashboard">Dashboard</a></li>
                            <li><a href="#profile">Profile</a></li>
                            <li><a href="#diet">Diet Plan</a></li>
                            <li><a href="#progress">Progress</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Connect</h4>
                        <div className="social-links">
                            <a href="#facebook" title="Facebook" className="social-icon">f</a>
                            <a href="#twitter" title="Twitter" className="social-icon">𝕏</a>
                            <a href="#instagram" title="Instagram" className="social-icon">📷</a>
                            <a href="#linkedin" title="LinkedIn" className="social-icon">in</a>
                        </div>
                    </div>
                </div>

                <div className="footer-divider"></div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} NutriGuide. All rights reserved. | Made with ❤️ for your health</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
