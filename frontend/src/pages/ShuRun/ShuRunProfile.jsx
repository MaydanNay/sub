import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Calendar, Zap } from 'lucide-react';
import BottomNav from './BottomNav';
import { ACHIEVEMENTS, MY_MEDALS, MY_STATS, getLevelByKm, RUNNER_LEVELS } from './gameData';

export default function ShuRunProfile() {
    const navigate = useNavigate();
    const myLevel = getLevelByKm(MY_STATS.totalKm);
    const nextLevel = RUNNER_LEVELS[myLevel.level] || myLevel;
    const progress = ((MY_STATS.totalKm - myLevel.minKm) / (nextLevel.maxKm - myLevel.minKm)) * 100;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-montserrat pb-28">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-violet-600 to-purple-800 px-6 pt-10 pb-16 overflow-hidden text-center">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />
                <button
                    onClick={() => navigate('/game/shurun/home')}
                    className="absolute left-4 top-10 bg-black/20 p-2 rounded-xl z-10"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 inline-block mb-3"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-5xl shadow-xl border-4 border-white/20">
                        🏃
                    </div>
                    <div
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-base border-2 border-slate-950"
                        style={{ backgroundColor: myLevel.color }}
                    >
                        {myLevel.emoji}
                    </div>
                </motion.div>

                <h1 className="text-2xl font-black relative z-10">{MY_STATS.name}</h1>
                <div className="flex items-center justify-center gap-3 mt-1 relative z-10">
                    <span className="flex items-center gap-1 text-purple-200 text-xs font-bold">
                        <MapPin className="w-3 h-3" /> {MY_STATS.city}
                    </span>
                    <span className="flex items-center gap-1 text-purple-200 text-xs font-bold">
                        <Calendar className="w-3 h-3" /> С {MY_STATS.joinedDate}
                    </span>
                </div>

                {/* Level badge */}
                <div className="relative z-10 mt-3 inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <span className="text-lg">{myLevel.emoji}</span>
                    <span className="font-black text-sm">{myLevel.name}</span>
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 px-4 -mt-8 relative z-10 mb-5">
                {[
                    { label: 'Всего километров', value: MY_STATS.totalKm, unit: 'км', icon: '📍', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20' },
                    { label: 'Марафонов', value: MY_STATS.marathonsFinished, unit: 'шт', icon: '🏁', color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/20' },
                    { label: 'Медалей', value: MY_STATS.medalsCount, unit: 'шт', icon: '🥇', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/20' },
                    { label: 'Лучший темп', value: MY_STATS.bestPace, unit: '', icon: '⚡', color: 'from-violet-500/20 to-purple-500/10 border-violet-500/20' },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`bg-gradient-to-br ${s.color} border rounded-2xl p-4`}
                    >
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-xl font-black text-white leading-none">{s.value}</div>
                        <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Level progress */}
            <div className="px-4 mb-6">
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-5">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Уровень</div>
                            <div className="font-black text-white flex items-center gap-2">
                                <span>{myLevel.emoji} {myLevel.name}</span>
                                <span className="text-slate-500">→</span>
                                <span>{nextLevel.emoji} {nextLevel.name}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-emerald-400">{Math.round(progress)}%</div>
                        </div>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 1.2 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-600 font-bold mt-1.5">
                        <span>{MY_STATS.totalKm} км</span>
                        <span>Цель: {nextLevel.maxKm} км</span>
                    </div>
                </div>
            </div>

            {/* Medals */}
            <div className="px-4 mb-6">
                <h2 className="font-black text-base mb-3 flex items-center gap-2">
                    🥇 Коллекция медалей
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {MY_MEDALS.map((medal, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.12 }}
                            className="flex-shrink-0 bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 text-center w-28"
                        >
                            <div className="text-4xl mb-2">{medal.emoji}</div>
                            <div className="text-[10px] font-black text-white leading-tight">{medal.title}</div>
                            <div className="text-[8px] text-slate-500 font-bold mt-0.5">{medal.date}</div>
                        </motion.div>
                    ))}
                    {/* Locked slot */}
                    <div className="flex-shrink-0 bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-4 text-center w-28 flex flex-col items-center justify-center opacity-40">
                        <div className="text-3xl mb-1">🔒</div>
                        <div className="text-[9px] text-slate-500 font-bold">Следующая</div>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div className="px-4">
                <h2 className="font-black text-base mb-3 flex items-center gap-2">
                    🎯 Достижения
                </h2>
                <div className="grid grid-cols-2 gap-2">
                    {ACHIEVEMENTS.map((a, i) => (
                        <motion.div
                            key={a.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className={`flex items-center gap-3 p-3 rounded-2xl border ${a.unlocked
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-slate-900 border-white/5 opacity-40'
                                }`}
                        >
                            <div className="text-2xl shrink-0">{a.emoji}</div>
                            <div className="min-w-0">
                                <div className="font-black text-[11px] text-white truncate">{a.title}</div>
                                <div className="text-[9px] text-slate-500 font-bold leading-tight">{a.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
