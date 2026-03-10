import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Zap, Truck } from 'lucide-react';
import BottomNav from './BottomNav';
import { ACHIEVEMENTS, MY_MEDALS, MY_STATS, getLevelByKm, RUNNER_LEVELS } from './gameData';
import useShuRunStore from './useShuRunStore';

export default function ShuRunProfile() {
    const navigate = useNavigate();
    const user = useShuRunStore(s => s.user);
    const finishedRuns = useShuRunStore(s => s.finishedRuns);
    const orders = useShuRunStore(s => s.orders);
    const [activeTab, setActiveTab] = React.useState('medals'); // 'medals' or 'achievements'
    const totalKm = finishedRuns.reduce((acc, run) => acc + run.km, 0) + MY_STATS.totalKm;
    const myLevel = getLevelByKm(totalKm);
    const nextLevel = RUNNER_LEVELS[myLevel.level] || myLevel;
    const progress = ((totalKm - myLevel.minKm) / (nextLevel.maxKm - myLevel.minKm)) * 100;

    const medalsCount = finishedRuns.filter(r => r.rewardClaimed).length + orders.length + MY_STATS.medalsCount;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-montserrat pb-28">
            {/* Header */}
            <div className="relative overflow-hidden pt-10 pb-20 text-center">
                {/* Complex Mesh Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-slate-950" />
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-violet-600/30 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-800/20 blur-[100px] rounded-full" />
                    <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[80px] rounded-full" />
                </div>

                {/* Decorative Pattern Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03] z-0"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />



                <div className="relative z-10 flex flex-col items-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-80">
                        ShuRun • Профиль
                    </div>
                    {/* Avatar with Glow */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative mb-6"
                    >
                        {/* Outer Glow */}
                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />

                        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-1 shadow-2xl">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl overflow-hidden border-2 border-white/10">
                                <span className="drop-shadow-lg">🏃</span>
                            </div>
                        </div>

                        {/* Level Emoji Overlay */}
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-2xl border-2 border-slate-950"
                            style={{ backgroundColor: myLevel.color }}
                        >
                            {myLevel.emoji}
                        </motion.div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold font-montserrat tracking-tight mb-8"
                    >
                        {user?.nickname || MY_STATS.name}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-4 text-white/50 text-[11px] font-bold uppercase tracking-[0.15em]"
                    >
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {MY_STATS.city}
                        </span>
                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" /> С {MY_STATS.joinedDate}
                        </span>
                    </motion.div>


                </div>
            </div>

            {/* Level progress */}
            <div className="px-6 mb-8 -mt-10 relative z-20">
                <div className="relative group">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[32px] -z-10" />
                    <div className="p-6">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-1.5 px-0.5">Твой путь бегуна</div>
                                <div className="font-bold text-xl text-white flex items-center gap-2.5">
                                    <span className="opacity-40 grayscale">{myLevel.emoji}</span>
                                    <span>{myLevel.name}</span>
                                    <ChevronRight className="w-4 h-4 text-white/20" />
                                    <span className="text-emerald-400">{nextLevel.name}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white leading-none tracking-tighter">
                                    {Math.round(progress)}<span className="text-emerald-500 text-lg">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="relative h-4 bg-white/5 rounded-2xl overflow-hidden p-0.5 border border-white/5">
                            {/* Glow behind the progress bar */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="absolute inset-y-0.5 left-0.5 bg-emerald-500/40 blur-md rounded-xl"
                            />

                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="relative h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            >
                                {/* Shimmer Effect */}
                                <motion.div
                                    animate={{
                                        x: ['-100%', '100%'],
                                        opacity: [0, 0.3, 0]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="absolute inset-0 bg-white skew-x-[-20deg]"
                                />
                            </motion.div>
                        </div>

                        <div className="flex justify-between items-center mt-3 px-1 text-[10px] font-bold tracking-wider uppercase">
                            <span className="text-white/40">{totalKm.toFixed(1)} км пройдено</span>
                            <span className="text-emerald-500/60 font-bold">Цель: {nextLevel.maxKm} км</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4 px-6 relative z-10 mb-8">
                {[
                    { label: 'Всего км', value: totalKm.toFixed(1), icon: '📍', color: 'text-emerald-400', glow: 'bg-emerald-500/10' },
                    { label: 'Марафонов', value: finishedRuns.length + MY_STATS.marathonsFinished, icon: '🏁', color: 'text-blue-400', glow: 'bg-blue-500/10' },
                    { label: 'Медалей', value: medalsCount, icon: '🥇', color: 'text-amber-400', glow: 'bg-amber-500/10' },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1, type: 'spring', damping: 20, stiffness: 100 }}
                        className={`relative group overflow-hidden ${s.isFull ? 'col-span-2' : ''}`}
                    >
                        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] group-hover:bg-white/[0.05] transition-colors" />
                        <div className={`absolute top-0 right-0 w-20 h-20 ${s.glow} blur-2xl rounded-full -mr-10 -mt-10 opacity-50`} />

                        <div className="relative p-5 flex flex-col items-start gap-1">
                            <div className={`text-2xl mb-1 ${s.color}`}>{s.icon}</div>
                            <div className="text-2xl font-bold text-white leading-none tracking-tight">{s.value}</div>
                            <div className="text-[10px] text-white/30 font-bold uppercase tracking-[0.1em] mt-1">{s.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs Switcher */}
            <div className="px-6 mb-8">
                <div className="relative flex bg-white/[0.03] backdrop-blur-xl rounded-[24px] p-1.5 border border-white/5 shadow-2xl">
                    <motion.div
                        className="absolute inset-y-1.5 bg-emerald-500 rounded-[20px] shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        initial={false}
                        animate={{
                            left: activeTab === 'medals' ? '6px' : '50%',
                            width: 'calc(50% - 6px)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <button
                        onClick={() => setActiveTab('medals')}
                        className={`flex-1 py-3.5 rounded-[20px] text-xs font-bold uppercase tracking-wider transition-all relative z-10 ${activeTab === 'medals' ? 'text-slate-950' : 'text-white/40'}`}
                    >
                        Коллекция
                    </button>
                    <button
                        onClick={() => setActiveTab('achievements')}
                        className={`flex-1 py-3.5 rounded-[20px] text-xs font-bold uppercase tracking-wider transition-all relative z-10 ${activeTab === 'achievements' ? 'text-slate-950' : 'text-white/40'}`}
                    >
                        Достижения
                    </button>
                </div>
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'medals' ? (
                    /* Medals */
                    <div className="px-6 mb-10">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="font-bold text-lg flex items-center gap-2 font-montserrat tracking-tight">
                                🥇 Твои медали
                            </h2>
                            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-lg font-bold text-white/40 uppercase tracking-widest">
                                {medalsCount} получено
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 px-1">
                            {/* Orders / Real Medals */}
                            {orders.map((order, i) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -5 }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[32px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <div className="relative h-full bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 rounded-[32px] p-5 text-center overflow-hidden flex flex-col items-center">
                                        <div className="absolute top-0 right-0 p-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                        </div>
                                        <div className="text-5xl mb-3 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">🎖️</div>
                                        <div className="text-[11px] font-bold text-white leading-tight mb-1 line-clamp-2">{order.marathonTitle}</div>
                                        <div className="text-[9px] text-amber-500/60 font-bold uppercase tracking-widest">{order.status === 'pending' ? 'В обработке' : 'В пути'}</div>

                                        <div className="mt-auto pt-4 w-full">
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-0.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: order.status === 'pending' ? '30%' : '70%' }}
                                                    className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {MY_MEDALS.map((medal, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -5 }}
                                    className="relative opacity-80 hover:opacity-100 transition-opacity"
                                >
                                    <div className="h-full bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-[32px] p-5 text-center flex flex-col items-center">
                                        <div className="text-4xl mb-3 grayscale group-hover:grayscale-0 transition-all">{medal.emoji}</div>
                                        <div className="text-[10px] font-bold text-slate-300 leading-tight line-clamp-2">{medal.title}</div>
                                        <div className="text-[8px] text-slate-500 font-bold mt-auto pt-2 uppercase tracking-widest">{medal.date}</div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Locked slot */}
                            <div className="bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[32px] p-5 text-center flex flex-col items-center justify-center opacity-30 aspect-square">
                                <div className="text-3xl mb-2">🔒</div>
                                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Следующая</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Achievements */
                    <div className="px-6 mb-10">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="font-bold text-lg flex items-center gap-2 font-montserrat tracking-tight">
                                🎯 Достижения
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {ACHIEVEMENTS.map((a, i) => {
                                const isUnlocked = useShuRunStore.getState().unlockedAchievementIds.includes(a.id);
                                return (
                                    <motion.div
                                        key={a.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`relative group overflow-hidden ${isUnlocked ? '' : 'grayscale opacity-40'}`}
                                    >
                                        <div className={`absolute inset-0 ${isUnlocked ? 'bg-emerald-500/5' : 'bg-white/[0.02]'} backdrop-blur-md border ${isUnlocked ? 'border-emerald-500/20' : 'border-white/5'} rounded-2xl transition-colors`} />

                                        <div className="relative p-4 flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isUnlocked ? 'bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5'}`}>
                                                {a.emoji}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-xs text-white mb-0.5 tracking-tight uppercase">{a.title}</div>
                                                <div className="text-[10px] text-white/40 font-medium leading-tight">{a.desc}</div>
                                            </div>
                                            {isUnlocked && (
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>

            <BottomNav />
        </div>
    );
}
