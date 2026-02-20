import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const show = (message, type = 'info') => {
        setNotification({ message, type });
    };

    const close = () => setNotification(null);

    // Icon mapping
    const icons = {
        success: <Check className="w-8 h-8 text-green-500" />,
        error: <X className="w-8 h-8 text-red-500" />,
        warning: <AlertCircle className="w-8 h-8 text-yellow-500" />,
        info: <Info className="w-8 h-8 text-blue-500" />
    };

    const colors = {
        success: 'bg-green-50 text-green-900',
        error: 'bg-red-50 text-red-900',
        warning: 'bg-yellow-50 text-yellow-900',
        info: 'bg-blue-50 text-blue-900'
    };

    return (
        <NotificationContext.Provider value={{ show, close }}>
            {children}
            <AnimatePresence>
                {notification && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        style={{ maxWidth: '28rem', left: '50%', transform: 'translateX(-50%)' }}
                        onClick={close}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[32px] p-6 shadow-2xl w-full max-w-[280px] text-center relative overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className={`absolute top-0 inset-x-0 h-24 ${colors[notification.type].split(' ')[0]} -z-10 rounded-b-[50%] opacity-50`} />

                            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 relative z-10">
                                {icons[notification.type]}
                            </div>

                            <h3 className="text-lg font-black text-gray-800 mb-2 leading-tight">
                                {notification.type === 'error' ? 'Упс!' :
                                    notification.type === 'success' ? 'Успех!' :
                                        notification.type === 'warning' ? 'Внимание' : 'Информация'}
                            </h3>

                            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
                                {notification.message}
                            </p>

                            <button
                                onClick={close}
                                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-transform"
                            >
                                Понятно
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
};
