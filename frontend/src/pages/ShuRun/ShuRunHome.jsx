import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Timer, Users, ChevronRight, MapPin, Zap,
    Star, Play, Info, X, Medal
} from 'lucide-react';
import BottomNav from './BottomNav';
import { MARATHONS, RUNNER_LEVELS, getLevelByKm, MY_STATS } from './gameData';
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
    const selectMarathon = useShuRunStore((s) => s.selectMarathon);
    const [detail, setDetail] = useState(null);

    const myLevel = getLevelByKm(MY_STATS.totalKm);
    const nextLevel = RUNNER_LEVELS[myLevel.level] || myLevel;
    const progress = ((MY_STATS.totalKm - myLevel.minKm) / (nextLevel.maxKm - myLevel.minKm)) * 100;

    const handleRun = (marathon) => {
        selectMarathon(marathon);
        navigate('/game/shurun/run');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-montserrat pb-28">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-10 pb-14 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="text-emerald-200 text-[10px] font-black uppercase tracking-widest mb-1">
                            🏃 ShuRun
                        </div>
                        <h1 className="text-3xl font-black leading-tight">
                            {myLevel.emoji} {myLevel.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-200 opacity-70" />
                            <span className="text-sm text-emerald-100/80 font-semibold">{MY_STATS.city}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-emerald-200 text-sm font-black flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                            {MY_STATS.totalKm} км
                        </div>
                        <div className="text-xs text-emerald-200/60 mt-1 font-semibold">
                            {MY_STATS.marathonsFinished} марафона
                        </div>
                    </div>
                </div>

                {/* Level progress */}
                <div className="relative z-10 mt-4">
                    <div className="flex justify-between text-[10px] font-bold text-emerald-200/70 mb-1">
                        <span>Прогресс до «{nextLevel.name}»</span>
                        <span>{MY_STATS.totalKm} / {nextLevel.maxKm} км</span>
                    </div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                        />
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 px-4 -mt-6 relative z-10">
                {[
                    { label: 'Всего км', value: MY_STATS.totalKm, icon: '📍' },
                    { label: 'Марафонов', value: MY_STATS.marathonsFinished, icon: '🏁' },
                    { label: 'Медалей', value: MY_STATS.medalsCount, icon: '🥇' },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="bg-slate-900 border border-white/10 rounded-2xl p-3 text-center shadow-xl"
                    >
                        <div className="text-xl mb-1">{s.icon}</div>
                        <div className="text-lg font-black text-white">{s.value}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Section title */}
            <div className="px-6 mt-6 mb-3 flex items-center justify-between">
                <h2 className="text-lg font-black flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Активные марафоны
                </h2>
                <span className="text-xs text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded-lg">
                    {MARATHONS.filter(m => m.status === 'active').length} открыт
                </span>
            </div>

            {/* Marathon cards */}
            <div className="px-4 space-y-4">
                {MARATHONS.map((m, i) => {
                    const sl = statusLabel[m.status];
                    const fillPct = (m.participants / m.maxParticipants) * 100;
                    return (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-xl"
                        >
                            {/* Gradient band */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${m.color}`} />

                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${sl.color}`}>
                                                {sl.text}
                                            </span>
                                            {m.status === 'active' && (
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    ещё {formatDays(m.daysLeft)}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-black text-white text-base leading-tight">{m.title}</h3>
                                        <p className="text-slate-400 text-xs mt-0.5 font-semibold">{m.subtitle}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 leading-none">
                                            {m.distance}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase">{m.unit}</div>
                                    </div>
                                </div>

                                {/* Prize + sponsor */}
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
                                        <Medal className="w-3 h-3 text-amber-400" />
                                        <span className="text-[10px] font-black text-amber-400">{m.prize}</span>
                                    </div>
                                    <div
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg"
                                        style={{ backgroundColor: `${m.sponsorColor}15`, border: `1px solid ${m.sponsorColor}30` }}
                                    >
                                        <span className="text-[10px] font-bold" style={{ color: m.sponsorColor }}>
                                            {m.sponsor}
                                        </span>
                                    </div>
                                </div>

                                {/* Participants */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {m.participants.toLocaleString()} участников
                                        </span>
                                        <span>{m.maxParticipants.toLocaleString()} мест</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${fillPct}%` }}
                                            transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                                            className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {m.status === 'active' ? (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleRun(m)}
                                            className={`flex-1 bg-gradient-to-r ${m.color} text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg`}
                                        >
                                            <Play className="w-4 h-4" />
                                            Бежать
                                        </motion.button>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex-1 bg-slate-800 text-slate-500 font-black py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                                        >
                                            <Timer className="w-4 h-4" />
                                            {m.status === 'upcoming' ? `Через ${formatDays(m.daysLeft - 7)}` : 'Завершён'}
                                        </button>
                                    )}
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
                                    <h2 className="text-2xl font-black">{detail.title}</h2>
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
                                        <div className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">{item.label}</div>
                                        <div className="text-white font-black text-sm">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                            {detail.status === 'active' ? (
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => { setDetail(null); handleRun(detail); }}
                                    className={`w-full bg-gradient-to-r ${detail.color} text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2`}
                                >
                                    <Play className="w-5 h-5" /> Начать этот марафон
                                </motion.button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full bg-slate-800 text-slate-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2"
                                >
                                    <Timer className="w-5 h-5" /> Ещё не открыт
                                </button>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
}
