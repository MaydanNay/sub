import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Book, QrCode, Settings, UserCircle, LogOut, User, Trophy, Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from '../components/Avatar';
import api from '../api';

const StudentLayout = ({ children }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { logout, user } = useAuth();
    const { lang, setLang, t } = useLanguage();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                if (user && user.role === 'student' && !currentPath.includes('/notifications')) {
                    const resp = await api.get('/student/history');
                    const lastChecked = localStorage.getItem('last_notifications_check') || 0;
                    const unread = resp.data.filter(t => new Date(t.timestamp).getTime() > Number(lastChecked)).length;
                    setUnreadCount(unread);
                }
            } catch (e) {
                console.error("Failed to fetch unread notifications count", e);
            }
        };
        fetchUnread();
    }, [currentPath, user]);

    const getPageTitle = (path) => {
        const titles = {
            '/student/dashboard': t('dashboard'),
            '/student/homework': t('homework'),
            '/student/scan': t('scan'),
            '/student/leaderboard': t('leaderboard'),
            '/student/classes': t('classes'),
            '/student/profile': t('profile'),
            '/student/notifications': t('notifications'),
            '/student/history': t('earning_history'),
        };
        return titles[path] || 'ShuSchool';
    };

    const isMascotRoom = currentPath === '/mascot-room';
    const isMarketplace = currentPath === '/marketplace';
    const hideHeader = isMascotRoom || isMarketplace;
    const hideNav = isMascotRoom; // Keep nav for marketplace, hide only for mascot room

    return (
        <div className="app-container">
            {!hideHeader && (
                <header className="app-header" style={{ justifyContent: 'space-between' }}>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '800' }}>
                        {getPageTitle(currentPath)}
                    </h2>
                    {currentPath.includes('/notifications') || currentPath.includes('/history') ? (
                        <Link to={currentPath.includes('/student') ? '/student/dashboard' : '/teacher/dashboard'} style={{ color: 'white', display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}>
                            <X size={24} />
                        </Link>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="lang-toggle">
                                <span className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</span>
                                <span className={lang === 'kz' ? 'active' : ''} onClick={() => setLang('kz')}>KZ</span>
                            </div>
                            <Link to="/student/notifications" style={{ position: 'relative', color: 'white', display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="badge">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <Link to="/student/profile" className="avatar-chip" style={{ padding: '0', border: '2px solid rgba(255,255,255,0.2)' }}>
                                <Avatar user={user} size={40} />
                            </Link>
                        </div>
                    )}
                </header>
            )}

            <div className="content-area" style={isMascotRoom ? { padding: 0 } : {}}>
                {children}
            </div>

            {!hideNav && (
                <nav className="bottom-nav">
                    <Link to="/student/dashboard" className={`nav-item ${currentPath === '/student/dashboard' ? 'active' : ''}`}>
                        <Home size={24} />
                        <span>{t('nav_home')}</span>
                    </Link>
                    <Link to="/student/homework" className={`nav-item ${currentPath === '/student/homework' ? 'active' : ''}`}>
                        <Book size={24} />
                        <span>{t('nav_homework')}</span>
                    </Link>
                    <Link to="/student/scan" className="nav-item-center">
                        <div className="center-orb">
                            <QrCode size={28} color="white" />
                        </div>
                    </Link>
                    <Link to="/student/leaderboard" className={`nav-item ${currentPath === '/student/leaderboard' ? 'active' : ''}`}>
                        <Trophy size={24} />
                        <span>{t('nav_rating')}</span>
                    </Link>
                    <Link to="/student/profile" className={`nav-item ${currentPath === '/student/profile' ? 'active' : ''}`}>
                        <UserCircle size={24} />
                        <span>{t('nav_profile')}</span>
                    </Link>
                </nav>
            )}

            <style jsx>{`
                .app-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    padding-bottom: 0;
                }
                .avatar-chip {
                    background: rgba(255,255,255,0.1);
                    padding: 6px 12px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                }
                .badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: #ff4d4d;
                    color: white;
                    border-radius: 50%;
                    width: 16px;
                    height: 16px;
                    font-size: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
                .lang-toggle {
                    display: flex;
                    background: rgba(255,255,255,0.1);
                    padding: 2px;
                    border-radius: 20px;
                    font-size: 11px;
                }
                .lang-toggle span {
                    padding: 4px 8px;
                    border-radius: 18px;
                    cursor: pointer;
                    color: rgba(255,255,255,0.5);
                    transition: all 0.3s;
                    font-weight: bold;
                }
                .lang-toggle span.active {
                    background: white;
                    color: #333;
                }
            `}</style>
        </div>
    );
};

export default StudentLayout;
