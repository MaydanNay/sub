import React from 'react';
import useGameStore from './store';
import { motion } from 'framer-motion';
import { Coins, Clock, ShoppingBag, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

const UPGRADE_PRICES = [150, 400, 800];
const UPGRADE_NAMES = ['Кофемашину', 'Мебель', 'Бариста'];

const HUD = () => {
    const { coins, movesLeft, shopUpgradeLevel, buyUpgrade } = useGameStore();

    const nextUpgradePrice = UPGRADE_PRICES[shopUpgradeLevel];
    const canAfford = nextUpgradePrice && coins >= nextUpgradePrice;
    const progressToNext = nextUpgradePrice ? Math.min(100, (coins / nextUpgradePrice) * 100) : 100;

    const handleBuy = () => {
        if (canAfford) {
            buyUpgrade(nextUpgradePrice);
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.7, x: 0.5 },
                colors: ['#f59e0b', '#78350f', '#fef3c7']
            });
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-sm">
            {/* Main Stats Card */}
            <div className="bg-slate-800/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-16 h-16 text-white" />
                </div>

                <div className="flex flex-col gap-6 relative z-10">
                    {/* Coins Stat */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/40">
                                <Coins className="text-white w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Баланс</p>
                                <p className="text-3xl font-black text-white tabular-nums">{coins}</p>
                            </div>
                        </div>
                    </div>

                    {/* Moves Stat */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
                                <Clock className="text-white w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Ходы</p>
                                <p className="text-3xl font-black text-white tabular-nums">{movesLeft}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop/Upgrade Section */}
            <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 shadow-xl">
                {shopUpgradeLevel < UPGRADE_PRICES.length ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Цель: {UPGRADE_NAMES[shopUpgradeLevel]}</span>
                            <span className="text-[10px] font-black text-white">{coins} / {nextUpgradePrice} 🟡</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressToNext}%` }}
                            />
                        </div>

                        <motion.button
                            whileHover={canAfford ? { scale: 1.02, y: -2 } : {}}
                            whileTap={canAfford ? { scale: 0.98 } : {}}
                            onClick={handleBuy}
                            disabled={!canAfford}
                            className={`
                                w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg transition-all
                                ${canAfford
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-900/20'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-white/5'}
                            `}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            ОБНОВИТЬ ({nextUpgradePrice}💰)
                        </motion.button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-2xl text-center shadow-lg"
                    >
                        <p className="text-white font-black text-xs uppercase tracking-widest">🎉 Максимум достигнут!</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HUD;
