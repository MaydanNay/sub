import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const getDashboardPath = (role) => {
    switch (role) {
        case 'super_super_admin':
        case 'super_admin': return '/superadmin/dashboard';
        case 'owner':
        case 'admin':       return '/admin/dashboard';
        case 'teacher':     return '/teacher/dashboard';
        case 'parent':      return '/parent/dashboard';
        case 'student':
        default:            return '/student/dashboard';
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                } catch (err) {
                    console.error("Token verification failed", err);
                    logout();
                }
            }
            setLoading(false);
        };
        verifyToken();

        const handleForceLogout = () => {
            logout();
        };

        const handleTokenRefreshed = (e) => {
            setToken(e.detail);
        };

        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                setToken(e.newValue);
            }
        };

        window.addEventListener('shuschool-logout', handleForceLogout);
        window.addEventListener('shuschool-token-refreshed', handleTokenRefreshed);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('shuschool-logout', handleForceLogout);
            window.removeEventListener('shuschool-token-refreshed', handleTokenRefreshed);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [token]);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);
            
            const response = await api.post('/auth/token', params);
            const { access_token, refresh_token } = response.data;
            
            localStorage.setItem('token', access_token);
            if (refresh_token) {
                localStorage.setItem('refreshToken', refresh_token);
            }
            
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            const userResponse = await api.get('/auth/me');
            
            setUser(userResponse.data);
            setToken(access_token);
            setLoading(false);
            return userResponse.data;
        } catch (err) {
            setLoading(false);
            throw err;
        }
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    };

    const telegramLogin = async (initData, botType = "student") => {
        setLoading(true);
        try {
            const response = await api.post('/auth/telegram', { initData, bot_type: botType });
            const { access_token, refresh_token } = response.data;
            
            localStorage.setItem('token', access_token);
            if (refresh_token) {
                localStorage.setItem('refreshToken', refresh_token);
            }
            
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            const userResponse = await api.get('/auth/me');
            
            setUser(userResponse.data);
            setToken(access_token);
            setLoading(false);
            return userResponse.data;
        } catch (err) {
            setLoading(false);
            throw err;
        }
    };

    const telegramLink = async (initData, botType = "student") => {
        try {
            await api.post('/auth/telegram/link', { initData, bot_type: botType });
        } catch (err) {
            console.error("Failed to link telegram", err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout, telegramLogin, telegramLink }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
