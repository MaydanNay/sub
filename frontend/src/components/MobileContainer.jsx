import React from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationProvider } from './NotificationProvider';
import { ScannerProvider } from './ScannerProvider';
import { UserProvider } from './UserProvider';

const MobileContainer = () => {
    return (
        <div className="min-h-screen bg-[#232323] flex justify-center font-shubody">
            {/* Phone Frame */}
            <div className="w-full max-w-md bg-shu-card min-h-screen relative shadow-[0_0_100px_rgba(0,0,0,0.5)] border-x-4 border-white/10 flex flex-col">
                <NotificationProvider>
                    <UserProvider>
                        <ScannerProvider>
                            <Outlet />
                        </ScannerProvider>
                    </UserProvider>
                </NotificationProvider>
            </div>
        </div>
    );
};

export default MobileContainer;
