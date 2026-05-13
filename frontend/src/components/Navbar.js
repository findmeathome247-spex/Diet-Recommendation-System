import React from 'react';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <div className="navbar-logo">
                        <h1>🥗 NutriGuide</h1>
                    </div>
                </div>
                <div className="navbar-right">
                    {user ? (
                        <>
                            <span className="navbar-user">Welcome, {user.firstName}!</span>
                            <button onClick={onLogout} className="btn-logout">Logout</button>
                        </>
                    ) : null}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
