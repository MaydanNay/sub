import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Settings, LogOut, User, Bell, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const AdminLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getPageTitle = (path) => {
        const titles = {
            '/admin/dashboard': 'Аналитика',
            '/admin/users': 'Управление персоналом',
            '/admin/classes': 'Управление классами',
            '/admin/settings': 'Настройки школы',
        };
        return titles[path] || 'Администрация';
    };

    return (
        <div className="app-container admin-theme">
            <header className="app-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="admin-orb">
                        <ShieldCheck size={20} color="black" />
                    </div>
                    <div>
                        <h2 className="header-title">{getPageTitle(currentPath)}</h2>
                        <p className="school-indicator">{user?.school_name || 'ShuSchool'}</p>
                    </div>
                </div>
                <Link to="/admin/profile" className="profile-orb" style={{ padding: '0', border: 'none' }}>
                    <Avatar user={user} size={42} />
                </Link>
            </header>

            <main className="content-area">
                {children}
            </main>

            <nav className="bottom-nav admin-nav">
                <Link to="/admin/dashboard" className={`nav-item ${currentPath === '/admin/dashboard' ? 'active' : ''}`}>
                    <ShieldCheck size={24} />
                    <span>Обзор</span>
                </Link>
                <Link to="/admin/users" className={`nav-item ${currentPath === '/admin/users' ? 'active' : ''}`}>
                    <Users size={24} />
                    <span>Персонал</span>
                </Link>
                <Link to="/admin/classes" className={`nav-item ${currentPath === '/admin/classes' ? 'active' : ''}`}>
                    <Layers size={24} />
                    <span>Классы</span>
                </Link>
                <Link to="/admin/settings" className={`nav-item ${currentPath === '/admin/settings' ? 'active' : ''}`}>
                    <Settings size={24} />
                    <span>Настройки</span>
                </Link>
            </nav>


            <style jsx>{`
                .admin-theme {
                    background: #0a0a0a;
                    color: white;
                }
                .app-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    background: rgba(10, 10, 10, 0.8);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .admin-orb {
                    width: 36px;
                    height: 36px;
                    background: var(--accent-yellow);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
                }
                .header-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }
                .school-indicator {
                    margin: 0;
                    font-size: 12px;
                    color: #666;
                    font-weight: 600;
                }
                .profile-orb {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: #1a1a1a;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .profile-orb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .admin-nav {
                    background: #111;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-bottom: env(safe-area-inset-bottom);
                }
                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    color: #555;
                    text-decoration: none;
                    font-size: 10px;
                    font-weight: 700;
                    transition: 0.3s;
                }
                .nav-item.active {
                    color: var(--accent-yellow);
                }
                .logout-item {
                    cursor: pointer;
                }
                .logout-item:hover {
                    color: #ef4444;
                }
                .app-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    max-width: 500px;
                    margin: 0 auto;
                    position: relative;
                    overflow: hidden;
                }
                .content-area {
                    flex: 1;
                    overflow-y: auto;
                    padding-bottom: 80px;
                }
                .bottom-nav {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 12px 0;
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    z-index: 1000;
                    background: #111;
                    border-radius: 30px 30px 0 0;
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.4);
                }
            `}</style>
        </div>
    );

};

export default AdminLayout;
