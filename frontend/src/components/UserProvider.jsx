import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { storage } from '../utils/storage';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const GUEST_KEY = 'shuboom_guest_id';

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userPhone, setUserPhone] = useState(null);

    const isFetchingRef = React.useRef(false);

    // Initialize or get guest ID
    useEffect(() => {
        let id = storage.get(GUEST_KEY);
        if (!id) {
            id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            storage.set(GUEST_KEY, id);
        }
        setUserPhone(id);
    }, []);

    const fetchUser = useCallback(async () => {
        if (!userPhone || isFetchingRef.current) return;
        isFetchingRef.current = true;
        setError(null);
        try {
            // Mock login for demo purposes (ensure user exists)
            await axios.post(`${API_URL}/auth/login`, null, {
                params: { phone: userPhone },
                timeout: 5000
            });

            const res = await axios.get(`${API_URL}/user/${userPhone}`, {
                timeout: 5000
            });
            setUser(res.data);
        } catch (err) {
            console.error("Error fetching user:", err);
            setError(err.message || "Failed to fetch user data");
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [userPhone]);

    useEffect(() => {
        if (userPhone) {
            fetchUser();
        }
    }, [fetchUser, userPhone]);

    return (
        <UserContext.Provider value={{ user, userPhone, fetchUser, loading, error }}>
            {children}
        </UserContext.Provider>
    );
};
