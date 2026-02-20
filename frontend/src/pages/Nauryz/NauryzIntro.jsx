import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowRight, IconChefHat } from '../../components/GameIcons';

const NauryzIntro = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex flex-col relative overflow-hidden font-sans">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-400/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl shadow-xl flex items-center justify-center mb-8 rotate-3"
                >
                    <IconChefHat className="w-16 h-16 text-white" />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-black text-amber-900 mb-4"
                >
                    ShuBakery
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-amber-800/80 mb-8 max-w-sm leading-relaxed"
                >
                    Станьте управляющим этно-пекарни! Соберите коллекцию из <b>7 главных блюд</b> и выиграйте <b>«Ханский гостинец»</b>.
                </motion.p>

                {/* Features List */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 gap-4 w-full max-w-xs mb-10 text-left"
                >
                    {[
                        { icon: "🥣", text: "Готовьте: от Муки до Наурыз-коже" },
                        { icon: "⚡", text: "Сканируйте чеки для энергии" },
                        { icon: "🎁", text: "Главный приз: осталось мало!" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-amber-100">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-semibold text-amber-900">{item.text}</span>
                        </div>
                    ))}
                </motion.div>

                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/game/nauryz/play')}
                    className="w-full max-w-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xl py-4 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 group"
                >
                    Начать игру
                    <IconArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </div>
        </div>
    );
};

export default NauryzIntro;
