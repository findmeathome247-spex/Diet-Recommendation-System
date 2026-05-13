import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ userRole, onNavigate }) => {
    const [activeItem, setActiveItem] = useState('dashboard');
    const [hoveredItem, setHoveredItem] = useState(null);

    const handleNavigate = (itemId) => {
        setActiveItem(itemId);
        onNavigate(itemId);
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'bmi', label: 'BMI Calculator', icon: '⚖️' },
        { id: 'diet', label: 'Diet Plan', icon: '🍽️' },
        { id: 'meals', label: 'Meal Tracking', icon: '🍴' },
        { id: 'progress', label: 'Progress', icon: '📈' },
        { id: 'foods', label: 'Foods', icon: '🥦' },
    ];

    const adminItems = [
        { id: 'admin-users', label: 'Manage Users', icon: '👥' },
        { id: 'admin-foods', label: 'Manage Foods', icon: '🍎' },
        { id: 'admin-dashboard', label: 'Admin Dashboard', icon: '📋' },
    ];

    return (
        <>
            <aside className="sidebar expanded">
                <div className="sidebar-content">
                    <div className="menu-section">
                        <h3 className="menu-title">Menu</h3>
                        <nav className="menu">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                                    onClick={() => handleNavigate(item.id)}
                                    onMouseEnter={() => setHoveredItem(item.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    title={item.label}
                                >
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-label">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {userRole === 'ADMIN' && (
                        <div className="menu-section">
                            <h3 className="menu-title">Admin</h3>
                            <nav className="menu">
                                {adminItems.map(item => (
                                    <button
                                        key={item.id}
                                        className={`menu-item admin ${activeItem === item.id ? 'active' : ''}`}
                                        onClick={() => handleNavigate(item.id)}
                                        onMouseEnter={() => setHoveredItem(item.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        title={item.label}
                                    >
                                        <span className="menu-icon">{item.icon}</span>
                                        <span className="menu-label">{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
