import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconGift, IconFlower } from '../../components/GameIcons';
import { Link } from 'react-router-dom';

const ShuBeautyIntro = () => {
    const navigate = useNavigate();
    const bgPng = new URL('./images/bg.png', import.meta.url).href;

    return (
        <div className="min-h-screen bg-cover bg-center p-4 flex flex-col items-center justify-center relative overflow-hidden font-sans" style={{ backgroundImage: `url(${bgPng})` }}>
            {/* Floating Petals */}
            <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: ['-10%', '110%'],
                            x: [Math.random() * 100 + '%', (Math.random() * 100 - 10) + '%'],
                            rotate: [0, 360]
                        }}
                        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: 'linear' }}
                        className="absolute text-pink-300 text-lg"
                        style={{ left: Math.random() * 100 + '%' }}
                    >
                        🌸
                    </motion.div>
                ))}
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl flex flex-col min-h-[85vh] my-8 relative z-10 border border-white/50">
                <div className="p-8 flex-1 flex flex-col items-center text-center">
                    <div className="flex justify-between w-full mb-8">
                        <Link to="/" className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <IconArrowLeft className="w-6 h-6 text-gray-600" />
                        </Link>
                        <div className="flex gap-2">
                            <span className="px-4 py-1.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <IconFlower className="w-3 h-3" />
                                SPRING MAZE
                            </span>
                        </div>
                    </div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-6"
                    >
                        <div className="w-32 h-32 bg-gradient-to-br from-rose-400 to-pink-500 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl shadow-rose-200 border-4 border-white mb-6">
                            🐼
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl font-black text-rose-950 uppercase tracking-tighter italic mb-4"
                    >
                        Весенний Лабиринт
                    </motion.h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10 leading-relaxed">
                        Пройди путь к красоте вместе с партнерами!
                    </p>

                    <div className="bg-rose-50 p-6 rounded-[2.5rem] w-full text-left mb-auto border border-rose-100">
                        <h4 className="font-black text-rose-700 uppercase italic tracking-tight mb-4 flex items-center gap-2">
                            <IconGift className="w-5 h-5" />
                            Программа Лояльности:
                        </h4>
                        <ul className="text-xs text-rose-900/80 space-y-3 font-bold uppercase tracking-wide">
                            <li className="flex gap-3">🎲 <span className="flex-1">Бросай кубик и делай шаги по цветочному пути</span></li>
                            <li className="flex gap-3">🎁 <span className="flex-1">Собери бокс от Lamoda, BKS и Sokolov</span></li>
                            <li className="flex gap-3">🪜 <span className="flex-1">Используй лестницы для быстрого подъема</span></li>
                            <li className="flex gap-3">🎯 <span className="flex-1">Выполняй задания партнеров и получай ходы!</span></li>
                        </ul>
                    </div>
                </div>

                <div className="p-8 bg-white border-t border-rose-100">
                    <button
                        onClick={() => navigate('/game/shubeauty/play')}
                        className="w-full py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black rounded-3xl text-xl uppercase tracking-widest shadow-[0_10px_30px_rgba(244,63,94,0.4)] hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-4 border-b-4 border-rose-700"
                    >
                        <span>Начать путь</span>
                        <span className="bg-white/20 px-3 py-1 rounded-xl text-xs">50 ХОДОВ</span>
                    </button>
                    <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">
                        Демо-версия для бизнес-партнеров
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShuBeautyIntro;
