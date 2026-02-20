import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_USER_STATE, BARYS_PHASES } from './qazData';
import { useNavigate } from 'react-router-dom';

const ShuQazHome = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(INITIAL_USER_STATE);
    const [isFeeding, setIsFeeding] = useState(false);
    const [isSluggish, setIsSluggish] = useState(false);

    const currentPhase = BARYS_PHASES.findLast(p => user.level >= p.level) || BARYS_PHASES[0];

    useEffect(() => {
        // TЗ Section 4: Streak/Sluggish Logic
        const lastFed = user.lastFed;
        const now = Date.now();
        const diffHours = (now - lastFed) / (1000 * 60 * 60);

        if (diffHours > 48) {
            setIsSluggish(true); // Sluggish animation if > 2 days
        }

        if (diffHours > 24) {
            // Check if fed at least 50% yesterday (Mock check: if hunger > 50)
            if (user.hunger < 50) {
                setUser(prev => ({ ...prev, streak: 0 })); // Streak reset
            }
        }
        const timer = setInterval(() => {
            setUser(prev => ({
                ...prev,
                hunger: Math.max(0, prev.hunger - 0.1)
            }));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const feedBarys = () => {
        if (user.baursaks < 5 || user.hunger >= 100) return;

        setIsFeeding(true);
        setTimeout(() => {
            setUser(prev => ({
                ...prev,
                baursaks: prev.baursaks - 5,
                hunger: Math.min(100, prev.hunger + 10),
                xp: prev.xp + 5,
                level: Math.floor((prev.xp + 5) / 100) + 1
            }));
            setIsFeeding(false);
        }, 1000);
    };

    return (
        <div className="w-full h-full min-h-[100dvh] bg-[#F0F4F8] text-[#2D3748] font-sans flex justify-center items-center overflow-hidden relative">
            {/* Mobile Emulator */}
            <div className="w-full max-w-[480px] h-full bg-white shadow-2xl overflow-hidden relative border-x border-slate-200 flex flex-col">

                {/* Header Section */}
                <div className="p-4 pb-1">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/')} className="text-slate-400 text-xl hover:text-slate-600 transition-colors mr-2">←</button>
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                                🐆
                            </div>
                            <div>
                                <h1 className="text-sm font-black uppercase tracking-widest text-slate-400 leading-none">ShuQaz</h1>
                                <p className="text-xl font-black text-slate-800">Барыс</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
                                🥯 {user.baursaks}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1">БАУРСАКИ</div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Уровень {user.level}</div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${user.xp % 100}%` }}
                                />
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 mt-1">{currentPhase.name}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Стрик</div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-orange-500 flex items-center gap-1">
                                    🔥 {user.streak}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 leading-tight">дней подряд</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Barys */}
                <div className="flex-grow flex flex-col items-center justify-center relative px-6">
                    {/* Hunger Gauge */}
                    <div className="absolute top-4 left-6 right-6">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                            <span>Сытость</span>
                            <span className={user.hunger < 20 ? 'text-red-500' : ''}>{Math.round(user.hunger)}%</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full border border-slate-200 p-0.5">
                            <motion.div
                                animate={{ width: `${user.hunger}%`, backgroundColor: user.hunger < 20 ? '#ef4444' : '#10b981' }}
                                className="h-full rounded-full"
                            />
                        </div>
                    </div>

                    {/* Barys Character */}
                    <div className="relative">
                        <motion.div
                            animate={isSluggish ? {
                                opacity: [0.6, 0.4, 0.6],
                                x: [0, 2, 0, -2, 0]
                            } : {
                                y: [0, -10, 0],
                                scale: currentPhase.scale + (isFeeding ? 0.1 : 0)
                            }}
                            transition={isSluggish ? { repeat: Infinity, duration: 5 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className={`text-[160px] cursor-pointer drop-shadow-xl select-none ${isSluggish ? 'filter grayscale shadow-none' : ''}`}
                            onClick={() => setUser(prev => ({ ...prev, baursaks: prev.baursaks + 1 }))}
                        >
                            🐆
                        </motion.div>

                        <AnimatePresence>
                            {isFeeding && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                    animate={{ opacity: 1, y: -100, scale: 1.5 }}
                                    exit={{ opacity: 0, scale: 2 }}
                                    className="absolute top-1/2 left-1/2 -ml-8 -mt-8 text-4xl"
                                >
                                    🥯
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <p className="text-center text-slate-400 text-sm italic font-medium mt-4">
                        {isSluggish ? 'Барыс заскучал... Заходите чаще!' : (user.hunger < 20 ? 'Барыс проголодался...' : 'Барыс доволен!')}
                    </p>
                </div>

                {/* Navigation & Controls */}
                <div className="p-6 pt-2">
                    <button
                        onClick={feedBarys}
                        disabled={user.baursaks < 5 || user.hunger >= 100 || isFeeding}
                        className={`w-full py-4 rounded-3xl font-black uppercase tracking-widest text-sm mb-4 transition-all
                            ${user.baursaks >= 5 && user.hunger < 100
                                ? 'bg-amber-400 text-amber-900 shadow-[0_6px_0_#d97706] active:translate-y-1 active:shadow-none'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                        `}
                    >
                        Покормить (5 🥯)
                    </button>

                    <button
                        onClick={() => navigate('/game/shuqaz/train')}
                        className="w-full bg-white border-2 border-blue-100 text-blue-600 font-black p-3 rounded-3xl uppercase text-sm tracking-widest flex items-center justify-center gap-4 hover:bg-blue-50 transition-colors shadow-sm active:translate-y-1"
                    >
                        <span className="text-2xl">⚡</span>
                        Тренировка
                    </button>
                </div>

                {/* Bottom Nav */}
                <div className="h-16 border-t border-slate-100 flex items-center justify-around px-8 relative z-20 bg-white sticky bottom-0">
                    <button onClick={() => navigate('/game/shuqaz')} className="text-blue-500 text-2xl hover:scale-110 transition-transform">🏠</button>
                    <button onClick={() => navigate('/game/shuqaz/dictionary')} className="text-slate-400 text-2xl hover:scale-110 transition-transform">🧭</button>
                    <button onClick={() => navigate('/game/leaderboard')} className="text-slate-400 text-2xl hover:scale-110 transition-transform">🏆</button>
                    <button onClick={() => alert('Профиль в разработке!')} className="text-slate-400 text-2xl hover:scale-110 transition-transform">👤</button>
                </div>
            </div>
        </div>
    );
};

export default ShuQazHome;
