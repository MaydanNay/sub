import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import PrizeDrawer from '../components/PrizeDrawer';
import ThemeCustomizer from '../components/ThemeCustomizer';
import {
    IconCherry, IconLemon, IconOrange, IconGrape, IconWatermelon, IconStar, IconDiamond, IconSeven
} from '../components/GameIcons';

const Slots = () => {
    const [reels, setReels] = useState([0, 0, 0]);
    const [spinning, setSpinning] = useState([false, false, false]);
    const [result, setResult] = useState(null);
    const [coins, setCoins] = useState(() => {
        const saved = localStorage.getItem('slots_coins');
        return saved ? parseInt(saved) : 100;
    });
    const [bet, setBet] = useState(10);

    const SYMBOLS = [
        { icon: IconCherry, name: 'Вишня', multiplier: 2, color: 'text-red-500' },
        { icon: IconLemon, name: 'Лимон', multiplier: 3, color: 'text-yellow-400' },
        { icon: IconOrange, name: 'Апельсин', multiplier: 4, color: 'text-orange-500' },
        { icon: IconGrape, name: 'Виноград', multiplier: 5, color: 'text-purple-500' },
        { icon: IconWatermelon, name: 'Арбуз', multiplier: 8, color: 'text-green-500' },
        { icon: IconStar, name: 'Звезда', multiplier: 10, color: 'text-yellow-500' },
        { icon: IconDiamond, name: 'Алмаз', multiplier: 20, color: 'text-blue-400' },
        { icon: IconSeven, name: 'Семёрка', multiplier: 50, color: 'text-red-600' },
    ];

    // Convert SYMBOLS to a format compatible with PrizeDrawer
    const drawerPrizes = SYMBOLS.map((s, i) => ({
        id: i,
        title: s.name,
        description: `Множитель: x${s.multiplier}`,
        type: 'win'
    }));

    useEffect(() => {
        localStorage.setItem('slots_coins', coins.toString());
    }, [coins]);

    const spin = () => {
        if (spinning.some(s => s) || coins < bet) return;

        setCoins(prev => prev - bet);
        setResult(null);
        setSpinning([true, true, true]);

        SoundManager.play('spin');

        // Generate results
        const results = [
            Math.floor(Math.random() * SYMBOLS.length),
            Math.floor(Math.random() * SYMBOLS.length),
            Math.floor(Math.random() * SYMBOLS.length),
        ];

        // Stop reels with delay
        [0, 1, 2].forEach((i, idx) => {
            setTimeout(() => {
                setReels(prev => {
                    const newReels = [...prev];
                    newReels[i] = results[i];
                    return newReels;
                });
                setSpinning(prev => {
                    const newSpinning = [...prev];
                    newSpinning[i] = false;
                    return newSpinning;
                });
                SoundManager.play('click');

                // Check win on last reel stop
                if (i === 2) {
                    setTimeout(() => checkWin(results), 300);
                }
            }, 1000 + idx * 500);
        });
    };

    const checkWin = (results) => {
        const [a, b, c] = results;

        if (a === b && b === c) {
            // Jackpot - all three match
            const symbol = SYMBOLS[a];
            const winAmount = bet * symbol.multiplier;
            setCoins(prev => prev + winAmount);
            setResult({ type: 'jackpot', symbol, win: winAmount });
            SoundManager.play('jackpot');
        } else if (a === b || b === c || a === c) {
            // Two match
            const matchSymbol = a === b ? a : (b === c ? b : a);
            const symbol = SYMBOLS[matchSymbol];
            const winAmount = Math.floor(bet * symbol.multiplier * 0.3);
            setCoins(prev => prev + winAmount);
            setResult({ type: 'win', symbol, win: winAmount });
            SoundManager.play('win');
        } else {
            setResult({ type: 'lose' });
            SoundManager.play('failure');
        }
    };

    const resetGame = () => {
        setCoins(100);
        localStorage.setItem('slots_coins', '100');
        SoundManager.play('click');
    };

    return (
        <div className="bg-amber-50 min-h-[calc(100vh-64px)] md:min-h-screen md:py-20 md:px-4 flex flex-col items-center justify-center relative overflow-hidden h-full md:h-auto pb-[40vh] md:pb-0">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-10 left-1/2 w-48 h-48 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header - Animated SHU Logo - Top of Page */}
            <div className="w-full pt-8 pb-4 flex flex-col items-center z-20 relative">
                <motion.a
                    href="/"
                    className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 font-sans tracking-tighter cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    SHU
                </motion.a>
                <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1">
                    ← назад в каталог
                </a>
            </div>

            {/* Mobile Layout: Vertical stack, Game Top, Prizes Bottom Drawer */}
            <div className="max-w-2xl w-full z-10 flex flex-col gap-8 items-center justify-center p-4">

                {/* Game Area */}
                <div
                    className="w-full flex flex-col items-center justify-center p-6 md:p-10 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-2xl transition-all duration-300 border border-white/50"
                >
                    {/* Title */}
                    <h2 className="text-3xl font-black text-amber-900 mb-4 font-sans tracking-tight text-center">
                        🎰 Слоты
                    </h2>

                    {/* Coins Display */}
                    <div className="bg-amber-100 px-6 py-2 rounded-full mb-6 border border-amber-200">
                        <span className="text-amber-700 font-bold text-lg">💰 {coins} монет</span>
                    </div>

                    {/* Slot Machine */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-gradient-to-b from-amber-600 to-amber-800 rounded-3xl p-6 shadow-2xl border-4 border-amber-400 w-full max-w-sm"
                    >
                        {/* Reels */}
                        <div className="bg-black/40 rounded-2xl p-4 mb-4 shadow-inner border border-white/10">
                            <div className="flex justify-center gap-3">
                                {[0, 1, 2].map((i) => {
                                    const SymbolIcon = SYMBOLS[reels[i]].icon;
                                    return (
                                        <div key={i} className="w-20 h-24 bg-white rounded-xl flex items-center justify-center overflow-hidden border-4 border-gray-300 shadow-inner flex-shrink-0 relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 pointer-events-none"></div>
                                            <motion.div
                                                animate={spinning[i] ? { y: [0, -200, 0] } : { y: 0 }}
                                                transition={spinning[i]
                                                    ? { duration: 0.15, repeat: Infinity, ease: 'linear' }
                                                    : { type: 'spring', stiffness: 300, damping: 20 }
                                                }
                                                className="w-12 h-12"
                                            >
                                                {spinning[i] ? (
                                                    <div className="w-full h-full bg-gray-200 rounded-full blur-md animate-pulse"></div>
                                                ) : (
                                                    <SymbolIcon className={`w-full h-full drop-shadow-sm`} />
                                                )}
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Result */}
                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className={`text-center py-3 rounded-xl mb-4 shadow-lg border-2 border-white/20 ${result.type === 'jackpot' ? 'bg-yellow-400 text-yellow-900' :
                                        result.type === 'win' ? 'bg-green-500 text-white' :
                                            'bg-red-500/80 text-white'
                                        }`}
                                >
                                    {result.type === 'jackpot' && (
                                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                                            <p className="text-xl font-black">🎉 ДЖЕКПОТ! 🎉</p>
                                            <p className="text-2xl font-bold">+{result.win} 💰</p>
                                        </motion.div>
                                    )}
                                    {result.type === 'win' && (
                                        <div>
                                            <p className="text-lg font-bold">Выигрыш!</p>
                                            <p className="text-xl font-bold">+{result.win} 💰</p>
                                        </div>
                                    )}
                                    {result.type === 'lose' && (
                                        <p className="text-lg font-medium">Не повезло... 😢</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bet Controls */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    setBet(b => Math.max(5, b - 5));
                                    SoundManager.play('click');
                                }}
                                className="w-10 h-10 bg-white/20 rounded-full font-bold text-xl text-white hover:bg-white/30 transition-colors"
                            >
                                -
                            </motion.button>
                            <div className="bg-black/30 px-6 py-2 rounded-xl border border-white/10 min-w-[100px]">
                                <p className="text-xs text-gray-300 uppercase tracking-wide text-center">Ставка</p>
                                <p className="text-xl font-bold text-center text-white">{bet} 💰</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    setBet(b => Math.min(coins, b + 5));
                                    SoundManager.play('click');
                                }}
                                className="w-10 h-10 bg-white/20 rounded-full font-bold text-xl text-white hover:bg-white/30 transition-colors"
                            >
                                +
                            </motion.button>
                        </div>

                        {/* Spin Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={spin}
                            disabled={spinning.some(s => s) || coins < bet}
                            className={`w-full py-4 rounded-2xl font-black text-xl shadow-lg transition-all border-b-4 ${coins < bet
                                ? 'bg-gray-400 border-gray-600 text-gray-200 cursor-not-allowed'
                                : spinning.some(s => s)
                                    ? 'bg-amber-500 border-amber-700 text-white cursor-wait'
                                    : 'text-white hover:opacity-90 hover:scale-[1.02] border-transparent'
                                }`}
                            style={!(coins < bet || spinning.some(s => s)) ? { backgroundColor: 'var(--primary-color, #f59e0b)', boxShadow: '0 10px 25px -5px var(--primary-color)' } : {}}
                        >
                            {spinning.some(s => s) ? '🎰 Крутится...' : '🎰 КРУТИТЬ'}
                        </motion.button>
                    </motion.div>

                    {/* No coins */}
                    {coins < 5 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-red-500 mb-3">Монеты закончились! 😢</p>
                            <button
                                onClick={resetGame}
                                className="bg-yellow-500 text-yellow-900 px-6 py-2 rounded-xl font-bold shadow-lg"
                            >
                                🔄 Начать заново (100 монет)
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Shared Prize Drawer - Now below on Desktop too */}
                <div className="w-full md:max-w-2xl">
                    <PrizeDrawer
                        prizes={drawerPrizes}
                        colorClass="text-amber-600"
                        itemBgClass="bg-amber-50"
                        className="w-full"
                    />
                </div>
            </div>

            <ThemeCustomizer />
        </div>
    );
};

export default Slots;
