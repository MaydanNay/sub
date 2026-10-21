import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Crown, Globe, Shield, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from '../components/Avatar';

const SuperAdminLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { lang, setLang, t } = useLanguage();
    const currentPath = location.pathname;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getPageTitle = (path) => {
        const titles = {
            '/superadmin/dashboard': 'ОБЗОР СИСТЕМЫ',
            '/superadmin/users': 'УПРАВЛЕНИЕ ПРАВАМИ',
            '/superadmin/schools': 'РЕЕСТР ШКОЛ',
            '/superadmin/profile': 'ПРОФИЛЬ ВЛАДЕЛЬЦА',
        };
        return titles[path] || 'SHU SYSTEM';
    };
    return (
        <div className="super-admin-root">
             <header className="app-header glass-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="crown-wrap">
                        <Crown size={24} color="var(--accent-yellow)" />
                    </div>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '0.5px' }}>
                        {getPageTitle(currentPath)}
                    </h2>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="lang-toggle premium-toggle">
                        <span className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</span>
                        <span className={lang === 'kz' ? 'active' : ''} onClick={() => setLang('kz')}>KZ</span>
                    </div>
                    <Link to="/superadmin/profile" className="avatar-ring-premium">
                        <Avatar user={user} size={38} />
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="main-viewport premium-scroll">
                <section className="viewport-content">
                    {children}
                </section>
            </main>

            {/* Persistent Bottom Nav */}
            <nav className="bottom-nav glass-nav">
                <Link to="/superadmin/dashboard" className={`nav-item ${currentPath === '/superadmin/dashboard' ? 'active' : ''}`}>
                    <div className="nav-icon-wrap">
                        <LayoutDashboard size={20} />
                    </div>
                    <span>Обзор</span>
                </Link>
                <Link to="/superadmin/users" className={`nav-item ${currentPath === '/superadmin/users' ? 'active' : ''}`}>
                    <div className="nav-icon-wrap">
                        <Shield size={20} />
                    </div>
                    <span>Права</span>
                </Link>
                <Link to="/superadmin/schools" className={`nav-item ${currentPath === '/superadmin/schools' ? 'active' : ''}`}>
                    <div className="nav-icon-wrap">
                        <Globe size={20} />
                    </div>
                    <span>Школы</span>
                </Link>
            </nav>

            <style jsx>{`
                .super-admin-root {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    max-width: 480px;
                    margin: 0 auto;
                    background: radial-gradient(circle at top right, #111 0%, #000 100%);
                    color: #fff;
                    font-family: 'Outfit', sans-serif;
                    position: relative;
                }
                
                .glass-header {
                    position: sticky;
                    top: 0;
                    padding: 20px 20px 15px;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    z-index: 1000;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .crown-wrap {
                    background: rgba(255, 215, 0, 0.1);
                    padding: 8px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 215, 0, 0.2);
                }

                .premium-toggle {
                    background: rgba(255,255,255,0.03);
                    padding: 3px;
                    border-radius: 15px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .premium-toggle span {
                    padding: 5px 10px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 800;
                    transition: 0.3s;
                    color: #555;
                }
                .premium-toggle span.active {
                    background: var(--accent-yellow);
                    color: #000;
                    box-shadow: 0 0 15px rgba(255,215,0,0.3);
                }

                .avatar-ring-premium {
                    padding: 2px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, var(--accent-yellow), transparent);
                    display: flex;
                    transition: 0.3s;
                }
                .avatar-ring-premium:hover { transform: scale(1.05); rotate: 5deg; }
                
                .main-viewport { flex: 1; overflow: hidden; }
                .viewport-content { height: 100%; overflow-y: auto; padding: 25px 20px 120px; }
                
                .premium-scroll::-webkit-scrollbar { width: 0; display: none; }

                .glass-nav {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    height: 75px;
                    background: rgba(20,20,20,0.7);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 25px;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 0 15px;
                    z-index: 1100;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }

                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    color: #555;
                    text-decoration: none;
                    transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    flex: 1;
                }

                .nav-icon-wrap {
                    padding: 8px;
                    border-radius: 15px;
                    transition: 0.3s;
                }

                .nav-item span {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.5;
                }

                .nav-item.active {
                    color: var(--accent-yellow);
                    transform: translateY(-5px);
                }
                .nav-item.active .nav-icon-wrap {
                    background: rgba(255, 215, 0, 0.1);
                    color: var(--accent-yellow);
                    box-shadow: 0 5px 15px rgba(255,215,0,0.1);
                }
                .nav-item.active span {
                    opacity: 1;
                    color: var(--accent-yellow);
                }

                @media (max-width: 480px) {
                    .super-admin-root { width: 100vw; height: 100vh; max-width: none; }
                }
            `}</style>
        </div>
    );
};

export default SuperAdminLayout;
