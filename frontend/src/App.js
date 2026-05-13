import React, { useContext, useState } from 'react';
import { AuthContext, AuthProvider } from './services/authContext';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import LoginRegister from './components/LoginRegister';

// Import page components
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BMICalculator from './pages/BMICalculator';
import DietPlan from './pages/DietPlan';
import MealTracking from './pages/MealTracking';
import Progress from './pages/Progress';
import FoodDatabase from './pages/FoodDatabase';
import AdminUsers from './pages/AdminUsers';
import AdminFoods from './pages/AdminFoods';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
    const { user, token, loading, logout } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState('dashboard');
    
    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    console.log('📱 App re-render - loading:', loading, 'token:', !!token, 'user:', user?.username);

    if (loading) {
        console.log('⏳ Loading auth state...');
        return <div className="loading">Loading...</div>;
    }

    // Show home and login/register if not authenticated
    if (!token) {
        console.log('🔓 Not authenticated (no token), showing login/register page');
        return (
            <div className="app-container">
                {currentPage === 'login' || currentPage === 'register' ? (
                    <LoginRegister 
                        onSwitchToHome={() => setCurrentPage('home')}
                    />
                ) : (
                    <Home 
                        onGetStarted={() => setCurrentPage('login')}
                    />
                )}
            </div>
        );
    }

    console.log('🔒 Authenticated (token exists), showing dashboard for user:', user?.username);

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
            case 'profile': return <Profile />;
            case 'bmi': return <BMICalculator />;
            case 'diet': return <DietPlan />;
            case 'meals': return <MealTracking />;
            case 'progress': return <Progress />;
            case 'foods': return <FoodDatabase />;
            case 'nutrition': return <Dashboard onNavigate={handleNavigate} />; // Redirect to dashboard or implement Nutrition page
            case 'goals': return <Dashboard onNavigate={handleNavigate} />; // Redirect to dashboard or implement Goals page
            case 'admin-users': return <AdminUsers />;
            case 'admin-foods': return <AdminFoods />;
            case 'admin-dashboard': return <AdminDashboard />;
            default: return <Dashboard onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="app-container">
            <Navbar 
                user={user} 
                onLogout={logout}
            />
            <div className="app-body">
                <Sidebar 
                    userRole={user?.role} 
                    onNavigate={handleNavigate}
                />
                <main className="main-content">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

