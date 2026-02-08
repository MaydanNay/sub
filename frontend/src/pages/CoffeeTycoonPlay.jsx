import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import Board from '../components/coffee/Board';
import HUD from '../components/coffee/HUD';
import ShopVisual from '../components/coffee/ShopVisual';

const CoffeeTycoonPlay = () => {
    const navigate = useNavigate();
    const [gameMode, setGameMode] = React.useState('management'); // 'management' or 'match3'

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-[#0f1115] text-white overflow-x-hidden relative flex flex-col">
                {/* Fixed Header */}
                <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center p-4 px-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent backdrop-blur-[2px] gap-3">
                    <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => gameMode === 'match3' ? setGameMode('management') : navigate('/game/coffee')}
                            className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10 active:scale-95 whitespace-nowrap"
                        >
                            {gameMode === 'match3' ? '← В Офис' : '← Выйти'}
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent uppercase italic"
                        >
                            {gameMode === 'match3' ? 'KITCHEN' : 'TYCOON'}
                        </motion.div>

                        {/* Spacer for centering */}
                        <div className="w-[85px] md:block hidden" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 bg-amber-500/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-amber-500/20 shadow-xl"
                    >
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Цех:</span>
                        <span className="text-sm font-black italic tracking-tighter tabular-nums text-amber-400">
                            {gameMode === 'match3' ? 'ПРИГОТОВЛЕНИЕ' : 'УПРАВЛЕНИЕ'}
                        </span>
                    </motion.div>
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    {gameMode === 'management' ? (
                        <motion.div
                            key="management"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 p-6 pt-24 pb-12 lg:pb-6"
                        >
                            {/* Visual Section */}
                            <div className="flex flex-col items-center gap-6 w-full lg:w-[450px]">
                                <ShopVisual />
                                <HUD />
                            </div>

                            {/* Action Card */}
                            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-md w-full">
                                <div className="text-7xl mb-6">☕</div>
                                <h2 className="text-3xl font-black mb-3 tracking-tight">ТВОЯ КОФЕЙНЯ</h2>
                                <p className="text-white/40 text-sm mb-8 leading-relaxed">
                                    Хочешь заработать больше монет и открыть новые улучшения? Отправляйся на кухню и приготовь лучший кофе!
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setGameMode('match3')}
                                    className="w-full py-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xl shadow-[0_20px_40px_rgba(245,158,11,0.2)] hover:shadow-amber-500/40 transition-all uppercase tracking-widest"
                                >
                                    🧁 НА КУХНЮ
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="match3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6"
                        >
                            <div className="relative group">
                                <Board />
                                <p className="mt-8 text-center text-amber-500/40 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">
                                    Собирай ингредиенты в ряд
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ambient Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[150px] animate-pulse animation-delay-2000" />
                </div>
            </div>
        </DndProvider>
    );
};

export default CoffeeTycoonPlay;
