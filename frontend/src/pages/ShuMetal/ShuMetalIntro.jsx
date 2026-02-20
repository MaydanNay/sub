import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import bgImage from './images/bg.png';
import persImage from './images/pers.png';

const ShuMetalIntro = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen bg-zinc-950 text-white font-sans overflow-hidden flex flex-col">
            {/* Background with overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

            {/* Animated Grid lines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-12 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-48 h-48 rounded-full border-2 border-dashed border-orange-500/30 absolute inset-[-10px]"
                        />
                        <img src={persImage} alt="Master" className="w-48 h-48 object-cover rounded-full border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]" />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-black italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-rose-600"
                >
                    SHUMETAL
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-zinc-400 font-bold uppercase tracking-[0.2em] mb-8"
                >
                    Мастер стального пути
                </motion.p>

                <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                    {[
                        { title: 'RPG Приключение', desc: 'Прокачай своего персонажа до ранга Титан' },
                        { title: 'AluCoins', desc: 'Зарабатывай валюту за безопасность и идеи' },
                        { title: 'Реальные награды', desc: 'Трать коины на мерч, гаджеты и отгулы' }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="bg-zinc-900/60 backdrop-blur-md border-l-4 border-orange-500 p-4 text-left"
                        >
                            <h3 className="font-bold text-orange-400 uppercase text-xs mb-1">{item.title}</h3>
                            <p className="text-zinc-500 text-sm leading-tight">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 p-8 pb-12">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/game/shumetal/play')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] tracking-wider uppercase transition-all"
                >
                    Начать восхождение
                </motion.button>
            </div>
        </div>
    );
};

export default ShuMetalIntro;
