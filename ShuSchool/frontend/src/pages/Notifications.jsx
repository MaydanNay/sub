import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Coins, Flame, Book, Shield, Zap, Info, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api';

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState(null);

    useEffect(() => {
        // Mark as seen on mount
        if (user.role === 'student') {
            localStorage.setItem('last_notifications_check', Date.now().toString());
        } else if (user.role === 'teacher') {
            localStorage.setItem('last_submissions_check', Date.now().toString());
        }
        
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notifications');
                setNotifications(response.data);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user.role]);

    const getIcon = (type, amount, isLarge = false) => {
        const mascotImg = <img src="/mascots/system.PNG" alt="system" style={{ width: isLarge ? '50px' : '24px', height: isLarge ? '50px' : '24px', objectFit: 'contain' }} />;

        if (amount > 0) return <Coins size={isLarge ? 32 : 20} color="#ffd700" />;
        if (amount < 0) return <AlertCircle size={isLarge ? 32 : 20} color="#ff4d4d" />;

        switch (type) {
            case 'attendance': return <Flame size={isLarge ? 32 : 20} color="#ff9f43" />;
            case 'homework': return <Book size={isLarge ? 32 : 20} color="#28c76f" />;
            case 'behavior': return <Shield size={isLarge ? 32 : 20} color="#ea5455" />;
            case 'parent_link_request': return mascotImg;
            case 'mascot_unlock': return <div style={{ fontSize: isLarge ? '32px' : '20px' }}>🎁</div>;
            default: return <Zap size={isLarge ? 32 : 20} color="#ff9f43" />;
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        
        if (diffInMinutes < 1) return t('just_now');
        if (diffInHours < 1) return t('minutes_ago') ? t('minutes_ago').replace('{count}', diffInMinutes) : `${diffInMinutes}м назад`;
        if (diffInHours < 24) return t('hours_ago') ? t('hours_ago').replace('{count}', diffInHours) : `${diffInHours}ч назад`;
        
        return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    };

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            {t('loading_notifications')}
        </div>
    );

    // --- DETAIL VIEW (Full Page) ---
    if (selectedNotification) {
        return (
            <div className="notification-detail-page animate-fade-in" style={{ 
                minHeight: '100vh', 
                background: '#0a0a0a', 
                color: 'white',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '100%',
                zIndex: 2000,
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                    <button 
                        onClick={() => setSelectedNotification(null)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', padding: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '800', marginRight: '40px' }}>{t('notification_details') || 'Уведомление'}</h2>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                    {/* System Mascot Header */}
                    <div style={{ 
                        width: '180px', 
                        height: '180px', 
                        background: 'radial-gradient(circle, rgba(255, 236, 139, 0.15) 0%, transparent 70%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        position: 'relative'
                    }}>
                        <div className="mascot-glow" style={{ position: 'absolute', width: '100px', height: '100px', background: 'var(--accent-yellow)', opacity: 0.2, filter: 'blur(40px)', borderRadius: '50%' }}></div>
                        <img 
                            src="/mascots/system.PNG" 
                            alt="System Mascot" 
                            style={{ width: '140px', height: '140px', objectFit: 'contain', zIndex: 1, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} 
                        />
                    </div>

                    <div style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '30px', 
                        padding: '30px', 
                        width: '100%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        marginBottom: '30px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '10px' }}>
                                {getIcon(selectedNotification.type, selectedNotification.amount, true)}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {formatTime(selectedNotification.created_at)}
                            </span>
                        </div>
                        
                        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px', lineHeight: '1.2' }}>{selectedNotification.title}</h1>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '25px' }}>
                            {selectedNotification.description}
                        </p>

                        {selectedNotification.amount != null && (
                            <div style={{ 
                                padding: '20px', 
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)', 
                                borderRadius: '20px', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                textAlign: 'center'
                            }}>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{t('balance_change')}</p>
                                <h2 style={{ 
                                    fontSize: '32px', 
                                    fontWeight: '900', 
                                    margin: 0,
                                    color: selectedNotification.amount > 0 ? 'var(--accent-green)' : '#ff4d4d',
                                    textShadow: `0 0 20px ${selectedNotification.amount > 0 ? 'rgba(40, 199, 111, 0.3)' : 'rgba(255, 77, 77, 0.3)'}`
                                }}>
                                    {selectedNotification.amount > 0 ? `+${selectedNotification.amount}` : selectedNotification.amount} 🪙
                                </h2>
                            </div>
                        )}
                    </div>

                    {selectedNotification.attachment_url && (
                         <div style={{ width: '100%', marginBottom: '20px' }}>
                            <a 
                                href={selectedNotification.attachment_url} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    padding: '18px', 
                                    background: 'var(--accent-green)', 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    borderRadius: '20px',
                                    fontWeight: '800',
                                    boxShadow: '0 10px 20px rgba(40, 199, 111, 0.2)'
                                }}
                            >
                                {t('view_attachment_photo')} 📸
                            </a>
                         </div>
                    )}

                    {selectedNotification.type === 'parent_link_request' && !selectedNotification.is_read && (
                        <div style={{ display: 'flex', gap: '12px', width: '100%', marginBottom: '20px' }}>
                            <button 
                                className="btn-primary" 
                                style={{ flex: 1, backgroundColor: 'var(--accent-green)', height: '56px', borderRadius: '20px', fontWeight: '800' }}
                                onClick={async () => {
                                    try {
                                        await api.post(`/parent/respond-to-link-request?notif_id=${selectedNotification.id}&accept=true`);
                                        setSelectedNotification(null);
                                        window.location.reload();
                                    } catch (err) { alert("Ошибка"); }
                                }}
                            >
                                {t('approve_btn') || 'Принять'}
                            </button>
                            <button 
                                className="btn-secondary" 
                                style={{ flex: 1, backgroundColor: '#ff4d4d', color: 'white', height: '56px', borderRadius: '20px', fontWeight: '800', border: 'none' }}
                                onClick={async () => {
                                    try {
                                        await api.post(`/parent/respond-to-link-request?notif_id=${selectedNotification.id}&accept=false`);
                                        setSelectedNotification(null);
                                        window.location.reload();
                                    } catch (err) { alert("Ошибка"); }
                                }}
                            >
                                {t('decline_btn') || 'Отклонить'}
                            </button>
                        </div>
                    )}

                    <button 
                        className="btn-primary" 
                        style={{ width: '100%', height: '56px', borderRadius: '20px', fontWeight: '800', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
                        onClick={() => setSelectedNotification(null)}
                    >
                        {t('got_it')}
                    </button>
                </div>

                <style jsx>{`
                    .animate-fade-in {
                        animation: fadeIn 0.4s ease forwards;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulse-glow {
                        0% { transform: scale(1); opacity: 0.2; }
                        50% { transform: scale(1.2); opacity: 0.4; }
                        100% { transform: scale(1); opacity: 0.2; }
                    }
                    .mascot-glow {
                        animation: pulse-glow 3s infinite ease-in-out;
                    }
                `}</style>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div style={{ padding: '20px', minHeight: '100vh', paddingBottom: '100px' }} className="animate-fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '60px 20px', 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: '24px',
                        border: '1px dashed rgba(255,255,255,0.2)'
                    }}>
                        <Bell size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '15px' }} />
                        <h3 style={{ color: 'white', margin: '0 0 5px 0' }}>{t('no_notifications_title')}</h3>
                        <p style={{ color: 'var(--text-gray)', margin: 0, fontSize: '14px' }}>{t('no_notifications_desc')}</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div 
                            key={n.id} 
                            className="card notification-card animate-fade-in" 
                            onClick={async () => {
                                setSelectedNotification(n);
                                if (!n.is_read) {
                                    try { 
                                        await api.post(`/notifications/${n.id}/read`); 
                                        setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif));
                                    } catch(e) {}
                                }
                            }}
                            style={{ 
                                padding: '18px 20px', 
                                display: 'flex', 
                                gap: '15px', 
                                alignItems: 'center',
                                background: n.type === 'mascot_unlock' ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.05) 100%)' : (n.is_read ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)'),
                                border: n.type === 'mascot_unlock' ? '1px solid rgba(255, 215, 0, 0.4)' : (n.is_read ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255, 236, 139, 0.3)'),
                                boxShadow: n.type === 'mascot_unlock' ? '0 0 20px rgba(255, 215, 0, 0.1)' : (n.is_read ? 'none' : '0 4px 15px rgba(255, 236, 139, 0.1)'),
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                        >
                            {!n.is_read && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-yellow)',
                                    boxShadow: '0 0 10px var(--accent-yellow)'
                                }}></div>
                            )}
                            <div style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                padding: '10px', 
                                borderRadius: '12px',
                                flexShrink: 0,
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {getIcon(n.type, n.amount)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <h4 style={{ margin: 0, color: 'white', fontSize: '15px', fontWeight: '700' }}>{n.title}</h4>
                                    <span style={{ fontSize: '11px', color: 'var(--text-gray)' }}>{formatTime(n.created_at)}</span>
                                </div>
                                <p style={{ 
                                    margin: 0, 
                                    fontSize: '13px', 
                                    color: 'var(--text-gray)', 
                                    lineHeight: '1.4',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {n.description}
                                </p>
                            </div>
                            <ChevronRight size={18} color="rgba(255,255,255,0.3)" style={{ alignSelf: 'center' }} />
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .notification-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .notification-card:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Notifications;
