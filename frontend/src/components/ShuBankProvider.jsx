import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const ShuBankContext = createContext();

export const useShuBank = () => useContext(ShuBankContext);

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const ShuBankProvider = ({ children }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isFetchingRef = useRef(false);
    const abortControllerRef = useRef(null);
    const isActionPending = useRef(false);

    const fetchState = useCallback(async () => {
        if (isFetchingRef.current) return;

        // Cancel previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        isFetchingRef.current = true;
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/shubank/state`, {
                timeout: 5000,
                signal: abortControllerRef.current.signal
            });
            setStats(res.data);
        } catch (err) {
            if (axios.isCancel(err)) return;
            console.error("Error fetching ShuBank state:", err);
            setError(err.message || "Failed to load bank data");
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    const syncMinigame = useCallback(async (coins) => {
        if (isActionPending.current) return false;
        isActionPending.current = true;
        try {
            const res = await axios.post(`${API_URL}/shubank/minigame/sync`, { coins }, { timeout: 5000 });
            if (res.data.success) {
                await fetchState();
                return true;
            }
        } catch (err) {
            console.error("Error syncing minigame:", err);
            return false;
        } finally {
            isActionPending.current = false;
        }
        return false;
    }, [fetchState]);

    const completeQuest = useCallback(async (questId) => {
        if (isActionPending.current) return false;
        isActionPending.current = true;
        try {
            const res = await axios.post(`${API_URL}/shubank/quest/complete`, { quest_id: questId }, { timeout: 5000 });
            if (res.data.success) {
                await fetchState();
                return true;
            }
        } catch (err) {
            console.error("Error completing quest:", err);
            return false;
        } finally {
            isActionPending.current = false;
        }
        return false;
    }, [fetchState]);

    const buyItem = useCallback(async (itemId) => {
        if (isActionPending.current) return { success: false, error: "Action in progress" };
        isActionPending.current = true;
        try {
            const res = await axios.post(`${API_URL}/shubank/shop/buy`, { item_id: itemId }, { timeout: 5000 });
            if (res.data.success) {
                await fetchState();
                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            isActionPending.current = false;
        }
        return { success: false };
    }, [fetchState]);

    const equipItem = useCallback(async (itemId) => {
        if (isActionPending.current) return { success: false };
        isActionPending.current = true;
        try {
            const res = await axios.post(`${API_URL}/shubank/inventory/equip`, { item_id: itemId }, { timeout: 5000 });
            if (res.data.success) {
                await fetchState();
                return { success: true };
            }
        } catch (err) {
            console.error("Error equipping item:", err);
        } finally {
            isActionPending.current = false;
        }
        return { success: false };
    }, [fetchState]);

    // Simulation helpers (Calling webhooks under /api/v1/shubank/webhooks/...)
    const simulateTransaction = useCallback(async () => {
        if (isActionPending.current) return;
        isActionPending.current = true;
        try {
            await axios.post(`${API_URL}/shubank/webhooks/bank/transaction`, {
                client_hash: stats?.bank_client_id || "demo_client_hash",
                amount: 100,
                category: "Shopping",
                timestamp: new Date().toISOString()
            }, { timeout: 5000 });
            await fetchState();
        } catch (err) {
            console.error("Simulation error:", err);
        } finally {
            isActionPending.current = false;
        }
    }, [fetchState, stats?.bank_client_id]);

    const simulateDeposit = useCallback(async (amount = 10000) => {
        if (isActionPending.current) return;
        isActionPending.current = true;
        try {
            const currentTotal = (stats?.deposit_balance || 0) + amount;
            await axios.post(`${API_URL}/shubank/webhooks/bank/deposit_update`, {
                client_hash: stats?.bank_client_id || "demo_client_hash",
                total_balance: currentTotal
            }, { timeout: 5000 });
            await fetchState();
        } catch (err) {
            console.error("Simulation error:", err);
        } finally {
            isActionPending.current = false;
        }
    }, [fetchState, stats?.bank_client_id, stats?.deposit_balance]);

    useEffect(() => {
        fetchState();
    }, [fetchState]);

    return (
        <ShuBankContext.Provider value={{
            stats, loading, error, fetchState, syncMinigame, buyItem, equipItem,
            completeQuest, simulateTransaction, simulateDeposit
        }}>
            {children}
        </ShuBankContext.Provider>
    );
};
