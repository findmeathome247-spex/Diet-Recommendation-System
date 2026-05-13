import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('📋 AuthContext useEffect triggered, token:', token?.substring(0, 15) + '...');
        if (token) {
            console.log('🔄 Token exists, fetching user profile...');
            fetchUserProfile();
        } else {
            console.log('❌ No token, setting loading to false');
            setLoading(false);
        }
    }, [token]);

    const fetchUserProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            console.log('🔐 Attempting login for user:', username);
            const response = await authAPI.login({ username, password });
            console.log('✓ Login response received:', response.status, response.data);
            
            const { token: newToken, user: userData } = response.data;
            console.log('✓ Destructured token:', newToken?.substring(0, 20) + '...');
            console.log('✓ Destructured user:', userData);
            
            console.log('💾 Storing token in localStorage...');
            localStorage.setItem('token', newToken);
            console.log('✓ Token stored in localStorage');
            
            console.log('🔄 Updating auth state - token...');
            setToken(newToken);
            console.log('🔄 Updating auth state - user...');
            setUser(userData);
            
            console.log('✅ Login complete, user:', userData.username);
            return response.data;
        } catch (error) {
            console.error('✗ Login failed:', error.response?.data?.error || error.message);
            console.error('Full error:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log('📝 Attempting registration for user:', userData.username);
            const response = await authAPI.register(userData);
            console.log('✓ Registration successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('✗ Registration failed:', error.response?.data?.error || error.message);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

