import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { LEADERBOARD_ALL_TIME, LEADERBOARD_MARATHON, MY_STATS } from './gameData';
import useShuRunStore, { formatTime } from './useShuRunStore';

const TABS = [
    { key: 'marathon', label: 'Этот марафон' },
    { key: 'all', label: 'Все время' },
];

const medalEmoji = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function ShuRunLeaderboard() {
    const navigate = useNavigate();
    const user = useShuRunStore(s => s.user);
    const finishedRuns = useShuRunStore(s => s.finishedRuns);

    const [tab, setTab] = useState('marathon');

    const totalRealKm = finishedRuns.reduce((acc, r) => acc + r.km, 0);
    const displayTotalKm = (totalRealKm + MY_STATS.totalKm).toFixed(1);
    const marathonsCount = finishedRuns.length + MY_STATS.marathonsFinished;

    const rawData = tab === 'all' ? LEADERBOARD_ALL_TIME : LEADERBOARD_MARATHON;

    // Inject real user stats into the leaderboard
    const data = rawData.map(runner => {
        if (runner.isMe) {
            const marathonRun = finishedRuns
                .filter(r => r.marathonId === 'almaty-5k')
                .sort((a, b) => a.seconds - b.seconds)[0];

            return {
                ...runner,
                name: user.nickname || 'Ты',
                totalKm: displayTotalKm,
                marathons: marathonsCount,
                time: marathonRun ? formatTime(marathonRun.seconds) : '—',
                pace: marathonRun ? marathonRun.pace : '—'
            };
        }
        return runner;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white font-montserrat pb-28">
            {/* Header */}
            <div className="relative overflow-hidden pt-10 pb-16 text-center">
                {/* mesh gradient background */}
                <div className="absolute inset-0 bg-slate-950">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-500/10 blur-[80px] rounded-full" />
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-teal-600/10 blur-[90px] rounded-full animate-pulse" />
                </div>

                {/* pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                <div className="relative z-10 flex flex-col items-center px-6">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 opacity-80">
                        ShuRun • Рейтинг
                    </div>
                    <h1 className="text-3xl font-bold font-montserrat tracking-tight mb-1">
                        🏆 Таблица лидеров
                    </h1>
                    <p className="text-blue-400/60 text-xs font-bold uppercase tracking-widest mb-8">Алматы Весенний 5K</p>

                    {/* Top 3 podium */}
                    <div className="flex items-end justify-center gap-3 mt-2">
                        {[data[1], data[0], data[2]].map((runner, pIdx) => {
                            const actualRank = pIdx === 0 ? 2 : pIdx === 1 ? 1 : 3;
                            const heights = ['h-20', 'h-28', 'h-16'];
                            return (
                                <motion.div
                                    key={runner.rank}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: pIdx * 0.15 }}
                                    className={`flex flex-col items-center ${pIdx === 1 ? 'scale-110' : ''}`}
                                >
                                    <div className="text-2xl mb-1">{runner.isMe ? '👤' : runner.emoji}</div>
                                    <div className="text-xs font-bold text-center leading-tight mb-1 max-w-[60px] truncate text-white/70">
                                        {runner.name.split(' ')[0]}
                                    </div>
                                    <div className={`${heights[pIdx]} w-16 rounded-t-2xl flex items-end justify-center pb-2 border-x border-t border-white/10
                                        ${actualRank === 1 ? 'bg-gradient-to-t from-amber-600/40 to-amber-400/40' :
                                            actualRank === 2 ? 'bg-gradient-to-t from-slate-600/40 to-slate-400/40' :
                                                'bg-gradient-to-t from-orange-800/40 to-orange-600/40'}`}>
                                        <span className="text-xl font-bold">{medalEmoji[actualRank]}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tab switcher */}
            <div className="px-4 -mt-5 relative z-10 mb-4">
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-1.5 flex gap-1">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === t.key
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard list */}
            <div className="px-4 space-y-2">
                {data.map((runner, i) => (
                    <motion.div
                        key={`${runner.rank}-${tab}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${runner.isMe
                            ? 'bg-blue-600/20 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                            : 'bg-slate-900 border-white/5'
                            }`}
                    >
                        {/* Rank */}
                        <div className="w-8 text-center shrink-0">
                            {runner.rank <= 3
                                ? <span className="text-xl">{medalEmoji[runner.rank]}</span>
                                : <span className="text-slate-500 font-bold text-sm">#{runner.rank}</span>
                            }
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xl shrink-0">
                            {runner.isMe ? '👤' : runner.emoji}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className={`font-bold text-sm truncate ${runner.isMe ? 'text-blue-300' : 'text-white'}`}>
                                {runner.name}
                                {runner.isMe && <span className="text-xs ml-1.5 opacity-70">(Ты)</span>}
                            </div>
                            <div className="text-slate-500 text-[10px] font-bold">📍 {runner.city}</div>
                        </div>

                        {/* Stats */}
                        <div className="text-right shrink-0">
                            {tab === 'marathon' ? (
                                <>
                                    <div className="font-bold text-white text-sm">{runner.time}</div>
                                    <div className="text-[9px] text-slate-500 font-bold">{runner.pace}</div>
                                </>
                            ) : (
                                <>
                                    <div className="font-bold text-white text-sm">{runner.totalKm} км</div>
                                    <div className="text-[9px] text-slate-500 font-bold">{runner.marathons} марафонов</div>
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <BottomNav />
        </div>
    );
}
