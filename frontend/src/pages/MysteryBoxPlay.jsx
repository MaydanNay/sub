import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PrizeDrawer from '../components/PrizeDrawer';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { IconChest, IconTrophy, IconStar, IconCoin } from '../components/GameIcons';

const MysteryBoxPlay = () => {
    const navigate = useNavigate();
    const [isOpening, setIsOpening] = useState(false);
    const [isOpened, setIsOpened] = useState(false);
    const [reward, setReward] = useState(null);
    const [coins, setCoins] = useState(() => parseInt(localStorage.getItem('map_coins')) || 500);

    const rewards = [
        { title: 'iPhone 15 Pro', icon: '📱', rarity: 'legendary', prob: 0.01 },
        { title: 'Скидка 50%', icon: '🎟️', rarity: 'epic', prob: 0.1 },
        { title: 'Бесплатный кофе', icon: '☕', rarity: 'rare', prob: 0.3 },
        { title: '100 баллов', icon: '⭐', rarity: 'common', prob: 0.59 },
    ];

    const openBox = () => {
        if (isOpening || coins < 100) return;

        setCoins(prev => prev - 100);
        setIsOpening(true);

        // Shake animation for 1.5s then show reward
        setTimeout(() => {
            const rand = Math.random();
            let sum = 0;
            let selected = rewards[rewards.length - 1];

            for (const r of rewards) {
                sum += r.prob;
                if (rand < sum) {
                    selected = r;
                    break;
                }
            }

            setReward(selected);
            setIsOpening(false);
            setIsOpened(true);
        }, 1500);
    };

    const resetBox = () => {
        setIsOpened(false);
        setReward(null);
    };

    const PRIZES = [
        { id: 1, title: 'Первый сундук', description: 'Открой свой первый бокс', type: 'win' },
        { id: 2, title: 'Удачливый', description: 'Выбей редкий приз', type: 'win' },
        { id: 3, title: 'Коллекционер', description: 'Собери 10 наград', type: 'win' },
    ];

    return (
        <div className="bg-orange-50 min-h-screen flex flex-col items-center relative overflow-hidden font-sans">
            {/* Header */}
            <div className="w-full pt-8 pb-4 flex flex-col items-center z-50 relative">
                <motion.a
                    href="/"
                    className="text-5xl font-black text-orange-900 font-sans tracking-tighter"
                    whileHover={{ scale: 1.05 }}
                >
                    SHU
                </motion.a>
                <div className="flex items-center gap-2 mt-2 bg-white/80 px-4 py-1 rounded-full shadow-sm border border-orange-100">
                    <IconCoin className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-orange-900">{coins}</span>
                </div>
            </div>

            <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center px-4 relative z-10">
                <AnimatePresence mode="wait">
                    {!isOpened ? (
                        <motion.div
                            key="closed"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                x: isOpening ? [0, -10, 10, -10, 10, 0] : 0,
                                rotate: isOpening ? [0, -5, 5, -5, 5, 0] : 0
                            }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            transition={{
                                x: { duration: 0.1, repeat: isOpening ? 15 : 0 },
                                rotate: { duration: 0.1, repeat: isOpening ? 15 : 0 }
                            }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative group cursor-pointer" onClick={openBox}>
                                <div className="absolute -inset-8 bg-orange-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                <IconChest className="w-64 h-64 drop-shadow-[0_20px_50px_rgba(251,146,60,0.4)] relative z-10" />
                                {isOpening && (
                                    <motion.div
                                        className="absolute inset-0 bg-white rounded-full z-20 blur-2xl"
                                        animate={{ opacity: [0, 0.8, 0], scale: [1, 1.5, 1] }}
                                        transition={{ duration: 0.5, repeat: 3 }}
                                    />
                                )}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isOpening || coins < 100}
                                onClick={openBox}
                                className={`mt-12 px-12 py-4 rounded-2xl font-black text-white text-xl shadow-xl transition-all uppercase tracking-widest
                                    ${coins < 100 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-orange-200'}`}
                            >
                                {isOpening ? 'ОТКРЫВАЕМ...' : 'ОТКРЫТЬ (100 🪙)'}
                            </motion.button>
                            <p className="mt-4 text-orange-800/50 font-bold text-sm uppercase tracking-tighter">
                                Нажми на сундук, чтобы испытать удачу
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="opened"
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="flex flex-col items-center text-center"
                        >
                            <motion.div
                                className="text-[140px] mb-6 drop-shadow-2xl"
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {reward.icon}
                            </motion.div>

                            <h2 className="text-4xl font-black text-orange-900 mb-2 uppercase tracking-tight">
                                {reward.title}!
                            </h2>
                            <p className={`text-sm font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-8
                                ${reward.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-600' :
                                    reward.rarity === 'epic' ? 'bg-purple-100 text-purple-600' :
                                        reward.rarity === 'rare' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                {reward.rarity} Reward
                            </p>

                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={resetBox}
                                    className="px-8 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-black uppercase"
                                >
                                    ЕЩЁ РАЗ
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-3 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-100 uppercase"
                                >
                                    ЗАБРАТЬ
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <div className="w-full max-w-4xl px-4 mt-8 mb-20 z-10">
                <PrizeDrawer
                    prizes={PRIZES}
                    colorClass="text-orange-700"
                    itemBgClass="bg-white"
                />
            </div>

            <ThemeCustomizer />
        </div>
    );
};

export default MysteryBoxPlay;
