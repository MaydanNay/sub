import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PrizeDrawer from '../components/PrizeDrawer';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { IconMap, IconTrophy, IconStar, IconHeart, IconCoin } from '../components/GameIcons';

const TreasureMapPlay = () => {
    const navigate = useNavigate();
    const [points, setPoints] = useState([
        { id: 1, x: 20, y: 80, status: 'unlocked', title: 'Причал Надежды', icon: '⚓', reward: '50 монет' },
        { id: 2, x: 40, y: 60, status: 'locked', title: 'Лес Загадок', icon: '🌲', reward: '100 монет' },
        { id: 3, x: 30, y: 30, status: 'locked', title: 'Гора Эха', icon: '🏔️', reward: 'Скидка 10%' },
        { id: 4, x: 60, y: 20, status: 'locked', title: 'Остров Черепа', icon: '💀', reward: 'Секретный приз' },
        { id: 5, x: 80, y: 50, status: 'locked', title: 'Пещера Золота', icon: '💎', reward: 'Скидка 50%' },
    ]);
    const [activePoint, setActivePoint] = useState(null);
    const [coins, setCoins] = useState(() => parseInt(localStorage.getItem('map_coins')) || 0);

    useEffect(() => {
        localStorage.setItem('map_coins', coins);
    }, [coins]);

    const handlePointClick = (point) => {
        if (point.status === 'locked') {
            // Check if previous point is unlocked
            const prevPoint = points.find(p => p.id === point.id - 1);
            if (prevPoint && prevPoint.status === 'completed') {
                setActivePoint(point);
            } else {
                // Toast or shake?
            }
        } else {
            setActivePoint(point);
        }
    };

    const completePoint = (id) => {
        setPoints(points.map(p => {
            if (p.id === id) return { ...p, status: 'completed' };
            if (p.id === id + 1) return { ...p, status: 'unlocked' };
            return p;
        }));
        setCoins(prev => prev + 100);
        setActivePoint(null);
    };

    const PRIZES = [
        { id: 1, title: 'Первооткрыватель', description: 'Посети первую точку', type: 'win' },
        { id: 2, title: 'Золотоискатель', description: 'Собери 500 монет', type: 'win' },
        { id: 3, title: 'Король Острова', description: 'Открой финальное сокровище', type: 'win' },
    ];

    return (
        <div className="bg-[#fdfcf0] min-h-screen flex flex-col items-center relative overflow-hidden font-sans">
            {/* Header */}
            <div className="w-full pt-8 pb-4 flex flex-col items-center z-50 relative">
                <motion.a
                    href="/"
                    className="text-5xl font-black text-amber-900 font-sans tracking-tighter"
                    whileHover={{ scale: 1.05 }}
                >
                    SHU
                </motion.a>
                <div className="flex items-center gap-2 mt-2 bg-white/80 px-4 py-1 rounded-full shadow-sm border border-amber-100">
                    <IconCoin className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-amber-900">{coins}</span>
                </div>
            </div>

            {/* Map Container */}
            <div className="w-full max-w-4xl aspect-[4/3] md:aspect-[16/9] relative mt-10 px-4">
                <div className="absolute inset-0 bg-[#e6d5b0] rounded-[3rem] shadow-2xl border-8 border-amber-800/20 overflow-hidden">
                    {/* Map Texture (simple CSS) */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#8b4513 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                    {/* SVG Path for the road */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path
                            d="M 20 80 Q 30 70 40 60 Q 35 45 30 30 Q 45 25 60 20 Q 70 35 80 50"
                            fill="none"
                            stroke="#8b4513"
                            strokeWidth="0.5"
                            strokeDasharray="2 2"
                            className="opacity-30"
                        />
                    </svg>

                    {/* Points */}
                    {points.map((point) => (
                        <motion.button
                            key={point.id}
                            className={`absolute w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-xl z-10
                                ${point.status === 'completed' ? 'bg-green-500 text-white' :
                                    point.status === 'unlocked' ? 'bg-amber-500 text-white ring-4 ring-white' :
                                        'bg-white/50 text-amber-900/30 grayscale'}`}
                            style={{ left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)' }}
                            whileHover={{ scale: point.status !== 'locked' ? 1.2 : 1 }}
                            onClick={() => handlePointClick(point)}
                        >
                            {point.status === 'completed' ? '✓' : point.icon}
                            {point.status === 'unlocked' && (
                                <motion.div
                                    className="absolute -inset-2 border-2 border-amber-500 rounded-full"
                                    animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Point Detail Modal */}
            <AnimatePresence>
                {activePoint && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-amber-900/40 backdrop-blur-sm"
                            onClick={() => setActivePoint(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center"
                        >
                            <div className="text-6xl mb-6">{activePoint.icon}</div>
                            <h3 className="text-2xl font-black text-amber-900 mb-2 uppercase tracking-tight">
                                {activePoint.title}
                            </h3>
                            <p className="text-slate-500 mb-8">
                                Выполни простое действие, чтобы открыть путь дальше и получить <b>{activePoint.reward}</b>!
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => completePoint(activePoint.id)}
                                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl text-white font-black shadow-lg shadow-yellow-200 uppercase"
                            >
                                ОТКРЫТЬ
                            </motion.button>

                            <button
                                onClick={() => setActivePoint(null)}
                                className="mt-4 text-sm text-gray-400 font-bold hover:text-gray-600"
                            >
                                ПОЗЖЕ
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="w-full max-w-4xl px-4 mt-12 mb-20">
                <PrizeDrawer
                    prizes={PRIZES}
                    colorClass="text-amber-700"
                    itemBgClass="bg-white"
                />
            </div>

            <ThemeCustomizer />
        </div>
    );
};

export default TreasureMapPlay;
