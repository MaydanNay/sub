import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconShoppingBag, IconPlus, IconCheck, IconX } from '../../components/GameIcons';
import BottomNav from './components/BottomNav';
import { SHUDOM_ROOMS } from './gameData';
import bgImage from './images/bg.png';

const MOCK_OWNED_ITEMS = [
    { id: 'tv_1', name: 'QLED TV 8K', icon: '📺', category: 'electronics' },
    { id: 'console_1', name: 'PS5 Pro', icon: '🎮', category: 'gaming' },
    { id: 'sofa_1', name: 'Magnum Sofa', icon: '🛋️', category: 'furniture' },
    { id: 'oven_1', name: 'Smart Oven', icon: '🍳', category: 'kitchen' },
];

const ShuDomRoomDetail = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const room = SHUDOM_ROOMS.find(r => r.id === roomId) || SHUDOM_ROOMS[0];

    const [placedItems, setPlacedItems] = useState([]);
    const [mode, setMode] = useState('view'); // 'view', 'menu', 'add', 'move'

    const handlePlaceItem = (item) => {
        setPlacedItems([...placedItems, {
            ...item,
            instanceId: Date.now(),
            x: 40, // Centered initial position
            y: 40
        }]);
    };

    const updateItemPosition = (instanceId, info) => {
        setPlacedItems(prev => prev.map(item => {
            if (item.instanceId === instanceId) {
                const sensitivity = 0.25;
                return {
                    ...item,
                    x: Math.min(Math.max(item.x + info.offset.x * sensitivity, 0), 90),
                    y: Math.min(Math.max(item.y + info.offset.y * sensitivity, 0), 80)
                };
            }
            return item;
        }));
    };

    const isDraggingEnabled = mode === 'add' || mode === 'move';

    return (
        <div className="relative min-h-screen bg-white text-neutral-900 font-sans overflow-hidden flex flex-col pb-32">
            {/* Interior Background - Fully Visible */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-100"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-transparent opacity-40 mix-blend-multiply" />
            </div>

            {/* Header */}
            <div className="relative z-10 px-6 pt-12 flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate('/game/shudom/house')}
                    className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-neutral-200 flex items-center justify-center text-red-600 shadow-sm"
                >
                    <IconArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-black italic tracking-tighter text-red-600 drop-shadow-md uppercase leading-none mb-1">{room.name}</h1>
                    <p className="text-[10px] text-neutral-900 font-black uppercase tracking-widest drop-shadow-sm leading-none">Интерьер и техника</p>
                </div>
                <button
                    onClick={() => navigate('/game/shudom/rooms', { state: { roomId: room.id } })}
                    className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20"
                >
                    <IconShoppingBag className="w-5 h-5" />
                </button>
            </div>

            {/* Placement Layer */}
            <div className="relative z-10 flex-1 px-4 py-8">
                {placedItems.length === 0 && mode === 'view' && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-md border border-red-100 flex items-center justify-center text-3xl mb-4 shadow-xl">🏠</div>
                        <p className="text-[10px] font-black uppercase text-red-600 bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm tracking-widest max-w-[150px]">Комната почти пуста</p>
                    </div>
                )}

                {/* Placed Items Render */}
                {placedItems.map((item) => (
                    <motion.div
                        key={item.instanceId}
                        drag={isDraggingEnabled}
                        dragMomentum={false}
                        onDragEnd={(e, info) => updateItemPosition(item.instanceId, info)}
                        className={`absolute cursor-pointer select-none ${isDraggingEnabled ? 'ring-2 ring-red-500 ring-offset-2 rounded-2xl bg-white/20 backdrop-blur-sm' : ''}`}
                        style={{ left: `${item.x}%`, top: `${item.y}%` }}
                        whileDrag={{ scale: 1.1, zIndex: 100 }}
                    >
                        <span className="text-7xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] active:scale-95 transition-transform block">{item.icon}</span>
                    </motion.div>
                ))}
            </div>

            {/* UI Overlay Buttons */}
            <div className="relative z-20 px-6 mb-4 flex justify-end gap-3">
                {mode === 'view' && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMode('menu')}
                        className="bg-white border border-neutral-200 px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Обустроить</span>
                        <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-white">
                            <IconPlus className="w-4 h-4" />
                        </div>
                    </motion.button>
                )}

                {mode === 'move' && (
                    <button
                        onClick={() => setMode('view')}
                        className="w-full bg-red-600 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                    >
                        <IconCheck className="w-4 h-4" />
                        Завершить перестановку
                    </button>
                )}
            </div>

            {/* Modals & Trays */}
            <AnimatePresence>
                {mode === 'menu' && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-[55]"
                            onClick={() => setMode('view')}
                        />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-red-100 p-8 pt-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[40px]"
                        >
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-neutral-100 rounded-full" />
                            <h3 className="text-xs font-black uppercase text-red-600 tracking-[0.2em] mb-8 text-center">Выберите действие</h3>
                            <div className="flex gap-4 mb-4">
                                <button
                                    onClick={() => setMode('add')}
                                    className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded-3xl p-6 flex flex-col items-center gap-3 transition-colors"
                                >
                                    <div className="text-3xl">🧺</div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Добавить</span>
                                </button>
                                <button
                                    onClick={() => setMode('move')}
                                    className="flex-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-3xl p-6 flex flex-col items-center gap-3 transition-colors"
                                >
                                    <div className="text-3xl">🖐️</div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Перестановка</span>
                                </button>
                            </div>
                            <button
                                onClick={() => setMode('view')}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400"
                            >
                                Отмена
                            </button>
                        </motion.div>
                    </>
                )}

                {mode === 'add' && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-white/20 backdrop-blur-[2px] z-[55]"
                            onClick={() => setMode('view')}
                        />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-red-100 p-6 pt-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[40px]"
                        >
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-neutral-100 rounded-full" />

                            <h3 className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-6 text-center">Ваш склад техники</h3>
                            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide mb-6 border-b border-red-50">
                                {MOCK_OWNED_ITEMS.map((item) => (
                                    <motion.button
                                        key={item.id}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handlePlaceItem(item)}
                                        className="shrink-0 w-24 h-24 bg-neutral-50 rounded-3xl border border-neutral-100 flex flex-col items-center justify-center gap-1 shadow-sm transition-colors hover:border-red-200"
                                    >
                                        <span className="text-3xl">{item.icon}</span>
                                        <span className="text-[8px] font-black uppercase text-neutral-400 tracking-tighter truncate w-20 px-1 text-center">{item.name}</span>
                                    </motion.button>
                                ))}
                                <button
                                    onClick={() => navigate('/game/shudom/rooms', { state: { roomId: room.id } })}
                                    className="shrink-0 w-24 h-24 bg-red-50 rounded-3xl border border-dashed border-red-200 flex flex-col items-center justify-center gap-1"
                                >
                                    <span className="text-2xl text-red-300">+</span>
                                    <span className="text-[8px] font-black uppercase text-red-300 tracking-tighter">В магазин</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setMode('view')}
                                className="w-full bg-red-600 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                            >
                                <IconCheck className="w-4 h-4" />
                                Готово
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
};

export default ShuDomRoomDetail;
