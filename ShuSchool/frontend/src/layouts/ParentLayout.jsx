import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, UserCircle, Bell, X, User, LayoutDashboard, Settings, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from '../components/Avatar';

const ParentLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const { logout, user } = useAuth();
    const { lang, setLang, t } = useLanguage();

    const getPageTitle = (path) => {
        const titles = {
            '/parent/dashboard': t('parent_dashboard') || 'Обзор',
            '/parent/profile': t('profile') || 'Профиль',
            '/parent/monitoring': t('monitoring') || 'Мониторинг',
            '/parent/notifications': t('notifications') || 'Уведомления',
        };
        return titles[path] || 'ShuSchool';
    };

    return (
        <div className="app-container parent-theme">
            <header className="app-header">
                <h2 className="header-title">
                    {getPageTitle(currentPath)}
                </h2>
                <div className="header-actions">
                    <div className="lang-toggle">
                        <span className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</span>
                        <span className={lang === 'kz' ? 'active' : ''} onClick={() => setLang('kz')}>KZ</span>
                    </div>
                    <Link to="/parent/profile" className="avatar-chip">
                        <Avatar user={user} size={36} />
                    </Link>
                </div>
            </header>

            <div className="content-area">
                {children}
            </div>

            <nav className="bottom-nav">
                <Link to="/parent/dashboard" className={`nav-item ${currentPath === '/parent/dashboard' ? 'active' : ''}`}>
                    <LayoutDashboard size={24} />
                    <span>{t('nav_home')}</span>
                </Link>
                
                <Link to="/parent/monitoring" className={`nav-item ${currentPath === '/parent/monitoring' ? 'active' : ''}`}>
                    <Activity size={24} />
                    <span>{t('monitoring') || 'Мониторинг'}</span>
                </Link>
            </nav>

            <style jsx>{`
                .parent-theme {
                    --parent-accent: #6366f1;
                    --parent-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                }
                .app-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    padding-bottom: 10px;
                }
                .header-title {
                    color: white;
                    margin: 0;
                    font-size: 24px;
                    font-weight: 800;
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .avatar-chip {
                    display: flex;
                    align-items: center;
                    padding: 2px;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 50%;
                    transition: border-color 0.3s;
                }
                .avatar-chip:hover {
                    border-color: var(--parent-accent);
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
                .nav-item.active {
                    color: var(--parent-accent) !important;
                }
            `}</style>
        </div>
    );
};

export default ParentLayout;
