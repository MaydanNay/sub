import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const VotingView = () => {
    const navigate = useNavigate();
    const [votedId, setVotedId] = useState(null);

    const [polls, setPolls] = useState([
        {
            id: 1,
            question: 'Какую игру добавить в каталог следующей?',
            options: [
                { id: 'a', text: '🏦 Симулятор банка', votes: 450 },
                { id: 'b', text: '🏰 Средневековая стратегия', votes: 320 },
                { id: 'c', text: '🪐 Космический трейдер', votes: 580 },
                { id: 'd', text: '🏎️ Гонки на выживание', votes: 210 },
            ],
            totalVotes: 1560,
            expiresIn: '2 дня'
        }
    ]);

    const handleVote = (optionId) => {
        if (votedId) return;

        setVotedId(optionId);
        setPolls(prevPolls => prevPolls.map(poll => ({
            ...poll,
            options: poll.options.map(opt =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            ),
            totalVotes: poll.totalVotes + 1
        })));
    };

    const getPercentage = (votes, total) => {
        return Math.round((votes / total) * 100);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden">
            {/* Standardized Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/game/vote')}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-bold"
                    >
                        <span>←</span> Выйти
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🗳️</span>
                        <h1 className="text-lg font-black tracking-tighter">VOTING</h1>
                    </div>
                    <div className="w-20"></div> {/* Spacer for balance */}
                </div>
            </div>

            <div className="pt-24 px-6 max-w-lg mx-auto pb-12">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-black leading-tight mb-4">
                        Твой голос <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">имеет значение!</span>
                    </h2>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Участвуй в развитии платформы и получай бонусы за каждый оставленный голос.</p>
                </div>

                {polls.map(poll => (
                    <motion.div
                        key={poll.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-[40px] p-8 border border-white/10 backdrop-blur-md shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Активный опрос</span>
                            <span className="text-slate-500 text-[10px] font-bold">⏳ {poll.expiresIn}</span>
                        </div>

                        <h3 className="text-xl font-bold mb-10 leading-snug">{poll.question}</h3>

                        <div className="space-y-4">
                            {poll.options.map(option => {
                                const percent = getPercentage(option.votes, poll.totalVotes);
                                const isSelected = votedId === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleVote(option.id)}
                                        disabled={!!votedId}
                                        className={`w-full group relative overflow-hidden rounded-3xl p-6 border-2 transition-all text-left ${isSelected
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : votedId
                                                ? 'border-white/5 bg-white/5 grayscale opacity-50'
                                                : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'
                                            }`}
                                    >
                                        {/* Progress Bar (visible after voting) */}
                                        <AnimatePresence>
                                            {votedId && (
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    className={`absolute inset-0 z-0 transition-all ${isSelected ? 'bg-indigo-500/10' : 'bg-white/5'
                                                        }`}
                                                />
                                            )}
                                        </AnimatePresence>

                                        <div className="relative z-10 flex justify-between items-center">
                                            <span className={`font-bold transition-colors ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`}>
                                                {option.text}
                                            </span>
                                            {votedId && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="font-black text-white"
                                                >
                                                    {percent}%
                                                </motion.span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {votedId && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mt-10 text-xs font-bold text-indigo-400 flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">✨</span> Твой голос учтен! Спасибо.
                            </motion.p>
                        )}
                    </motion.div>
                ))}

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h4 className="text-lg font-black mb-3 italic">А вы знали?</h4>
                    <p className="text-indigo-100 text-xs leading-relaxed opacity-80 mb-6">
                        Пользователи с VIP-статусом имеют в 2 раза больше веса при голосовании. Повышайте свой статус, приглашая друзей!
                    </p>
                    <button
                        onClick={() => navigate('/game/referral')}
                        className="inline-block text-xs font-black uppercase tracking-widest border-b-2 border-white pb-1 hover:opacity-80 transition-opacity">
                        Узнать больше →
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default VotingView;
