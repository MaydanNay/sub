import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import bgImage from './images/bg.png';
import { IconArrowLeft } from '../../components/GameIcons';

const ShuDomIntro = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen bg-white text-neutral-900 font-sans overflow-hidden flex flex-col">
            {/* Background with overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />

            {/* Animated Grid lines */}
            {/* Header with Back button */}
            <div className="relative z-20 px-6 pt-12 flex justify-start">
                <button
                    onClick={() => navigate('/')}
                    className="w-10 h-10 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-center text-white"
                >
                    <IconArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pt-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8"
                >
                    <div className="relative w-40 h-40">
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-dashed border-red-500/20 rounded-full"
                        />
                        <div className="absolute inset-4 bg-gradient-to-br from-red-600 to-red-400 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                            <span className="text-6xl text-white">🏠</span>
                        </div>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-black italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-800 to-red-500 uppercase"
                >
                    SHUDOM
                </motion.h1>
                <div className="bg-red-600 text-white px-4 py-1 font-black text-xs rounded-full inline-block mb-10 tracking-[0.2em] uppercase">
                    Magnum Brand
                </div>

                <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                    {[
                        { title: 'Match-3 Геймплей', desc: 'Сдвигай электронику, создавай комбо и зарабатывай очки' },
                        { title: 'Умный Дом', desc: 'Пройди 250 уровней и обустрой 10 футуристичных комнат' },
                        { title: 'Реальные призы', desc: 'Выигрывай промокоды на покупку техники в Technodom' },
                        { title: 'Золотой Билет', desc: 'Собери коллекции комнат и получи шанс выиграть долю от 200 млн ₸' }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-2xl p-4 text-left flex items-start gap-4 shadow-sm"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0 font-black">
                                {i + 1}
                            </div>
                            <div>
                                <h3 className="font-bold text-red-700 uppercase text-xs mb-1">{item.title}</h3>
                                <p className="text-neutral-500 text-xs leading-tight">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 p-8 pb-12">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/game/shudom/play')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.2)] tracking-wider uppercase transition-all flex items-center justify-center gap-3"
                >
                    Начать приключение
                    <span className="text-xl">➔</span>
                </motion.button>
            </div>
        </div>
    );
};

export default ShuDomIntro;
