import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

const Layout = ({ 
    children, 
    wallet, 
    stats, 
    isLeaderMode, 
    setIsLeaderMode, 
    isNotifOpen, 
    setIsNotifOpen, 
    notifications, 
    setNotifications, 
    setIsWalletOpen,
    theme = 'dark'
}) => {
    return (
        <div className={`crm-container ${theme === 'light' ? 'light-theme' : ''}`}>
            {theme === 'light' ? <div className="light-mesh-bg" /> : <div className="crm-mesh-bg" />}
            
            <Header 
                wallet={wallet}
                stats={stats}
                isLeaderMode={isLeaderMode}
                setIsLeaderMode={setIsLeaderMode}
                isNotifOpen={isNotifOpen}
                setIsNotifOpen={setIsNotifOpen}
                notifications={notifications}
                setNotifications={setNotifications}
                setIsWalletOpen={setIsWalletOpen}
                theme={theme}
            />

            <main className="crm-layout pb-24">
                {children}
            </main>

            <BottomNav isLeaderMode={isLeaderMode} theme={theme} />
        </div>
    );
};

export default Layout;
