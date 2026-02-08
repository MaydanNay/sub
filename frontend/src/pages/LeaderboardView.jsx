import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LeaderboardView = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('weekly');

    const MOCK_DATA = {
        today: [
            { id: 1, name: 'Александр К.', score: 1250, avatar: '🦊', trend: 'up' },
            { id: 2, name: 'Мария П.', score: 1100, avatar: '🐱', trend: 'same' },
            { id: 3, name: 'Дмитрий С.', score: 950, avatar: '🐼', trend: 'down' },
            { id: 4, name: 'Елена В.', score: 820, avatar: '🐰', trend: 'up' },
            { id: 5, name: 'Сергей Т.', score: 750, avatar: '🦁', trend: 'same' },
        ],
        weekly: [
            { id: 1, name: 'Иван И.', score: 8400, avatar: '🐻', trend: 'up' },
            { id: 2, name: 'Ольга М.', score: 7900, avatar: '🦊', trend: 'up' },
            { id: 3, name: 'Алексей Р.', score: 7200, avatar: '🐺', trend: 'down' },
            { id: 4, name: 'Юлия Б.', score: 6800, avatar: '🦄', trend: 'same' },
            { id: 5, name: 'Никита К.', score: 6100, avatar: '🐯', trend: 'down' },
            { id: 6, name: 'Анна С.', score: 5800, avatar: '🐨', trend: 'up' },
            { id: 7, name: 'Вы (Вы)', score: 5450, avatar: '👤', trend: 'up', isUser: true },
            { id: 8, name: 'Максим Л.', score: 5200, avatar: '🐸', trend: 'same' },
        ],
        allTime: [
            { id: 1, name: 'Легенда99', score: 154200, avatar: '👑', trend: 'same' },
            { id: 2, name: 'ProGamer', score: 142000, avatar: '🎮', trend: 'up' },
            { id: 3, name: 'CoffeeMaster', score: 128500, avatar: '☕', trend: 'down' },
        ]
    };

    const currentData = MOCK_DATA[activeTab];

    const getRankIcon = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return index + 1;
    };

    const getTrendIcon = (trend) => {
        if (trend === 'up') return <span className="text-green-500 text-xs">▲</span>;
        if (trend === 'down') return <span className="text-red-500 text-xs">▼</span>;
        return <span className="text-gray-400 text-xs">●</span>;
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden">
            {/* Standardized Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/game/leaderboard')}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-bold"
                    >
                        <span>←</span> Выйти
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🏆</span>
                        <h1 className="text-lg font-black tracking-tighter">LEADERBOARD</h1>
                    </div>
                    <div className="w-20"></div> {/* Spacer for balance */}
                </div>
            </div>

            <div className="pt-24 px-4 max-w-lg mx-auto pb-12">
                {/* Tabs */}
                <div className="flex bg-white/5 rounded-2xl p-1 mb-8 border border-white/10">
                    {['today', 'weekly', 'allTime'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60 hover:text-white'
                                }`}
                        >
                            {tab === 'today' ? 'Сегодня' : tab === 'weekly' ? 'Неделя' : 'Все время'}
                        </button>
                    ))}
                </div>

                {/* Podium */}
                <div className="flex justify-center items-end gap-2 mb-10 h-48 px-2">
                    {/* 2nd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 flex flex-col items-center"
                    >
                        <div className="text-3xl mb-1">🥈</div>
                        <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-4xl mb-2 shadow-xl backdrop-blur-md">
                            {currentData[1]?.avatar}
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-t-xl w-full pt-4 pb-2 text-center border-x border-t border-white/10 h-20">
                            <p className="text-[10px] font-bold truncate px-1 opacity-80">{currentData[1]?.name}</p>
                            <p className="text-sm font-black text-indigo-300">{currentData[1]?.score}</p>
                        </div>
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col items-center z-10"
                    >
                        <div className="text-4xl mb-2">🥇</div>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-200 flex items-center justify-center text-5xl mb-3 shadow-[0_0_30px_rgba(234,179,8,0.3)] relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full"
                            />
                            {currentData[0]?.avatar}
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-t-2xl w-full pt-6 pb-2 text-center border-x border-t border-white/20 h-32">
                            <p className="text-xs font-black truncate px-1">{currentData[0]?.name}</p>
                            <p className="text-xl font-black text-yellow-500">{currentData[0]?.score}</p>
                        </div>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 flex flex-col items-center"
                    >
                        <div className="text-3xl mb-1">🥉</div>
                        <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-4xl mb-2 shadow-xl backdrop-blur-md">
                            {currentData[2]?.avatar}
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-t-xl w-full pt-3 pb-2 text-center border-x border-t border-white/10 h-16">
                            <p className="text-[10px] font-bold truncate px-1 opacity-80">{currentData[2]?.name}</p>
                            <p className="text-sm font-black text-indigo-300">{currentData[2]?.score}</p>
                        </div>
                    </motion.div>
                </div>

                {/* List */}
                <div className="space-y-3 mb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {currentData.slice(3).map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className={`flex items-center gap-4 p-4 rounded-3xl backdrop-blur-md border ${item.isUser ? 'bg-white/20 border-white/30 shadow-xl' : 'bg-white/5 border-white/10'
                                        } mb-3`}
                                >
                                    <span className="w-6 text-center font-black text-white/50">{index + 4}</span>
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                                        {item.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm">
                                            {item.name} {item.isUser && <span className="bg-white text-indigo-600 text-[10px] px-2 py-0.5 rounded-full ml-1">ВЫ</span>}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {getTrendIcon(item.trend)}
                                            <span className="text-[10px] opacity-60">в рейтинге</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg leading-tight">{item.score}</p>
                                        <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">XP</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bottom User Stats */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[32px] p-6 shadow-2xl text-white border border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-4xl">
                                👤
                            </div>
                            <div>
                                <p className="text-xs font-bold tracking-widest uppercase opacity-80">Ваш результат</p>
                                <h2 className="text-2xl font-black">7-е МЕСТО</h2>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black leading-tight">5450</p>
                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">До ТОП-3: +1750 XP</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardView;
