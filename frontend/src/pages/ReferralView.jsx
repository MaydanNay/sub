import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ReferralView = () => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const referralCode = "COFFEE-LOVER-2026";

    const MILESTONES = [
        { friends: 1, prize: '500 XP', reached: true },
        { friends: 3, prize: 'Купон 20%', reached: true },
        { friends: 5, prize: 'Статус VIP', reached: false },
        { friends: 10, prize: 'Секретный приз', reached: false },
    ];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden">
            {/* Standardized Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/game/referral')}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-bold"
                    >
                        <span>←</span> Выйти
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🤝</span>
                        <h1 className="text-lg font-black tracking-tighter">REFERRALS</h1>
                    </div>
                    <div className="w-20"></div> {/* Spacer for balance */}
                </div>
            </div>

            <div className="pt-24 px-6 max-w-lg mx-auto relative z-10 pb-12 text-center">
                {/* Hero Section */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/5 border border-white/10 rounded-[32px] p-8 mb-10 backdrop-blur-md"
                >
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-xl shadow-blue-500/20">
                        🤝
                    </div>
                    <h2 className="text-2xl font-black mb-4 leading-tight">
                        Приглашай друзей — <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">получай награды!</span>
                    </h2>

                    {/* Referral Code Box */}
                    <div className="mt-8 text-left">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Твой уникальный код</p>
                        <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                            <div className="flex-1 font-mono text-xl font-bold text-center py-2 text-blue-400 tracking-tighter">
                                {referralCode}
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={copyToClipboard}
                                className={`px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                                    }`}
                            >
                                {copied ? '✓' : '📋'}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Milestones */}
                <div className="text-left mb-10">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Прогресс наград</h3>
                    <div className="relative pl-8 border-l-2 border-slate-800 space-y-8">
                        {MILESTONES.map((stone, i) => (
                            <div key={i} className="relative">
                                {/* Dot */}
                                <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-[#0F172A] z-10 transition-colors ${stone.reached ? 'bg-blue-500' : 'bg-slate-700'
                                    }`} />

                                <div className={`p-5 rounded-3xl border transition-all ${stone.reached
                                    ? 'bg-blue-500/10 border-blue-500/20'
                                    : 'bg-white/5 border-white/5 grayscale'
                                    }`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                {stone.friends} {stone.friends === 1 ? 'ДРУГ' : stone.friends < 5 ? 'ДРУГА' : 'ДРУЗЕЙ'}
                                            </p>
                                            <p className={`text-lg font-black ${stone.reached ? 'text-blue-400' : 'text-slate-500'}`}>
                                                {stone.prize}
                                            </p>
                                        </div>
                                        <div className="text-2xl">
                                            {stone.reached ? '🏆' : '🔒'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Share Button */}
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-5 rounded-3xl font-black text-xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:shadow-blue-500/40 transition-shadow">
                    ПОДЕЛИТЬСЯ 🚀
                </button>

                <p className="mt-8 text-center text-xs text-slate-500 max-w-[280px] mx-auto">
                    Награда начисляется после того, как ваш друг совершит свою первую покупку в системе.
                </p>
            </div>
        </div>
    );
};

export default ReferralView;
