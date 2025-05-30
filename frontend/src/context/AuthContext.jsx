// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getUserData } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await getUserData(token);
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to load user data:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const data = await apiLogin({ email, password });
            localStorage.setItem('token', data.token);
            setUser(data.user); // Assuming API returns user data along with token
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const data = await apiRegister({ name, email, password, role });
            localStorage.setItem('token', data.token);
            // After registration, fetch user data to populate context
            const userData = await getUserData(data.token);
            setUser(userData);
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
