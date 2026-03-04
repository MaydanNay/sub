import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { LEADERBOARD_ALL_TIME, LEADERBOARD_MARATHON } from './gameData';

const TABS = [
    { key: 'marathon', label: 'Этот марафон' },
    { key: 'all', label: 'Все время' },
];

const medalEmoji = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function ShuRunLeaderboard() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('marathon');
    const data = tab === 'all' ? LEADERBOARD_ALL_TIME : LEADERBOARD_MARATHON;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-montserrat pb-28">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-10 pb-12 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '30px 30px' }}
                />
                <div className="relative z-10 flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate('/game/shurun/home')}
                        className="bg-black/20 p-2 rounded-xl"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black leading-tight">🏆 Рейтинг</h1>
                        <p className="text-blue-200 text-xs font-bold">Алматы Весенний 5K</p>
                    </div>
                </div>

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
                                <div className="text-xs font-black text-center leading-tight mb-1 max-w-[60px] truncate">
                                    {runner.name.split(' ')[0]}
                                </div>
                                <div className={`${heights[pIdx]} w-16 rounded-t-2xl flex items-end justify-center pb-2
                                    ${actualRank === 1 ? 'bg-gradient-to-t from-amber-600 to-amber-400' :
                                        actualRank === 2 ? 'bg-gradient-to-t from-slate-600 to-slate-400' :
                                            'bg-gradient-to-t from-orange-800 to-orange-600'}`}>
                                    <span className="text-xl font-black">{medalEmoji[actualRank]}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Tab switcher */}
            <div className="px-4 -mt-5 relative z-10 mb-4">
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-1.5 flex gap-1">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${tab === t.key
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
                                : <span className="text-slate-500 font-black text-sm">#{runner.rank}</span>
                            }
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xl shrink-0">
                            {runner.isMe ? '👤' : runner.emoji}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className={`font-black text-sm truncate ${runner.isMe ? 'text-blue-300' : 'text-white'}`}>
                                {runner.name}
                                {runner.isMe && <span className="text-xs ml-1.5 opacity-70">(Ты)</span>}
                            </div>
                            <div className="text-slate-500 text-[10px] font-bold">📍 {runner.city}</div>
                        </div>

                        {/* Stats */}
                        <div className="text-right shrink-0">
                            {tab === 'marathon' ? (
                                <>
                                    <div className="font-black text-white text-sm">{runner.time}</div>
                                    <div className="text-[9px] text-slate-500 font-bold">{runner.pace}</div>
                                </>
                            ) : (
                                <>
                                    <div className="font-black text-white text-sm">{runner.totalKm} км</div>
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
