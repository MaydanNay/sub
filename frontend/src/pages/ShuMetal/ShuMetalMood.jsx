import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';

const ShuMetalMood = () => {
    const [submitted, setSubmitted] = useState(false);
    const [selectedMood, setSelectedMood] = useState(null);

    const moods = [
        { id: 'bad', emoji: '😡', label: 'Плохо', color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { id: 'ok', emoji: '😐', label: 'Нормально', color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
        { id: 'good', emoji: '🔥', label: 'Отлично', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    ];

    const handleSubmit = (mood) => {
        setSelectedMood(mood);
        setSubmitted(true);
        // In a real app, this would send data to the backend
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans pb-28 flex flex-col justify-center">
            {/* HUD Scanline */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0"
                style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />

            <div className="relative z-10 px-8 text-center mt-[-40px]">
                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.div
                            key="poll"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                        >
                            <div className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4">
                                MOOD_MONITOR : SCAN_READY
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-4 leading-none">КАК ПРОШЛА СМЕНА?</h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-[0.15em] text-[10px] mb-12 max-w-[280px] mx-auto leading-relaxed">
                                Ваш ответ поможет улучшить завод. Информация передается анонимно.
                            </p>

                            <div className="flex justify-between items-center max-w-sm mx-auto">
                                {moods.map((mood) => (
                                    <button
                                        key={mood.id}
                                        onClick={() => handleSubmit(mood)}
                                        className="group flex flex-col items-center gap-4 outline-none relative"
                                    >
                                        <div className={`w-20 h-20 rounded-3xl ${mood.bg} border-2 border-transparent group-hover:border-orange-500/40 group-active:scale-90 transition-all flex items-center justify-center text-4xl grayscale group-hover:grayscale-0 relative z-10`}>
                                            {mood.emoji}
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-3xl blur-sm transition-opacity" />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${mood.color}`}>
                                            {mood.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-16 flex flex-col items-center gap-2">
                                <div className="text-orange-500/60 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 border border-orange-500/20 rounded-full bg-orange-500/5">
                                    Награда: +10 AluCoins
                                </div>
                                <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-tight italic opacity-60 mt-4">
                                    При снижении индекса 3 дня подряд анонимный отчет уходит HR-директору
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="thanks"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="relative inline-block mb-8">
                                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 animate-pulse" />
                                <div className="relative w-24 h-24 rounded-full border-4 border-orange-500 flex items-center justify-center text-black bg-orange-500 font-black text-4xl mx-auto shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                                    +10
                                </div>
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-4 leading-none">СПАСИБО ЗА ФИДБЕК!</h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] max-w-xs mx-auto leading-relaxed px-4">
                                Мы зафиксировали ваше настроение ({selectedMood?.label}). Коины зачислены на ваш баланс. Вместе мы делаем цех лучше.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-12 text-orange-500 border border-orange-500/30 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500/5 hover:bg-orange-500/10 transition-all"
                                onClick={() => setSubmitted(false)}
                            >
                                Вернуться в HUD
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <BottomNav />
        </div>
    );
};

export default ShuMetalMood;
