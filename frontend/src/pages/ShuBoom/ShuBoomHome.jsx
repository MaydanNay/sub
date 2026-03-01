import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentCharacter, getNextCharacter, getCharacterById } from './gameData';
import { useUser } from '../../components/UserProvider';
import { Star, Zap, Coins, ChevronRight } from 'lucide-react';
import BottomNav from './BottomNav';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { useNotification } from '../../components/NotificationProvider';
import GameLoader from './GameLoader';

import localCoffeeBg from './images/local_coffee.PNG';
import moneyPng from './images/money.PNG';

// API Config
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const ShuBoomHome = () => {
    const { show } = useNotification();
    const { user, userPhone, fetchUser, loading, error } = useUser();
    const [infoOpen, setInfoOpen] = useState(false);

    // Derived state
    const currentChar = user
        ? (user.equipped_character_id ? getCharacterById(user.equipped_character_id) : getCurrentCharacter(user.current_status))
        : null;
    const sublevel = user ? (user.current_sublevel || 0) : 0;

    const [isClaiming, setIsClaiming] = useState(false);
    const [isQuestLoading, setIsQuestLoading] = useState(false);
    const [completedQuests, setCompletedQuests] = useState([]);

    const handleDailyReward = async () => {
        if (isClaiming || !userPhone) return;
        setIsClaiming(true);
        try {
            const res = await axios.post(`${API_URL}/user/daily_reward`, null, { params: { user_phone: userPhone } });
            if (res.data.success) {
                fetchUser();
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#FFD700'] });
                show(`Бонус получен! +${res.data.reward} монет. Серия: ${res.data.streak} дн.`, 'success');
            } else {
                show(`Уже получено! Приходи завтра.`, 'info');
            }
        } catch (e) {
            console.error(e);
            show("Ошибка получения награды", 'error');
        } finally {
            setIsClaiming(false);
        }
    };

    const handleCompleteQuest = async (questId) => {
        if (isQuestLoading || completedQuests.includes(questId) || !userPhone) return;
        setIsQuestLoading(true);
        try {
            const res = await axios.post(`${API_URL}/user/quests/complete`, null, {
                params: { quest_id: questId, user_phone: userPhone }
            });
            if (res.data.success) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                show(`Задание выполнено! +${res.data.reward} монет`, 'success');
                setCompletedQuests(prev => [...prev, questId]);
                await fetchUser();
            }
        } catch (err) {
            console.error(err);
            show("Ошибка при выполнении задания", "error");
        } finally {
            setIsQuestLoading(false);
        }
    };

    return (
        <GameLoader loading={loading} error={error} retry={fetchUser}>
            <div className="h-screen w-full overflow-hidden flex flex-col bg-slate-900 font-montserrat">

                {/* HEADER SECTION (Status, Level, Balances) */}
                <div className="relative z-20 shrink-0 bg-slate-100 rounded-b-[40px] shadow-xl overflow-hidden pb-8">
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentChar?.color || 'from-orange-400 to-red-500'}`} />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                    <div className="pt-6 px-6 relative z-10 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <div className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-0.5 font-montserrat">Твой Статус</div>
                                <h1 className="text-3xl font-black text-white leading-tight drop-shadow-md font-montserrat">{currentChar?.name}</h1>
                                <div className="mt-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold inline-flex items-center gap-1.5 w-fit border border-white/10">
                                    <span>Уровень {sublevel + 1}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 shadow-sm">
                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                    <span>{user?.balance_points || 0}</span>
                                </div>
                                <div className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                                    <span>🪙</span>
                                    <span>{user?.coins || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT SECTION (Bonus, Character, Quests) */}
                <div className="relative z-10 flex-1 -mt-10 pt-14 pb-24 bg-slate-900 flex flex-col">
                    {/* Background Image */}
                    <div className="absolute inset-0 w-full h-full z-0">
                        <img src={localCoffeeBg} alt="Background" loading="lazy" className="w-full h-full object-cover opacity-80" />
                        {/* Gradient Overlay for bottom fade */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                    </div>

                    <div className="px-6 relative z-10 flex flex-col h-full w-full">
                        {/* DAILY STREAK CARD */}
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setInfoOpen('bonus')}
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[24px] p-4 mb-2 shadow-xl shrink-0"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-1.5 text-sm font-montserrat">
                                        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        Ежедневный Бонус
                                    </h3>
                                    <p className="text-[10px] text-white/70 font-bold font-montserrat">
                                        Серия: <span className="text-white font-montserrat">{user?.daily_streak || 0} дн.</span>
                                    </p>
                                </div>
                                {(() => {
                                    const isClaimed = user?.last_bonus_date && new Date(user.last_bonus_date).toDateString() === new Date().toDateString();
                                    return (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); !isClaimed && handleDailyReward(); }}
                                            disabled={isClaimed || isClaiming}
                                            className={`px-3 py-1.5 rounded-lg font-bold text-[10px] shadow-lg transition-transform ${isClaimed
                                                ? 'bg-slate-700/50 text-slate-400 cursor-default'
                                                : 'bg-yellow-400 text-black active:scale-95'
                                                } ${(isClaiming && !isClaimed) ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            {isClaimed ? 'ЗАБРАНО' : isClaiming ? '...' : 'ЗАБРАТЬ'}
                                        </button>
                                    );
                                })()}
                            </div>

                            {/* 7 Days Preview */}
                            <div className="flex justify-between gap-1">
                                {[1, 2, 3, 4, 5, 6, 7].map(day => {
                                    const streak = user?.daily_streak || 0;
                                    const active = (streak % 7) + 1 === day;
                                    const done = (streak % 7) + 1 > day;
                                    return (
                                        <div key={day} className={`h-1 flex-1 rounded-full ${done ? 'bg-green-500' :
                                            active ? 'bg-yellow-400 animate-pulse' :
                                                'bg-white/20'
                                            }`} />
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Daily Quests Button (Moved Here) */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setInfoOpen('quests')}
                            className="w-full bg-white/90 backdrop-blur-md rounded-[24px] p-4 flex items-center justify-between shadow-lg border border-white/20 shrink-0 mb-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl text-indigo-600">
                                    📜
                                </div>
                                <div className="text-left font-montserrat">
                                    <h3 className="font-bold text-gray-900 text-sm font-montserrat">Задания на день</h3>
                                    <p className="text-[10px] text-gray-600 font-medium font-montserrat">Выполняй и получай монеты</p>
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded-full">
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                        </motion.button>

                        {/* Character & Visuals */}
                        <div className="flex justify-center items-end mt-auto mb-4 relative flex-1 min-h-0">
                            {/* Large Character */}
                            <motion.img
                                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 100 }}
                                src={currentChar?.avatar}
                                alt={currentChar?.name}
                                loading="lazy"
                                className="h-full max-h-[40vh] w-auto object-contain z-20"
                            />
                            {/* Glow effect */}
                            <div className="absolute bottom-0 w-32 h-4 bg-black/40 blur-xl rounded-[50%]" />
                        </div>

                    </div>
                </div >

                {/* MODALS */}
                < AnimatePresence >
                    {/* BONUS MODAL */}
                    {
                        infoOpen === 'bonus' && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setInfoOpen(false)}>
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    onClick={e => e.stopPropagation()}
                                    className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center relative overflow-hidden"
                                >
                                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-xl mx-auto mb-6">🎯</div>
                                    <h2 className="text-2xl font-black text-gray-800 mb-2 font-montserrat">Ежедневный Бонус</h2>
                                    <p className="text-gray-500 font-medium mb-8 font-montserrat">Заходи каждый день, чтобы увеличивать свою серию и получать больше монет!</p>

                                    <div className="grid grid-cols-4 gap-3 mb-8 font-montserrat">
                                        {[1, 2, 3, 4, 5, 6, 7, '∞'].map((d, i) => (
                                            <div key={i} className={`p-2 rounded-2xl border-2 ${(user?.daily_streak || 0) % 7 > i ? 'border-green-400 bg-green-50' : 'border-slate-100'} font-montserrat`}>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase font-montserrat">День</div>
                                                <div className="font-black text-gray-800 font-montserrat">{d}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setInfoOpen(false)}
                                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform shadow-xl"
                                    >
                                        КРУТО
                                    </button>
                                </motion.div>
                            </div>
                        )
                    }

                    {/* QUESTS MODAL */}
                    {
                        infoOpen === 'quests' && (
                            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/60 backdrop-blur-sm" onClick={() => setInfoOpen(false)}>
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    onClick={e => e.stopPropagation()}
                                    className="bg-slate-50 w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-6 pb-10 relative overflow-hidden max-h-[85vh] flex flex-col"
                                >
                                    <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />

                                    <div className="flex items-center justify-between mb-6 font-montserrat">
                                        <h2 className="text-2xl font-black text-gray-800 font-montserrat">Задания</h2>
                                        <div className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-lg font-montserrat">Обновится через 4ч</div>
                                    </div>

                                    <div className="space-y-3 overflow-y-auto pr-1">
                                        {[
                                            { id: "croissant", title: "Кофейный Барон", desc: "Купи 3 капучино", icon: "☕", progress: 0, max: 3, reward: 150, color: "text-amber-600 bg-amber-50" },
                                            { id: "coffee", title: "Сладкая Жизнь", desc: "Закажи десерт", icon: "🍰", progress: 0, max: 1, reward: 200, color: "text-pink-600 bg-pink-50" },
                                            { id: "friend", title: "Дружба", desc: "Пригласи друга", icon: "🤝", progress: 0, max: 1, reward: 500, color: "text-blue-600 bg-blue-50" }
                                        ].map((quest, i) => {
                                            const isDone = completedQuests.includes(quest.id);
                                            return (
                                                <motion.button
                                                    key={i}
                                                    whileTap={!isDone ? { scale: 0.98 } : {}}
                                                    onClick={() => handleCompleteQuest(quest.id)}
                                                    disabled={isDone || isQuestLoading}
                                                    className={`p-4 w-full rounded-3xl border border-slate-200 flex items-center gap-4 text-left transition-all ${isDone ? 'bg-slate-100 opacity-60 cursor-default' : 'bg-white shadow-sm hover:shadow-md'}`}
                                                >
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${quest.color}`}>
                                                        {quest.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0 font-montserrat">
                                                        <div className="flex justify-between items-start mb-1 font-montserrat">
                                                            <h4 className={`font-bold text-sm font-montserrat ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>{quest.title}</h4>
                                                            {isDone ?
                                                                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-md font-montserrat">Выполнено</span> :
                                                                <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1 font-montserrat">
                                                                    +{quest.reward} <img src={moneyPng} alt="coins" className="w-3 h-3 object-contain" />
                                                                </span>
                                                            }
                                                        </div>
                                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 font-montserrat">
                                                            <div
                                                                style={{ width: isDone ? '100%' : `${(quest.progress / quest.max) * 100}%` }}
                                                                className={`h-full rounded-full ${isDone ? 'bg-green-400' : 'bg-indigo-500'} font-montserrat`}
                                                            />
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 mt-1 font-medium font-montserrat">{quest.desc} • {isDone ? quest.max : quest.progress}/{quest.max}</div>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setInfoOpen(false)}
                                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg mt-6 active:scale-95 transition-transform"
                                    >
                                        ЗАКРЫТЬ
                                    </button>
                                </motion.div>
                            </div>
                        )
                    }
                </AnimatePresence >

                <BottomNav />
            </div>
        </GameLoader>
    );
};

export default ShuBoomHome;
