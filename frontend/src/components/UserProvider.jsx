import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const USER_PHONE = "7770000000";

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            // Mock login for demo purposes (ensure user exists)
            await axios.post(`${API_URL}/auth/login`, null, { params: { phone: USER_PHONE } });

            const res = await axios.get(`${API_URL}/user/${USER_PHONE}`);
            setUser(res.data);
        } catch (err) {
            console.error("Error fetching user:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, fetchUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};
