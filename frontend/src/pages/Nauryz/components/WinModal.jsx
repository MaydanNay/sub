import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconGift, IconX } from '../../../components/GameIcons';

const WinModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto"
            >
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-100 w-full max-w-sm rounded-[2rem] shadow-2xl relative p-6 text-center border-4 border-white/50"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 animate-bounce">
                        <IconGift className="w-12 h-12 text-white" />
                    </div>

                    <div className="mt-12">
                        <h2 className="text-3xl font-black text-amber-900 mb-2 leading-tight">
                            Құттықтаймыз!<br />Поздравляем!
                        </h2>
                        <p className="text-amber-800/80 mb-6 leading-relaxed">
                            Вы собрали полный дастархан и открыли все рецепты! Теперь вы настоящий мастер гостеприимства.
                        </p>

                        <div className="bg-white/60 rounded-xl p-4 mb-6 border border-amber-100">
                            <div className="text-sm font-bold text-amber-900 mb-1">Ваш приз:</div>
                            <div className="text-2xl font-black text-orange-600">«Ханский гостинец»</div>
                            <div className="text-xs text-amber-700 mt-1">Покажите этот экран на кассе Shu Bakery</div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transform transition-all active:scale-95 hover:scale-105"
                        >
                            Ура!
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WinModal;
