import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getContentByPath } from '../data/businessContent';
import BusinessValueCard from './BusinessValueCard';

const BusinessValueControl = () => {
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState(null);

    useEffect(() => {
        const newContent = getContentByPath(pathname);
        setContent(newContent);
        // Close modal when path changes
        setIsOpen(false);
    }, [pathname]);

    if (!content) return null;

    return (
        <>
            <div className="fixed bottom-8 right-8 z-[100]">
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 text-white px-6 py-4 rounded-[2rem] font-black text-sm shadow-2xl flex items-center gap-3 border-2 border-white/20 backdrop-blur-md hover:bg-indigo-700 transition-all group"
                >
                    <span className="text-2xl group-hover:rotate-12 transition-transform">💼</span>
                    <span className="tracking-tight">ЗАЧЕМ ЭТО БИЗНЕСУ?</span>
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[1000] overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-lg"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="relative w-full max-w-5xl z-10 max-h-[90vh] flex flex-col items-center"
                        >
                            {/* Close button inside modal container */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl z-50 backdrop-blur-xl border border-white/20 transition-all"
                            >
                                ✕
                            </button>

                            <div className="w-full overflow-y-auto scrollbar-hide py-10 flex justify-center">
                                <BusinessValueCard
                                    {...content}
                                    className="m-0"
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BusinessValueControl;
