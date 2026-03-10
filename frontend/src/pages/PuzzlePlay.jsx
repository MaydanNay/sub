import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';

const PuzzlePlay = () => {
    const navigate = useNavigate();
    const TOTAL_PIECES = 9;
    const PIECE_PRICE = 50;

    const [coins, setCoins] = useState(() => {
        const saved = storage.get('puzzle_coins');
        return saved ? parseInt(saved) : 100;
    });

    const [inventory, setInventory] = useState(() => {
        const saved = storage.get('puzzle_inventory');
        return saved ? JSON.parse(saved) : [];
    });

    const [placedPieces, setPlacedPieces] = useState(() => {
        const saved = storage.get('puzzle_placed');
        return saved ? JSON.parse(saved) : [];
    });

    const [isWon, setIsWon] = useState(false);
    const [lastEarnedTime, setLastEarnedTime] = useState(0);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);

    useEffect(() => {
        storage.set('puzzle_coins', coins.toString());
        storage.set('puzzle_inventory', JSON.stringify(inventory));
        storage.set('puzzle_placed', JSON.stringify(placedPieces));

        if (placedPieces.length === TOTAL_PIECES) {
            setIsWon(true);
        }
    }, [coins, inventory, placedPieces]);

    const earnCoins = () => {
        const now = Date.now();
        if (now - lastEarnedTime < 500) return;
        setCoins(c => c + 10);
        setLastEarnedTime(now);
    };

    const buyPiece = () => {
        if (coins < PIECE_PRICE) return;
        const missing = Array.from({ length: TOTAL_PIECES }, (_, i) => i)
            .filter(i => !inventory.includes(i) && !placedPieces.includes(i));

        if (missing.length === 0) return;

        const newPiece = missing[Math.floor(Math.random() * missing.length)];
        setCoins(c => c - PIECE_PRICE);
        setInventory(prev => [...prev, newPiece]);

        // Open inventory automatically to show the new piece
        setIsInventoryOpen(true);
    };

    const placePiece = (index) => {
        if (placedPieces.includes(index)) return;
        setPlacedPieces(prev => [...prev, index].sort((a, b) => a - b));
        setInventory(prev => prev.filter(i => i !== index));
    };

    const getPieceEmoji = (idx) => {
        const emojis = ['🐘', '🦁', '🦒', '🦒', '🦓', '🐆', '🐒', '🦜', '🦩'];
        return emojis[idx % emojis.length];
    };

    const resetGame = () => {
        setInventory([]);
        setPlacedPieces([]);
        setIsWon(false);
        storage.remove('puzzle_inventory');
        storage.remove('puzzle_placed');
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white overflow-hidden relative flex flex-col font-sans">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-[2px]">
                <div className="flex items-center gap-3">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/game/puzzle')}
                        className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10 active:scale-95"
                    >
                        ← Выйти
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => {
                            if (window.confirm('Сбросить прогресс текущего пазла?')) resetGame();
                        }}
                        className="bg-red-500/10 backdrop-blur-md px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 shadow-lg border border-red-500/20 active:scale-95 transition-all md:block hidden"
                    >
                        Сброс
                    </motion.button>
                </div>

                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl px-6 py-2.5 rounded-2xl border border-white/10 shadow-xl">
                    <span className="text-xl">💰</span>
                    <span className="text-lg font-black tabular-nums tracking-tight">{coins}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pt-24 pb-48 flex flex-col items-center px-6">
                <div className="w-full max-w-sm flex flex-col items-center gap-8">
                    {/* Puzzle Board Area */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative p-6 rounded-[3rem] bg-slate-800/40 backdrop-blur-xl border-4 border-slate-700/50 shadow-[0_30px_60px_rgba(0,0,0,0.5)] w-full"
                    >
                        <div className="grid grid-cols-3 gap-3 aspect-square">
                            {Array.from({ length: TOTAL_PIECES }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`relative rounded-2xl overflow-hidden transition-all duration-700 aspect-square ${placedPieces.includes(i)
                                        ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 shadow-inner'
                                        : 'bg-black/40 border-2 border-dashed border-white/10'
                                        }`}
                                >
                                    <AnimatePresence>
                                        {placedPieces.includes(i) && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-2xl"
                                            >
                                                {getPieceEmoji(i)}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {!placedPieces.includes(i) && (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/10 text-lg font-black">
                                            {i + 1}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Actions Area */}
                    <div className="w-full flex justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={earnCoins}
                            className="flex-1 bg-slate-800/80 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-2xl flex flex-col items-center gap-1 active:bg-slate-700 transition-colors"
                        >
                            <span className="text-2xl">🖱️</span>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest mt-1">Кликай</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                            className={`flex-1 bg-slate-800/80 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-2xl flex flex-col items-center gap-1 transition-all relative ${isInventoryOpen ? 'ring-2 ring-indigo-500 bg-slate-700 shadow-indigo-500/20' : ''
                                }`}
                        >
                            <span className="text-2xl">🎒</span>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest mt-1">Детали</span>
                            <AnimatePresence>
                                {inventory.length > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-[#1a1c23]"
                                    >
                                        {inventory.length}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={buyPiece}
                            disabled={coins < PIECE_PRICE}
                            className={`flex-1 p-4 rounded-[2rem] shadow-2xl flex flex-col items-center gap-1 border border-white/10 transition-all ${coins < PIECE_PRICE
                                ? 'bg-slate-900/50 opacity-50 grayscale cursor-not-allowed'
                                : 'bg-gradient-to-br from-indigo-500 to-purple-700'
                                }`}
                        >
                            <span className="text-2xl">🎁</span>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest mt-1">Купить</span>
                            <span className="text-[9px] font-black text-white/50">{PIECE_PRICE} 💰</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Piece Tray (Animated Drawer) */}
            <AnimatePresence>
                {isInventoryOpen && (
                    <React.Fragment key="inventory-drawer">
                        {/* Overlay backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsInventoryOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 p-8 pt-4 bg-slate-900/95 backdrop-blur-2xl z-40 border-t border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.6)] rounded-t-[3rem]"
                        >
                            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />

                            <div className="max-w-xl mx-auto flex flex-col gap-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-1">Твои детали на складе</h3>
                                    <button
                                        onClick={() => setIsInventoryOpen(false)}
                                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide min-h-[120px] items-center px-1">
                                    {inventory.length === 0 ? (
                                        <div className="w-full text-center py-10 rounded-[2rem] bg-white/5 border border-dashed border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                                                У тебя пока нет деталей.<br />Заработай монеты или купи подарок!
                                            </p>
                                        </div>
                                    ) : (
                                        inventory.map((pieceIdx) => (
                                            <motion.button
                                                key={`piece-${pieceIdx}`}
                                                initial={{ scale: 0, rotate: -45 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                whileHover={{ y: -10, scale: 1.05 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => placePiece(pieceIdx)}
                                                className="flex-shrink-0 w-24 h-24 bg-white/10 rounded-[2.5rem] border border-white/15 flex items-center justify-center text-5xl shadow-2xl hover:bg-white/20 transition-all relative group"
                                            >
                                                {getPieceEmoji(pieceIdx)}
                                                <div className="absolute -top-1 -right-1 bg-indigo-500 text-white p-1.5 rounded-full shadow-lg border-2 border-[#15171e]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                                </div>
                                            </motion.button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </React.Fragment>
                )}
            </AnimatePresence>

            {/* Win Modal */}
            <AnimatePresence>
                {isWon && (
                    <motion.div key="win-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-slate-800 rounded-[3rem] p-10 max-w-sm w-full relative overflow-hidden border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            <div className="text-center">
                                <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-8xl mb-6">🏆</motion.div>
                                <h2 className="text-3xl font-black text-white mb-3 tracking-tighter">ПОБЕДА!</h2>
                                <p className="text-slate-400 text-[10px] font-black mb-8 uppercase tracking-[0.3em]">Весь пазл успешно собран</p>
                                <div className="bg-white/5 rounded-[2.5rem] p-8 mb-10 border border-white/5 shadow-inner">
                                    <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-3">Твоя награда:</p>
                                    <p className="text-white text-3xl font-black italic tracking-tighter">КУПОН 1000₽</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={resetGame}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all uppercase tracking-widest"
                                >
                                    Собрать заново!
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[150px] animate-pulse transition-all duration-1000" />
            </div>
        </div>
    );
};

export default PuzzlePlay;
