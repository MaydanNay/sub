import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Check, ChevronRight, Star, Coins } from 'lucide-react';

import BottomNav from './BottomNav';
import { CHARACTERS, getCurrentCharacter } from './gameData';
import { useNotification } from '../../components/NotificationProvider';
import axios from 'axios';

import { useUser } from '../../components/UserProvider';
import moneyPng from './images/money.PNG';
import persLevelPng from './images/pers_level.PNG';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const USER_PHONE = "7770000000";

const ShuBoomMap = () => {
    const { show } = useNotification();
    const { user, loading } = useUser();
    const [showLevelModal, setShowLevelModal] = useState(false);

    if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold italic">Загрузка пути...</div>;

    const currentChar = getCurrentCharacter(user.current_status);
    const sublevel = user.current_sublevel || 0;
    const nextCharIdx = CHARACTERS.findIndex(c => c.key === user.current_status) + 1;
    const nextChar = nextCharIdx < CHARACTERS.length ? CHARACTERS[nextCharIdx] : null;

    const currentSublevelData = currentChar ? currentChar.sublevels[sublevel] : null;
    const totalSublevels = currentChar?.sublevels.length || 1;
    const progressPercent = Math.round((sublevel / totalSublevels) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
            {/* Header with full character display */}
            <div className="relative z-0 bg-slate-100 pb-10 rounded-b-[40px] shadow-xl overflow-hidden">
                {/* Background Shape */}
                <div className={`absolute inset-x-0 top-0 h-full bg-gradient-to-br ${currentChar.color} -z-20`} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10" />

                <div className="relative z-10 p-4 pt-6">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col items-start gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full backdrop-blur">
                                <span className="text-white font-bold text-xs px-2">Уровень {sublevel + 1}</span>
                            </div>
                            <button
                                onClick={() => setShowLevelModal(true)}
                                className="text-[10px] text-white/90 font-black uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 active:scale-95 transition-all shadow-sm backdrop-blur-sm"
                            >
                                Все уровни
                            </button>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                            <div className="bg-black/20 backdrop-blur-md px-2 py-1.5 rounded-full text-white text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-sm">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{user?.balance_points || 0}</span>
                            </div>
                            <div className="bg-white/90 text-gray-900 px-2 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
                                <span>🪙</span>
                                <span>{user?.coins || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <h1 className="font-black text-3xl text-white mb-1 drop-shadow-md">{currentChar.name}</h1>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">{currentChar.description}</p>

                        {/* Full Size Character Image */}
                        <div className="relative h-[280px] w-full flex justify-center items-end">
                            <motion.img
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                src={currentChar.avatar}
                                alt={currentChar.name}
                                className="h-full object-contain filter drop-shadow-2xl z-10"
                            />
                            {/* Glow/Platform */}
                            <div className="absolute bottom-0 w-32 h-4 bg-black/20 blur-xl rounded-[50%]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Card (Moved from Home) */}
            <div className="px-4 -mt-6 relative z-20">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl p-5 shadow-xl shadow-indigo-100/50 border border-slate-100"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide bg-indigo-50 px-2 py-1 rounded-md">
                                Текущая цель
                            </span>
                            <h3 className="font-exrabold text-gray-800 text-lg mt-1 leading-snug">
                                {currentSublevelData?.task || "Исследуй мир!"}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl shrink-0">
                            {currentSublevelData?.icon || '🎯'}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium text-gray-500">
                            <span>Прогресс уровня</span>
                            <span className="text-gray-900 font-bold">{progressPercent}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Horizontal sub-levels */}
            <div className="px-4 py-4 mt-2">
                <h3 className="font-bold text-sm text-gray-600 mb-3">Подуровни</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
                    {currentChar.sublevels.map((sub, i) => {
                        let status = 'locked';
                        if (i < sublevel) status = 'completed';
                        else if (i === sublevel) status = 'active';

                        return (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                style={{ scrollSnapAlign: 'start' }}
                                className={`shrink-0 w-36 rounded-2xl p-3 border-2 transition-all ${status === 'completed' ? 'bg-green-50 border-green-300' :
                                    status === 'active' ? 'bg-white border-yellow-400 shadow-lg ring-2 ring-yellow-100' :
                                        'bg-slate-50 border-slate-200 opacity-50'
                                    }`}
                            >
                                {/* Top: icon + status */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl">{sub.icon}</span>
                                    {status === 'completed' && <Check className="w-4 h-4 text-green-500" />}
                                    {status === 'active' && <span className="text-yellow-500 text-xs font-bold animate-bounce">▶</span>}
                                    {status === 'locked' && <Lock className="w-3.5 h-3.5 text-slate-300" />}
                                </div>
                                <h4 className={`font-bold text-xs ${status === 'locked' ? 'text-slate-400' : 'text-gray-800'}`}>
                                    {sub.name}
                                </h4>
                                <p className={`text-[9px] mt-0.5 ${status === 'locked' ? 'text-slate-300' : 'text-gray-500'}`}>
                                    {sub.task}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pb-4">
                {currentChar.sublevels.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i < sublevel ? 'bg-green-500' :
                            i === sublevel ? 'bg-yellow-400 w-6' :
                                'bg-slate-200'
                            }`}
                    />
                ))}
            </div>

            {/* Character selector */}
            <div className="px-4 pb-3">
                <h3 className="font-bold text-sm text-gray-600 mb-3">Все персонажи</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {CHARACTERS.map((char, i) => {
                        const isCurrent = char.key === user.current_status;
                        const charIdx = CHARACTERS.findIndex(c => c.key === user.current_status);
                        const isUnlocked = i <= charIdx;
                        return (
                            <div
                                key={char.id}
                                className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${isCurrent ? 'bg-white shadow-md border-2 border-yellow-400' :
                                    isUnlocked ? 'bg-white shadow-sm border border-slate-200' :
                                        'bg-slate-100 border border-slate-200 opacity-50'
                                    }`}
                            >
                                {isUnlocked ?
                                    <img src={char.avatar} alt={char.name} className="w-8 h-8 rounded-lg" /> :
                                    <span className="text-xl">🔒</span>
                                }
                                <span className={`text-[9px] font-bold ${isCurrent ? 'text-yellow-600' : isUnlocked ? 'text-gray-600' : 'text-slate-400'}`}>
                                    {char.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Next Character Preview */}
            {nextChar && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mx-4 mb-4"
                >
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-2xl flex items-center gap-3">
                        <img src={nextChar.avatar} alt={nextChar.name} className="w-12 h-12 rounded-xl bg-white/10" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] uppercase opacity-50">Следующий персонаж</div>
                            <h3 className="font-bold text-sm">{nextChar.name}</h3>
                            <p className="text-[10px] opacity-60">Пройди все подуровни, чтобы разблокировать</p>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-30" />
                    </div>
                </motion.div>
            )}

            <BottomNav onScan={() => show('QR Сканер скоро!', 'info')} />

            {/* LEVELS MODAL */}
            <AnimatePresence>
                {showLevelModal && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setShowLevelModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="relative w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl"
                        >
                            <img src={persLevelPng} alt="All Levels" className="w-full h-auto object-contain" />
                            <button
                                onClick={() => setShowLevelModal(false)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center font-bold text-xl backdrop-blur-sm"
                            >
                                ✕
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShuBoomMap;
