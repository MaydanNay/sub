import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Trophy, Zap, LogOut, User, ClipboardList, Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from '../components/Avatar';
import api from '../api';

const TeacherLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const { lang, setLang, t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                if (user && user.role === 'teacher' && !currentPath.includes('/notifications')) {
                    const resp = await api.get('/teacher/submissions');
                    const lastChecked = localStorage.getItem('last_submissions_check') || 0;
                    // For teachers, we treat all pending submissions since last check as "new notifications"
                    const unread = resp.data.filter(s => new Date(s.timestamp || Date.now()).getTime() > Number(lastChecked)).length;
                    setUnreadCount(unread);
                } else if (currentPath.includes('/notifications')) {
                    localStorage.setItem('last_submissions_check', Date.now().toString());
                    setUnreadCount(0);
                }
            } catch (e) {
                console.error("Failed to fetch teacher unread count", e);
            }
        };
        fetchUnread();
    }, [currentPath, user]);

    const getPageTitle = (path, search) => {
        const titles = {
            '/teacher/dashboard': t('dashboard'),
            '/teacher/panel': {
                'view=journal': t('journal'),
                'view=lessons': t('nav_lessons'), 
                'view=hw': t('homework_full_title'),
                'view=behavior': t('behavior'),
                'default': t('classes')
            },
            '/teacher/classes': t('classes'),
            '/teacher/profile': t('profile'),
            '/teacher/notifications': t('notifications'),
            '/teacher/leaderboard': t('leaderboard'),
        };

        if (path === '/teacher/panel') {
            const view = new URLSearchParams(search).get('view');
            return titles[path][`view=${view}`] || titles[path]['default'];
        }
        if (path === '/teacher/classes') {
            const className = new URLSearchParams(search).get('class');
            if (className) return `Класс ${className}`;
        }
        return titles[path] || 'ShuSchool PRO';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path, view) => {
        if (currentPath !== path) return false;
        if (!view) return true;
        const currentView = new URLSearchParams(currentSearch).get('view');
        return currentView === view;
    };

    const isClassDetail = currentPath === '/teacher/classes' && new URLSearchParams(currentSearch).get('class');
    const isNotifications = currentPath.includes('/notifications');

    return (
        <div className="app-container teacher-pro-theme">
            {/* Header */}
            <header className="app-header" style={{ justifyContent: 'space-between' }}>
                <h2 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '800' }}>
                    {getPageTitle(currentPath, currentSearch)}
                </h2>
                {isNotifications || isClassDetail ? (
                    <Link to={isClassDetail ? "/teacher/classes" : "/teacher/dashboard"} style={{ color: 'white', display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}>
                        <X size={24} />
                    </Link>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Language Toggle */}
                        <div className="lang-toggle">
                            <span 
                                className={lang === 'ru' ? 'active' : ''} 
                                onClick={() => setLang('ru')}
                            >RU</span>
                            <span 
                                className={lang === 'kz' ? 'active' : ''} 
                                onClick={() => setLang('kz')}
                            >KZ</span>
                        </div>

                        <Link to="/teacher/notifications" style={{ position: 'relative', color: 'white', display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="badge">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/teacher/profile" style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar user={user} size={40} />
                        </Link>
                    </div>
                )}
            </header>

            {/* Content area */}
            <main className="content-area">
                {children}
            </main>

            {/* Bottom Nav */}
            <nav className="bottom-nav">
                <Link to="/teacher/dashboard" className={`nav-item ${isActive('/teacher/dashboard') ? 'active' : ''}`}>
                    <LayoutDashboard size={24} />
                    <span>{t('nav_home')}</span>
                </Link>
                <Link to="/teacher/panel?view=journal" className={`nav-item ${isActive('/teacher/panel', 'journal') ? 'active' : ''}`}>
                    <ClipboardList size={24} />
                    <span>{t('journal')}</span>
                </Link>
                
                <Link to="/teacher/panel?view=lessons" className="nav-item-center">
                    <div className={`center-orb pro-orb ${isActive('/teacher/panel', 'lessons') ? 'active-orb' : ''}`}>
                        <Zap size={28} color="white" />
                    </div>
                </Link>

                <Link to="/teacher/panel?view=hw" className={`nav-item ${isActive('/teacher/panel', 'hw') ? 'active' : ''}`}>
                    <BookOpen size={24} />
                    <span>{t('nav_homework')}</span>
                </Link>
                <Link to="/teacher/classes" className={`nav-item ${isActive('/teacher/classes') ? 'active' : ''}`}>
                    <Users size={24} />
                    <span>{t('classes')}</span>
                </Link>
            </nav>

            <style jsx>{`
                .app-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    max-width: 500px;
                    margin: 0 auto;
                    position: relative;
                    overflow: hidden;
                }
                .teacher-pro-theme {
                    background: #111;
                    color: white;
                }
                .app-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background: #111;
                    z-index: 100;
                }
                .avatar-chip {
                    background: #222;
                    border: 1px solid #333;
                    padding: 8px 16px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: white;
                }
                .center-orb {
                    width: 60px;
                    height: 60px;
                    background: var(--accent-yellow);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(255, 236, 139, 0.4);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .active-orb {
                    transform: scale(1.1);
                    box-shadow: 0 0 25px var(--accent-yellow);
                }
                .active-orb :global(svg) {
                    color: white !important;
                }
                .nav-item-center {
                    position: relative;
                    text-decoration: none;
                }
                .pro-tag {
                    font-size: 10px;
                    background: var(--accent-yellow);
                    color: black;
                    padding: 2px 6px;
                    border-radius: 6px;
                    font-weight: 900;
                    margin-left: 4px;
                }
                .logout-icon-btn {
                    background: transparent;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .logout-icon-btn:hover {
                    color: #ff4d4d;
                }
                .content-area {
                    flex: 1;
                    overflow-y: auto;
                    padding-bottom: 90px;
                }
                .btn-secondary {
                    background: #eee;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
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

export default TeacherLayout;
