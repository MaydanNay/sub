import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeCustomizer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [primaryColor, setPrimaryColor] = useState(() => {
        return localStorage.getItem('demo_primary_color') || '#4f46e5'; // Default indigo-600
    });

    useEffect(() => {
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        localStorage.setItem('demo_primary_color', primaryColor);
    }, [primaryColor]);

    const colors = [
        { name: 'Indigo', value: '#4f46e5' },
        { name: 'Red', value: '#e11d48' },
        { name: 'Emerald', value: '#059669' },
        { name: 'Amber', value: '#d97706' },
        { name: 'Sky', value: '#0284c7' },
        { name: 'Violet', value: '#7c3aed' },
        { name: 'Custom', value: 'picker' },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 mb-4 w-64"
                    >
                        <h4 className="text-gray-900 font-black text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
                            🎨 Брендирование
                        </h4>

                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {colors.map((c) => (
                                c.value === 'picker' ? (
                                    <div key="picker" className="relative">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-full h-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                                        />
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] font-bold text-gray-400 bg-white/20">
                                            HEX
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        key={c.value}
                                        onClick={() => setPrimaryColor(c.value)}
                                        className={`w-full h-10 rounded-lg shadow-inner transition-transform active:scale-90 ${primaryColor === c.value ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : ''}`}
                                        style={{ backgroundColor: c.value }}
                                        title={c.name}
                                    />
                                )
                            ))}
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase">Совет менеджеру:</p>
                            <p className="text-xs text-gray-500 italic">
                                "Выберите цвет бренда клиента, чтобы показать, как каталог впишется в их экосистему."
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-colors`}
                style={{ backgroundColor: primaryColor }}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.5 1.6-1.3 0-.4-.1-.8-.4-1.1-.3-.3-.4-.7-.4-1.2 0-1 1-1.6 2-1.6h2.1c3.1 0 5.7-2.5 5.7-5.7 0-5.1-4.7-9.1-9.7-9.1Z" /></svg>
                )}
            </motion.button>
        </div>
    );
};

export default ThemeCustomizer;
