import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IconSushi, IconFish, IconArrowRight, IconArrowLeft } from '../components/GameIcons';
import dish1 from './ShuShi/images/dishes/1.PNG';

import { useUser } from '../components/UserProvider';

const ShuShi = () => {
    const { userPhone } = useUser();
    return (
        <div className="min-h-[100dvh] bg-slate-900 text-white relative overflow-hidden font-montserrat flex flex-col">
            {/* Background - Night Tokyo Vibes */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-900"></div>

            {/* Neon Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

            <div className="relative z-10 flex flex-col items-center justify-center flex-grow p-4 text-center">

                <div className="absolute top-6 left-6">
                    <Link
                        to="/"
                        className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
                        aria-label="Назад"
                    >
                        <IconArrowLeft className="w-6 h-6" />
                    </Link>
                </div>

                {/* Logo / Title */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-4 mt-6 md:mt-12"
                >
                    <div className="relative inline-block">
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] tracking-tighter">
                            ShuShi
                        </h1>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -top-4 -right-6 md:-top-6 md:-right-8 text-3xl md:text-4xl"
                        >
                            🍣
                        </motion.div>
                    </div>
                    <p className="text-sm md:text-base text-cyan-200 uppercase tracking-[0.2em] font-bold mt-2 text-shadow-glow">
                        Стань Суши-Мастером
                    </p>
                </motion.div>

                {/* Mascot / Hero Image Placeholder */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="w-40 h-40 md:w-64 md:h-64 mb-6 relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.2)]"
                >
                    {/* Sushi Dish */}
                    <img src={dish1} alt="ShuShi" className="w-3/4 h-3/4 object-contain filter drop-shadow-2xl" />

                    {/* Floating Elements */}
                    <motion.div animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-4 -right-4 bg-slate-800 p-2 md:p-3 rounded-2xl border border-white/10 shadow-xl">
                        <IconSushi className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
                    </motion.div>
                    <motion.div animate={{ y: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }} className="absolute -bottom-4 -left-4 bg-slate-800 p-2 md:p-3 rounded-2xl border border-white/10 shadow-xl">
                        <IconFish className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
                    </motion.div>
                </motion.div>

                {/* Description */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-md space-y-4 mb-8"
                >
                    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                            ⚡ Правила
                        </h3>
                        <p className="text-slate-300 text-sm">
                            1. Запомни состав ролла за <span className="text-amber-400 font-bold">3 секунды</span>.
                        </p>
                        <p className="text-slate-300 text-sm">
                            2. Собери его по памяти, избегая <span className="text-red-400 font-bold">ловушек</span>.
                        </p>
                        <p className="text-slate-300 text-sm">
                            3. Набери серию побед и получи <span className="text-green-400 font-bold">вкусные призы</span>!
                        </p>
                    </div>
                </motion.div>

                {/* Play Button */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring" }}
                    className="w-full max-w-sm"
                >
                    <Link to="/game/shushi/play" className="block w-full group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <button className="relative w-full bg-slate-900 rounded-2xl p-4 transition-all duration-200 group-hover:bg-slate-800 flex items-center justify-center gap-4 border border-white/10">
                            <span className="text-xl font-black text-white uppercase tracking-widest group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 transition-all">
                                Начать Игру
                            </span>
                            <IconArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </motion.div>

                <p className="mt-6 text-xs text-slate-500 font-mono">
                    Okadzaki Games • v1.0
                </p>
            </div>

            <style>{`
                .text-shadow-glow {
                    text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
                }
            `}</style>
        </div>
    );
};

export default ShuShi;
