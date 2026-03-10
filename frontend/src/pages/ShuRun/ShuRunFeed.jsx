import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, MessageCircle, Share2, Map as MapIcon, Calendar, Zap, Trophy, Heart, Star } from 'lucide-react';
import useShuRunStore from './useShuRunStore';
import BottomNav from './BottomNav';

const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function ShuRunFeed() {
    const feed = useShuRunStore(s => s.feed);
    const reactToRun = useShuRunStore(s => s.reactToRun);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-montserrat pb-28">
            {/* Header */}
            <div className="relative overflow-hidden pt-10 pb-16 text-center">
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

                <div className="relative z-10 flex flex-col items-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 opacity-80">
                        ShuRun • Лента
                    </div>
                    <h1 className="text-3xl font-bold font-montserrat tracking-tight mb-2 flex items-center gap-3">
                        <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400" />
                        Лента активности
                    </h1>
                </div>
            </div>

            {/* Feed List */}
            <div className="px-4 py-6 space-y-6">
                <AnimatePresence mode="popLayout">
                    {feed.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                        >
                            {/* User Info */}
                            <div className="p-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-inner border border-white/20">
                                    {item.type === 'art' ? '🎨' : '🏃'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-white font-montserrat">{item.nickname}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" />
                                        {item.date}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                        {item.type === 'art' ? 'GPS ART' : 'МАРАФОН'}
                                    </span>
                                </div>
                            </div>

                            {/* Run Stats Highlight */}
                            <div className="px-5 pb-4">
                                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-end justify-between mb-3">
                                        <div>
                                            <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Дистанция</div>
                                            <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                                                {item.km} <span className="text-xs text-slate-500 font-bold uppercase">км</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Время</div>
                                            <div className="text-lg font-bold text-slate-300">
                                                {formatTime(item.seconds)}
                                            </div>
                                        </div>
                                    </div>

                                    {item.type === 'art' && item.artAccuracy && (
                                        <div className="flex items-center gap-2 mt-2 bg-emerald-500/10 py-1.5 px-3 rounded-lg border border-emerald-500/20">
                                            <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                                            <span className="text-[10px] font-bold text-emerald-300">Точность: {item.artAccuracy}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Activity Message */}
                            <div className="px-6 pb-5">
                                <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
                                    «Пробежал марафон <span className="text-white font-bold">{item.title}</span>. Ощущения просто космос! ⚡️»
                                </p>
                            </div>

                            {/* Map / Visualization Placeholder */}
                            <div className="h-40 bg-slate-800/50 relative flex items-center justify-center overflow-hidden border-y border-white/5">
                                <MapIcon className="w-12 h-12 text-slate-700 opacity-20" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                                {/* Sparkles logic could go here */}
                                {item.type === 'art' && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                        {item.title === 'Сердце' ? <Heart className="w-16 h-16 text-emerald-500" /> : <Trophy className="w-16 h-16 text-emerald-500" />}
                                    </div>
                                )}
                            </div>

                            {/* Actions bar */}
                            <div className="px-5 py-4 flex items-center justify-between bg-slate-900/40">
                                <div className="flex items-center gap-4">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => reactToRun(item.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${item.hasReacted
                                            ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                                            : 'bg-slate-800 text-slate-400 hover:text-rose-400'
                                            }`}
                                    >
                                        <Flame className={`w-4 h-4 ${item.hasReacted ? 'fill-white' : ''}`} />
                                        <span className="text-xs font-bold">{item.reactions}</span>
                                    </motion.button>

                                    <button className="flex items-center gap-2 p-2 text-slate-500 hover:text-slate-300 transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-xs font-bold">0</span>
                                    </button>
                                </div>

                                <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <BottomNav />
        </div>
    );
}
