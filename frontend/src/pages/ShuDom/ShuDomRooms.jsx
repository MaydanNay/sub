import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { SHUDOM_ROOMS } from './gameData';
import bgImage from './images/bg.png';
import { IconChest, IconLightning, IconTarget, IconChart, IconArrowLeft } from '../../components/GameIcons';

const ShuDomRooms = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Check if a specific room was passed via navigation state
    const initialRoomId = location.state?.roomId || SHUDOM_ROOMS[0].id;
    const initialRoom = SHUDOM_ROOMS.find(r => r.id === initialRoomId) || SHUDOM_ROOMS[0];

    const [selectedRoom, setSelectedRoom] = useState(initialRoom);
    // Mock progress data
    const [roomProgress] = useState({
        living_room: { currentLevel: 12, unlocked: ['QLED TV 8K', 'Soundbar 7.1'] },
        kitchen: { currentLevel: 3, unlocked: [] }
    });

    const getRoomStatus = (room) => {
        const progress = roomProgress[room.id];
        if (!progress && room.id !== 'living_room') return 'locked';
        if (progress?.currentLevel >= room.levels) return 'completed';
        return 'in-progress';
    };

    return (
        <div className="relative min-h-screen bg-white text-neutral-900 font-sans overflow-hidden flex flex-col pb-32">
            <div
                className="fixed inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url(${bgImage})` }}
            />

            <div className="relative z-10 px-6 pt-12 flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/game/shudom')}
                    className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-red-600 shrink-0 shadow-sm"
                >
                    <IconArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-black italic tracking-tighter text-red-600 uppercase leading-none mb-1">МАГАЗИН</h1>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Улучшения для дома</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <IconChart className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-black text-red-600">12/250</span>
                </div>
            </div>

            <div className="relative z-10 px-6">

                {/* Rooms Slider/List */}
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6">
                    {SHUDOM_ROOMS.map((room) => {
                        const status = getRoomStatus(room);
                        const isSelected = selectedRoom.id === room.id;
                        return (
                            <motion.button
                                key={room.id}
                                onClick={() => setSelectedRoom(room)}
                                className={`
                                    relative shrink-0 w-32 h-40 rounded-[32px] overflow-hidden border-2 transition-all p-4 flex flex-col justify-end
                                    ${isSelected ? 'border-red-500 bg-red-50 shadow-lg' : 'border-neutral-100 bg-white shadow-sm'}
                                    ${status === 'locked' ? 'opacity-40 grayscale' : ''}
                                `}
                            >
                                {status === 'locked' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <span className="text-2xl">🔒</span>
                                    </div>
                                )}
                                <span className={`text-[10px] uppercase font-black tracking-tighter leading-none mb-1 ${isSelected ? 'text-red-600' : 'text-neutral-400'}`}>Room</span>
                                <span className="text-xs font-bold leading-tight uppercase text-neutral-800">{room.name}</span>
                                {status !== 'locked' && (
                                    <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-600"
                                            style={{ width: `${(roomProgress[room.id]?.currentLevel || 0) / room.levels * 100}%` }}
                                        />
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                    {/* Placeholder for remaining rooms not in gameData yet */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="shrink-0 w-32 h-40 rounded-[32px] bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center opacity-20">
                            <span className="text-2xl">🔒</span>
                        </div>
                    ))}
                </div>

                {/* Selected Room Details */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedRoom.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-[40px] p-6 shadow-2xl"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-black uppercase text-neutral-900 mb-1">{selectedRoom.name}</h2>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Цель: {selectedRoom.levels} уровней</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm">
                                <IconChest className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-2">Награды комнаты</h3>
                            {selectedRoom.unlocks.map((unlock, i) => {
                                const isUnlocked = (roomProgress[selectedRoom.id]?.currentLevel || 0) >= unlock.level;
                                return (
                                    <div
                                        key={i}
                                        className={`
                                            flex items-center gap-4 p-3 rounded-[24px] border transition-all
                                            ${isUnlocked ? 'bg-red-50/50 border-red-500/10' : 'bg-neutral-50/50 border-neutral-100 opacity-50'}
                                        `}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isUnlocked ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-neutral-200 text-neutral-400'}`}>
                                            {unlock.type === 'electronics' ? '📺' : unlock.type === 'gaming' ? '🎮' : '🛋️'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h4 className="text-xs font-black uppercase leading-none text-neutral-800">{unlock.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    {isUnlocked && <span className="text-[8px] font-black text-red-600">{unlock.price}</span>}
                                                    <span className="text-[10px] font-black text-neutral-400 uppercase">Lv. {unlock.level}</span>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tighter">
                                                {isUnlocked ? 'Удаленная покупка доступна' : `Пройдите еще ${unlock.level - (roomProgress[selectedRoom.id]?.currentLevel || 0)} уровней`}
                                            </p>
                                        </div>
                                        {isUnlocked && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-tighter shadow-lg shadow-red-600/20"
                                                onClick={() => window.open(unlock.link || '#', '_blank')}
                                            >
                                                Купить
                                            </motion.button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-8 bg-black text-white font-black py-4 rounded-[24px] shadow-xl shadow-black/10 uppercase tracking-wider text-xs transition-transform"
                            onClick={() => window.location.href = '/game/shudom/play'}
                        >
                            Продолжить обустройство
                        </motion.button>
                    </motion.div>
                </AnimatePresence>
            </div>

            <BottomNav />
        </div>
    );
};

export default ShuDomRooms;
