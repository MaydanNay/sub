import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PrizeDrawer from '../components/PrizeDrawer';
import ThemeCustomizer from '../components/ThemeCustomizer';
import {
    IconPuzzle, IconStar, IconTrophy, IconMap, IconGift, IconClover
} from '../components/GameIcons';

const PuzzleCollector = () => {
    const navigate = useNavigate();

    const FEATURES = [
        { title: 'Коллекция', desc: 'Собери 9 уникальных фрагментов', icon: IconPuzzle, color: 'text-indigo-500' },
        { title: 'Главный приз', desc: 'Открой секретную награду в конце', icon: IconGift, color: 'text-pink-500' },
        { title: 'Ежедневный бонус', desc: 'Увеличивай шанс на редкую деталь', icon: IconClover, color: 'text-emerald-500' },
        { title: 'Прогресс', desc: 'Твои достижения сохраняются', icon: IconStar, color: 'text-amber-500' },
    ];

    const PRIZES = [
        { id: 1, title: 'Купон на 1000₽', description: 'За сборку всего пазла', type: 'win' },
        { id: 2, title: 'Редкая деталь', description: 'С шансом 5% при покупке', type: 'info' },
    ];

    return (
        <div className="bg-indigo-50 min-h-[calc(100vh-64px)] md:min-h-screen md:py-20 md:px-4 flex flex-col items-center justify-center relative overflow-hidden h-full md:h-auto pb-[40vh] md:pb-0">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-10 left-1/2 w-48 h-48 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header - Animated SHU Logo */}
            <div className="w-full pt-8 pb-4 flex flex-col items-center z-20 relative">
                <motion.a
                    href="/"
                    className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 font-sans tracking-tighter cursor-pointer"
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
                <div className="flex-1 w-full flex flex-col items-center justify-center p-8 md:p-12 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl transition-all duration-300 border border-white/50">
                    <h2 className="text-3xl md:text-4xl font-black text-indigo-900 mb-6 font-sans tracking-tight text-center">
                        Пазл Коллектор
                    </h2>

                    <motion.div
                        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-9xl mb-8 drop-shadow-2xl"
                    >
                        🧩
                    </motion.div>

                    <p className="text-indigo-800/70 text-center mb-10 max-w-sm leading-relaxed">
                        Собери все фрагменты уникального пазла и разблокируй эксклюзивные награды и купоны!
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/game/puzzle/play')}
                        className="w-full py-5 rounded-2xl font-black text-white text-xl shadow-xl
                            transition-all tracking-wide uppercase flex items-center justify-center gap-3
                            bg-gradient-to-r from-indigo-600 to-purple-700 hover:shadow-indigo-200"
                    >
                        🎮 СОБИРАТЬ
                    </motion.button>
                </div>

                {/* Features List */}
                <div className="flex-1 w-full grid grid-cols-1 gap-4">
                    {FEATURES.map((feat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/60 flex items-center gap-4 group hover:bg-white/60 transition-all"
                        >
                            <div className={`w - 12 h - 12 rounded - xl bg - white flex items - center justify - center text - 2xl shadow - sm ${feat.color} `}>
                                <feat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-indigo-900 text-sm">{feat.title}</h3>
                                <p className="text-xs text-indigo-800/60">{feat.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Prizedrawer and Customizer */}
            <div className="w-full max-w-4xl px-4 mt-8 z-10">
                <PrizeDrawer
                    prizes={PRIZES}
                    colorClass="text-indigo-600"
                    itemBgClass="bg-indigo-50"
                    className="w-full"
                />
            </div>

            <ThemeCustomizer />
        </div>
    );
};

export default PuzzleCollector;
