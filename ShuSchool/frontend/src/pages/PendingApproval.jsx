import React from 'react';
import { Clock, ShieldAlert, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const PendingApproval = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ 
            height: '100vh', 
            background: 'var(--bg-dark)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="card animate-fade-in" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%', 
                    backgroundColor: '#fff3e0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 25px',
                    color: '#ef6c00'
                }}>
                    <Clock size={48} className="animate-pulse" />
                </div>
                
                <h2 style={{ color: 'var(--text-dark)', marginBottom: '15px' }}>{t('pending_title')}</h2>
                
                <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>
                    {t('pending_desc')}
                </p>
                
                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '15px', marginBottom: '30px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <ShieldAlert size={20} color="#888" />
                    <span style={{ fontSize: '13px', color: '#888', textAlign: 'left' }}>
                        {t('pending_time')}
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <MessageSquare size={18} /> {t('contact_support')}
                    </button>
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            background: 'transparent', 
                            border: 'none', 
                            color: '#888', 
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <LogOut size={16} /> {t('logout_btn')}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pulse {
                    animation: pulse 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default PendingApproval;
