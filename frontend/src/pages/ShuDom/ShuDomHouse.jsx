import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { IconArrowLeft, IconHome } from '../../components/GameIcons';
import bgImage from './images/bg.png';

const HOUSE_ROOMS = [
    { id: 'living_room', name: 'Гостиная', icon: '🛋️', color: 'bg-blue-500/20' },
    { id: 'kitchen', name: 'Кухня', icon: '🍳', color: 'bg-orange-500/20' },
    { id: 'bedroom', name: 'Спальня', icon: '🛏️', color: 'bg-purple-500/20' },
    { id: 'bathroom', name: 'Ванная', icon: '🛀', color: 'bg-emerald-500/20' }
];

const ShuDomHouse = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen bg-white text-neutral-900 font-sans overflow-hidden flex flex-col pb-32">
            <div
                className="fixed inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url(${bgImage})` }}
            />

            {/* Header */}
            <div className="relative z-10 px-6 pt-12 flex justify-between items-center mb-8">
                <button
                    onClick={() => navigate('/game/shudom')}
                    className="w-10 h-10 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-center text-white"
                >
                    <IconArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-black italic tracking-tighter text-blue-400 uppercase leading-none mb-1">МОЙ ДОМ</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Карта помещений</p>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* House Grid */}
            <div className="relative z-10 px-6 flex-1 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    {HOUSE_ROOMS.map((room) => (
                        <motion.button
                            key={room.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/game/shudom/room/${room.id}`)}
                            className={`
                                relative aspect-square rounded-[32px] border border-red-500/5 overflow-hidden flex flex-col items-center justify-center gap-2
                                ${room.color.replace('bg-', 'bg-').replace('-500/20', '-50')} bg-white shadow-xl
                            `}
                        >
                            <span className="text-5xl mb-2">{room.icon}</span>
                            <span className="text-xs font-black uppercase tracking-widest">{room.name}</span>

                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 p-3 opacity-20">
                                <IconHome className="w-6 h-6" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default ShuDomHouse;
