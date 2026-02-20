import React from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationProvider } from './NotificationProvider';
import { ScannerProvider } from './ScannerProvider';
import { UserProvider } from './UserProvider';

const MobileContainer = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex justify-center font-sans">
            {/* Phone Frame */}
            <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl flex flex-col">
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
