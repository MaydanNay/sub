import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import PrizeDrawer from '../components/PrizeDrawer';
import ThemeCustomizer from '../components/ThemeCustomizer';
import {
    IconQuestion, IconBrain, IconTarget, IconStar, IconTrophy, IconHeart, IconMap
} from '../components/GameIcons';

const QuizGame = () => {
    const navigate = useNavigate();

    const FEATURES = [
        { title: 'Эрудиция', desc: 'Проверь свои знания в разных областях', icon: IconStar, color: 'text-emerald-500' },
        { title: 'Скорость', desc: 'Отвечай быстрее, чтобы получить бонус', icon: IconTrophy, color: 'text-amber-500' },
        { title: 'Серии', desc: 'Давай верные ответы подряд для комбо', icon: IconHeart, color: 'text-rose-500' },
        { title: 'Призы', desc: 'Выигрывай скидки за высокий балл', icon: IconMap, color: 'text-indigo-500' },
    ];

    const PRIZES = [
        { id: 1, title: 'Знаток', description: 'Набери 4 очка в викторине', type: 'win' },
        { id: 2, title: 'Магистр', description: 'Набери 6 очков в викторине', type: 'win' },
        { id: 3, title: 'Гений', description: 'Набери максимум очков', type: 'win' },
    ];

    return (
        <div className="bg-emerald-50 min-h-screen flex flex-col items-center relative overflow-hidden font-sans">
            {/* Decorative background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-10 right-10 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header - Animated SHU Logo */}
            <div className="w-full pt-8 pb-4 flex flex-col items-center z-20 relative">
                <motion.a
                    href="/"
                    className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 font-sans tracking-tighter cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    SHU
                </motion.a>
                <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1">
                    ← назад в каталог
                </a>
            </div>

            <div className="max-w-4xl w-full z-10 flex flex-col md:flex-row gap-8 items-center justify-center p-4">
                {/* Game Intro Card */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 w-full flex flex-col items-center justify-center p-8 md:p-12 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl transition-all duration-300 border border-white/50"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-emerald-900 mb-6 font-sans tracking-tight text-center">
                        Умная Викторина
                    </h2>

                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="text-[120px] mb-12 drop-shadow-2xl"
                    >
                        🧠
                    </motion.div>

                    <p className="text-slate-600 text-center mb-12 max-w-xs text-sm font-medium leading-relaxed">
                        Проверь свою эрудицию! Отвечай на вопросы из разных категорий и выигрывай ценные призы.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/game/quiz/play')}
                        className="w-full py-5 rounded-2xl font-black text-white text-xl shadow-xl
                            transition-all tracking-wide uppercase flex items-center justify-center gap-3
                            bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-200"
                    >
                        🎮 ИГРАТЬ
                    </motion.button>
                </motion.div>

                {/* Features List */}
                <div className="flex-1 w-full max-w-md grid grid-cols-1 gap-4">
                    {FEATURES.map((feat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/60 flex items-center gap-6 group hover:bg-white/70 transition-all shadow-sm"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-md ${feat.color}`}>
                                <feat.icon />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{feat.title}</h3>
                                <p className="text-xs text-slate-500 font-medium">{feat.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Prize Drawer Area */}
            <div className="w-full max-w-5xl mx-auto px-8 mb-24 z-10">
                <PrizeDrawer
                    prizes={PRIZES}
                    colorClass="text-emerald-600"
                    itemBgClass="bg-white"
                    className="w-full"
                />
            </div>

            <ThemeCustomizer />
        </div>
    );
};

export default QuizGame;
