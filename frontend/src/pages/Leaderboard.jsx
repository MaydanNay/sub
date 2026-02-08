import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ThemeCustomizer from '../components/ThemeCustomizer';

const Leaderboard = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col items-center relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            {/* Header - Animated SHU Logo */}
            <div className="w-full pt-8 pb-4 flex flex-col items-center z-20 relative text-center">
                <motion.a
                    href="/"
                    className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 font-sans tracking-tighter cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                    SHU
                </motion.a>
                <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1 font-bold">
                    ← назад в каталог
                </a>
            </div>

            <main className="max-w-4xl w-full z-10 flex flex-col md:flex-row gap-8 items-center justify-center p-4 mt-8">
                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 w-full flex flex-col items-center justify-center p-8 md:p-12 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-3xl flex items-center justify-center text-5xl mb-8 shadow-xl shadow-amber-200">
                        🏆
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black text-indigo-900 mb-6 tracking-tight text-center">
                        Топ игроков
                    </h2>

                    <p className="text-gray-500 text-center text-lg leading-relaxed mb-10 max-w-sm">
                        Станьте легендой нашего сообщества! Соревнуйтесь с другими игроками, накапливайте опыт и занимайте первые места в рейтинге.
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full mb-10">
                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                            <p className="text-2xl font-black text-indigo-600 mb-1">🥇 1-е</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Место</p>
                        </div>
                        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50">
                            <p className="text-2xl font-black text-purple-600 mb-1">XP</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Награды</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/game/leaderboard/view')}
                        className="w-full py-5 rounded-2xl font-black text-white text-xl shadow-xl transition-all tracking-wide uppercase flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-indigo-200">
                        🏆 СМОТРЕТЬ РЕЙТИНГ
                    </motion.button>
                </motion.div>

                {/* Decoration Image/Element */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 w-full hidden md:flex flex-col items-center justify-center p-8 bg-indigo-600 rounded-[2.5rem] shadow-2xl relative overflow-hidden aspect-square"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700"></div>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"></div>
                    <motion.div
                        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 text-[10rem] drop-shadow-2xl"
                    >
                        👑
                    </motion.div>
                </motion.div>
            </main>

        </div>
    );
};

export default Leaderboard;
