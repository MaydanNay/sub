import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Map, Camera } from 'lucide-react';

const ShuBoomIntro = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-400 to-red-500 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-10 left-10 text-9xl opacity-10 font-black"
                >
                    ?
                </motion.div>
                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 7, repeat: Infinity }}
                    className="absolute bottom-20 right-10 text-9xl opacity-10 font-black"
                >
                    !
                </motion.div>
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 text-center max-w-md"
            >
                <h1 className="text-6xl font-black mb-2 drop-shadow-lg tracking-tighter">ShuBoom</h1>
                <p className="text-xl font-medium mb-8 opacity-90">Собери их всех!</p>

                <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-xl border border-white/30">
                    <div className="grid grid-cols-1 gap-4 text-left">
                        <Feature icon={Gift} title="Открывай сундуки" desc="Получай героев за покупки" />
                        <Feature icon={Map} title="Ищи на карте" desc="Находи уникальных персонажей в городе" />
                        <Feature icon={Camera} title="AR Режим" desc="Оживи свою коллекцию в реальности" />
                    </div>
                </div>

                <Link to="/game/shuboom/play">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-orange-600 font-bold text-xl py-4 px-12 rounded-full shadow-2xl flex items-center gap-2 mx-auto hover:bg-orange-50 transition-colors"
                    >
                        Начать игру <ArrowRight className="w-6 h-6" />
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    );
};

const Feature = ({ icon: Icon, title, desc }) => (
    <div className="flex items-center gap-4 p-2">
        <div className="bg-white/20 p-3 rounded-2xl">
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <h3 className="font-bold text-lg leading-tight">{title}</h3>
            <p className="text-sm opacity-80 leading-tight">{desc}</p>
        </div>
    </div>
);

export default ShuBoomIntro;
