import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Timer, Users, ChevronRight, MapPin, Zap,
    Star, Play, Info, X, Medal
} from 'lucide-react';
import BottomNav from './BottomNav';
import { MARATHONS, RUNNER_LEVELS, getLevelByKm, MY_STATS } from './gameData';
import { ART_SHAPES } from './artShapes';
import useShuRunStore from './useShuRunStore';

const statusLabel = {
    active: { text: 'ИДЁТ', color: 'bg-emerald-500 text-white animate-pulse' },
    upcoming: { text: 'СКОРО', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    finished: { text: 'ЗАВЕРШЁН', color: 'bg-slate-700 text-slate-400' },
};

const formatDays = (d) => {
    if (d === 1) return '1 день';
    if (d < 5) return `${d} дня`;
    return `${d} дней`;
};

export default function ShuRunHome() {
    const navigate = useNavigate();
    const selectMarathon = useShuRunStore(s => s.selectMarathon);
    const isRunning = useShuRunStore(s => s.isRunning);
    const user = useShuRunStore(s => s.user);
    const finishedRuns = useShuRunStore(s => s.finishedRuns);
    const allCapturedZones = useShuRunStore(s => s.allCapturedZones);
    const [detail, setDetail] = useState(null);
    const [activeTab, setActiveTab] = useState('art');

    // Auth Guard
    useEffect(() => {
        if (!user?.isAuthenticated) {
            navigate('/game/shurun');
        }
    }, [user, navigate]);

    const totalRealKm = finishedRuns.reduce((acc, r) => acc + r.km, 0);
    const displayTotalKm = (totalRealKm + MY_STATS.totalKm).toFixed(1);
    const myLevel = getLevelByKm(parseFloat(displayTotalKm));
    const nextLevel = RUNNER_LEVELS[myLevel.level] || myLevel;
    const progress = ((parseFloat(displayTotalKm) - myLevel.minKm) / (nextLevel.maxKm - myLevel.minKm)) * 100;
    const marathonsCount = finishedRuns.length + MY_STATS.marathonsFinished;
    const medalsCount = finishedRuns.filter(r => r.rewardClaimed).length + MY_STATS.medalsCount;

    const handleRun = (marathon) => {
        selectMarathon(marathon);
        navigate('/game/shurun/run');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-montserrat pb-28">
            {/* Header */}
            <div className="relative overflow-hidden pt-10 text-center">
                {/* mesh gradient background */}
                <div className="absolute inset-0 bg-slate-950">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[100px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-teal-500/10 blur-[80px] rounded-full" />
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[90px] rounded-full animate-pulse" />
                </div>

                {/* pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                <div className="relative z-10 px-6">
                    <div className="flex justify-between items-start mb-6 text-left">
                        <div>
                            <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 opacity-80 px-0.5">
                                ShuRun • Главная
                            </div>
                            <h1 className="text-2xl font-bold font-montserrat tracking-tight mb-2">
                                Привет, {user?.nickname || 'Бегун'}!
                            </h1>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400 opacity-60" />
                                <span className="text-sm text-slate-400 font-semibold">{MY_STATS.city}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/5 backdrop-blur-xl px-3 py-2 rounded-2xl border border-white/10 text-emerald-400 text-sm font-bold flex items-center gap-1.5 shadow-2xl">
                                <Star className="w-3.5 h-3.5 fill-emerald-400" />
                                {displayTotalKm} км
                            </div>
                        </div>
                    </div>

                    {/* Level progress integrated into header area */}
                    <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-5 text-left mb-4">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
                            <span>До уровня «{nextLevel.name}»</span>
                            <span className="text-emerald-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] relative"
                            >
                                <motion.div
                                    animate={{ x: ['-100%', '100%'], opacity: [0, 0.3, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-white skew-x-[-20deg]"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 px-4 -mt-6 relative z-10">
                {[
                    { label: 'Всего км', value: displayTotalKm, icon: '📍' },
                    { label: 'Районов', value: allCapturedZones.length, icon: '🚩' },
                    { label: 'Медалей', value: medalsCount, icon: '🥇' },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="bg-slate-900 border border-white/10 rounded-2xl p-3 text-center shadow-xl"
                    >
                        <div className="text-xl mb-1">{s.icon}</div>
                        <div className="text-lg font-bold text-white">{s.value}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tab Switcher */}
            <div className="px-4 mt-8 mb-8">
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-1.5 flex gap-1 relative overflow-hidden">
                    <button
                        onClick={() => setActiveTab('art')}
                        className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative z-10 ${activeTab === 'art' ? 'text-white' : 'text-slate-500'}`}
                    >
                        GPS-Арт
                        {activeTab === 'art' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-emerald-600 rounded-xl -z-10 shadow-lg"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('marathons')}
                        className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative z-10 ${activeTab === 'marathons' ? 'text-white' : 'text-slate-500'}`}
                    >
                        Марафоны
                        {activeTab === 'marathons' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-emerald-600 rounded-xl -z-10 shadow-lg"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'art' ? (
                        <motion.div
                            key="art"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="px-6 mb-3">
                                <h2 className="text-base font-bold flex items-center gap-2 font-montserrat">
                                    <Star className="w-4 h-4 text-amber-400" />
                                    GPS-Арт Забеги
                                </h2>
                            </div>
                            <div className="px-4 grid grid-cols-2 gap-4 pb-2">
                                {ART_SHAPES.map((shape) => (
                                    <motion.div
                                        key={shape.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleRun(shape)}
                                        className="bg-slate-900/60 border border-white/10 rounded-3xl p-4 flex flex-col items-center justify-center gap-2"
                                    >
                                        <div className="text-4xl mb-1">{shape.emoji}</div>
                                        <div className="text-white font-bold text-sm text-center line-clamp-1 font-montserrat">{shape.name}</div>
                                        <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">{shape.distance} км</div>
                                        <button className="w-full mt-2 bg-emerald-500 text-white font-bold py-2 rounded-xl text-[10px] uppercase shadow-lg shadow-emerald-500/20">
                                            Выбрать
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="marathons"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="px-6 space-y-8">
                                {/* Active Marathons */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-base font-bold flex items-center gap-2 font-montserrat">
                                            <span className="flex items-center justify-center w-7 h-7 bg-emerald-500/10 rounded-xl text-base">🔥</span>
                                            Идут сейчас
                                        </h2>
                                        <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                                            {MARATHONS.filter(m => m.status === 'active').length} доступно
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {MARATHONS.filter(m => m.status === 'active').map((m, i) => {
                                            const sl = statusLabel[m.status];
                                            const fillPct = (m.participants / m.maxParticipants) * 100;
                                            return (
                                                <motion.div
                                                    key={m.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.05 * i }}
                                                    className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-xl"
                                                >
                                                    <div className={`h-1.5 w-full bg-gradient-to-r ${m.color}`} />
                                                    <div className="p-5">
                                                        <div className="flex items-start justify-between gap-3 mb-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${sl.color}`}>
                                                                        {sl.text}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 font-semibold">
                                                                        ещё {formatDays(m.daysLeft)}
                                                                    </span>
                                                                </div>
                                                                <h3 className="font-bold text-white text-base leading-tight font-montserrat">{m.title}</h3>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 leading-none">
                                                                    {m.distance}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 font-semibold uppercase">{m.unit}</div>
                                                            </div>
                                                        </div>

                                                        <div className="mb-4">
                                                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${fillPct}%` }}
                                                                    className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <motion.button
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleRun(m)}
                                                                className={`flex-1 bg-gradient-to-r ${m.color} text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg`}
                                                            >
                                                                <Play className="w-4 h-4" />
                                                                Бежать
                                                            </motion.button>
                                                            <button
                                                                onClick={() => setDetail(m)}
                                                                className="w-12 bg-slate-800 border border-white/10 text-slate-400 rounded-xl flex items-center justify-center"
                                                            >
                                                                <Info className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Upcoming Marathons */}
                                <div>
                                    <div className="flex items-center mb-4">
                                        <h2 className="text-base font-bold flex items-center gap-2 font-montserrat text-slate-400">
                                            <span className="flex items-center justify-center w-7 h-7 bg-blue-500/10 rounded-xl text-base opacity-70">⏳</span>
                                            Скоро начнутся
                                        </h2>
                                    </div>
                                    <div className="space-y-4">
                                        {MARATHONS.filter(m => m.status === 'upcoming').map((m, i) => {
                                            const sl = statusLabel[m.status];
                                            return (
                                                <motion.div
                                                    key={m.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 * i }}
                                                    className="bg-slate-900/40 border border-white/5 rounded-3xl p-5 grayscale opacity-60"
                                                >
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${sl.color}`}>
                                                                    {sl.text}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 font-semibold">
                                                                    через {formatDays(m.daysLeft - 7)}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-bold text-white/50 text-base leading-tight font-montserrat">{m.title}</h3>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="text-2xl font-bold text-slate-700 leading-none">
                                                                {m.distance}
                                                            </div>
                                                            <div className="text-[10px] text-slate-700 font-semibold uppercase">{m.unit}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        disabled
                                                        className="w-full bg-slate-800/50 text-slate-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                                                    >
                                                        <Timer className="w-4 h-4" />
                                                        Ожидание старта
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Detail modal */}
            <AnimatePresence>
                {detail && (
                    <div
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
                        onClick={() => setDetail(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-slate-900 w-full max-w-md rounded-t-[32px] p-6 pb-10"
                        >
                            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5" />
                            <div className={`h-1 w-full bg-gradient-to-r ${detail.color} rounded-full mb-5`} />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold font-montserrat">{detail.title}</h2>
                                    <p className="text-slate-400 text-sm">{detail.subtitle}</p>
                                </div>
                                <button onClick={() => setDetail(null)} className="text-slate-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed mb-5">{detail.description}</p>
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                {[
                                    { label: 'Дистанция', value: `${detail.distance} км` },
                                    { label: 'Топ-приз', value: detail.topPrize },
                                    { label: 'Участников', value: detail.participants.toLocaleString() },
                                    { label: 'Спонсор', value: detail.sponsor },
                                ].map((item, i) => (
                                    <div key={i} className="bg-slate-800 rounded-2xl p-3">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">{item.label}</div>
                                        <div className="text-white font-bold text-sm">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                            {detail.status === 'active' ? (
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => { setDetail(null); handleRun(detail); }}
                                    className={`w-full bg-gradient-to-r ${detail.color} text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2`}
                                >
                                    <Play className="w-5 h-5" /> Начать этот марафон
                                </motion.button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full bg-slate-800 text-slate-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
                                >
                                    <Timer className="w-5 h-5" /> Ещё не открыт
                                </button>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Active Run Floating Button */}
            <AnimatePresence>
                {isRunning && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-4 right-4 z-40"
                    >
                        <button
                            onClick={() => navigate('/game/shurun/run')}
                            className="w-full bg-emerald-500 text-white rounded-2xl p-4 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-emerald-400/30 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                                    <Timer className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Забег в процессе</div>
                                    <div className="text-sm font-bold font-montserrat tracking-tight">Нажми, чтобы вернуться на карту</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 opacity-50" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div >
    );
}
