import React from 'react';
import useGameStore from './store';
import { motion } from 'framer-motion';

const ShopVisual = () => {
    const { shopUpgradeLevel } = useGameStore();

    return (
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 group">
            {/* Background Base */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-10" />

            {/* Floor and Walls Isometric Style */}
            <div className="absolute bottom-0 w-full h-1/2 bg-slate-800/50 skew-x-[-20deg] origin-bottom -translate-x-4 border-t border-white/5" />

            <div className="absolute inset-0 flex items-center justify-center p-8">
                {/* Level 0: Empty/Base */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <motion.span
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-[12rem] select-none"
                    >
                        🏚️
                    </motion.span>

                    {/* Level 1: Counter/Tables */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: shopUpgradeLevel >= 1 ? 1 : 0, scale: shopUpgradeLevel >= 1 ? 1 : 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <span className="text-[10rem] drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">🪑</span>
                    </motion.div>

                    {/* Level 2: Coffee Machine */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: shopUpgradeLevel >= 2 ? 1 : 0, y: shopUpgradeLevel >= 2 ? 0 : -20 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="relative">
                            <span className="text-[8rem] drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">☕</span>
                            {shopUpgradeLevel >= 2 && (
                                <motion.div
                                    animate={{ y: [-10, -30], opacity: [0, 0.5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute top-0 right-0 text-2xl"
                                >
                                    💨
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Level 3: Final Decor & People */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: shopUpgradeLevel >= 3 ? 1 : 0 }}
                        className="absolute inset-0 flex items-center justify-between px-4 pb-20"
                    >
                        <motion.span animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl">🌿</motion.span>
                        <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity }} className="text-7xl">👥</motion.span>
                    </motion.div>
                </div>
            </div>

            {/* Glass Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

            {/* Level Badge */}
            <div className="absolute top-6 left-6 flex flex-col items-start gap-1">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/5">
                    Уровень бизнеса
                </span>
                <span className="text-4xl font-black text-white px-3 drop-shadow-lg">
                    {shopUpgradeLevel}
                </span>
            </div>

            {/* Corner Accent */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
        </div>
    );
};

export default ShopVisual;
