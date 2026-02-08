import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PrizeDrawer from '../components/PrizeDrawer';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { IconStar, IconTrophy, IconMap, IconHeart } from '../components/GameIcons';

const QuestGame = () => {
    const navigate = useNavigate();

    const FEATURES = [
        { title: 'Испытания', desc: 'Проверь свою ловкость и скорость', icon: IconStar, color: 'text-rose-500' },
        { title: 'Логика', desc: 'Разгадывай загадки и секретные коды', icon: IconTrophy, color: 'text-indigo-500' },
        { title: 'Выдержка', desc: 'Учись терпению в поисках дзена', icon: IconHeart, color: 'text-amber-500' },
        { title: 'Награды', desc: 'Получай бонусы за каждый шаг', icon: IconMap, color: 'text-emerald-500' },
    ];

    const PRIZES = [
        { id: 1, title: 'Путь Новичка', description: 'Заверши 1-й этап квеста', type: 'win' },
        { id: 2, title: 'Мудрец', description: 'Разгадай загадку без ошибок', type: 'win' },
        { id: 3, title: 'Легенда SHU', description: 'Пройди все испытания недели', type: 'win' },
    ];

    return (
        <div className="bg-indigo-50 min-h-screen flex flex-col items-center relative overflow-hidden font-sans">
            {/* Decorative background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-10 right-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
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
                {/* Game Intro Card - Light Premium Style */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 w-full flex flex-col items-center justify-center p-8 md:p-12 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl transition-all duration-300 border border-white/50"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-indigo-900 mb-6 font-sans tracking-tight text-center">
                        Мистический Квест
                    </h2>

                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="text-[120px] mb-12 drop-shadow-2xl"
                    >
                        📍
                    </motion.div>

                    <p className="text-slate-600 text-center mb-12 max-w-xs text-sm font-medium leading-relaxed">
                        Пройди серию испытаний на ловкость, мудрость и терпение. Докажи, что ты достоин главного приза недели!
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/game/quest/play')}
                        className="w-full py-5 rounded-2xl font-black text-white text-xl shadow-xl
                            transition-all tracking-wide uppercase flex items-center justify-center gap-3
                            bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-indigo-200"
                    >
                        🎮 ИГРАТЬ
                    </motion.button>
                </motion.div>

                {/* Features List - Standard Layout */}
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
                    colorClass="text-indigo-600"
                    itemBgClass="bg-white"
                    className="w-full"
                />
            </div>

            <ThemeCustomizer />
        </div>
    );
};

export default QuestGame;
