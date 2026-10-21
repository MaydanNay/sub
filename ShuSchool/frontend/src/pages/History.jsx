import React, { useState, useEffect } from 'react';
import { ArrowLeft, Coins, Flame, Book, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../api';

const History = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useLanguage();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/student/history');
                setTransactions(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch history:", err);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getIcon = (type) => {
        const mascotImg = <img src="/mascots/system.PNG" alt="system" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />;
        switch (type) {
            case 'attendance': return <Flame size={20} color="orange" />;
            case 'homework': return <Book size={20} color="var(--accent-green)" />;
            case 'behavior': return <AlertCircle size={20} color="red" />;
            case 'bonus': return mascotImg;
            case 'penalty': return mascotImg;
            default: return mascotImg;
        }
    };

    if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>{t('loading')}</div>;

    return (
        <div style={{ padding: '20px' }} className="animate-fade-in">

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                        {t('history_empty')}
                    </div>
                ) : (
                    transactions.map((t) => (
                        <div key={t.id} className="card animate-fade-in" style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ 
                                    background: t.amount > 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                    padding: '10px', 
                                    borderRadius: '12px' 
                                }}>
                                    {getIcon(t.type)}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-dark)' }}>{t.description}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-gray)' }}>
                                        {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <div style={{ 
                                fontWeight: '800', 
                                fontSize: '18px', 
                                color: t.amount > 0 ? 'var(--accent-green)' : '#ef4444' 
                            }}>
                                {t.amount > 0 ? `+${t.amount}` : t.amount}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default History;
