import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import PrizeDrawer from '../components/PrizeDrawer';
import ThemeCustomizer from '../components/ThemeCustomizer';
import {
    IconCoin, IconDiamond, IconGift, IconStar, IconClover, IconBomb, IconBasket, IconCoupon, IconJackpot
} from '../components/GameIcons';

const PrizeDrop = () => {
    const [gameState, setGameState] = useState('ready'); // ready, playing, result
    const [basket, setBasket] = useState({ x: 50 });
    const [fallingItems, setFallingItems] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [caughtPrize, setCaughtPrize] = useState(null);
    const gameAreaRef = useRef(null);
    const basketRef = useRef({ x: 50 }); // Track basket position for game loop

    const PRIZES = [
        { icon: IconCoin, points: 10, speed: 3, name: 'Монета', color: 'text-yellow-400' },
        { icon: IconDiamond, points: 50, speed: 2.5, name: 'Алмаз', color: 'text-blue-400' },
        { icon: IconGift, points: 30, speed: 2, name: 'Подарок', color: 'text-pink-400' },
        { icon: IconStar, points: 20, speed: 3.5, name: 'Звезда', color: 'text-yellow-300' },
        { icon: IconClover, points: 25, speed: 2.8, name: 'Удача', color: 'text-green-400' },
        { icon: IconBomb, points: -30, speed: 4, name: 'Бомба', color: 'text-gray-800' },
    ];

    const REWARDS = [
        { minScore: 0, title: 'Попробуй ещё', icon: IconStar, prize: null },
        { minScore: 100, title: 'Скидка 5%', icon: IconCoupon, prize: '5% скидка' },
        { minScore: 200, title: 'Скидка 10%', icon: IconCoupon, prize: '10% скидка' },
        { minScore: 300, title: 'Скидка 15%', icon: IconJackpot, prize: '15% скидка' },
        { minScore: 500, title: 'ДЖЕКПОТ!', icon: IconDiamond, prize: '25% скидка' },
    ];

    // Convert REWARDS to a format compatible with PrizeDrawer
    const drawerPrizes = REWARDS.filter(r => r.prize).map((r, i) => ({
        id: i,
        title: r.title,
        description: `От ${r.minScore} очков`,
        type: 'win'
    }));

    // Spawn items
    useEffect(() => {
        if (gameState !== 'playing') return;

        const spawnInterval = setInterval(() => {
            const prize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
            const newItem = {
                id: Date.now() + Math.random(),
                ...prize,
                x: Math.random() * 80 + 10,
                y: -10,
            };
            setFallingItems(prev => [...prev, newItem]);
        }, 800);

        return () => clearInterval(spawnInterval);
    }, [gameState]);

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        const gameLoop = setInterval(() => {
            setFallingItems(prev => {
                const updated = prev.map(item => ({
                    ...item,
                    y: item.y + item.speed
                })).filter(item => {
                    // Check collision with basket (use ref for current position)
                    if (item.y >= 80 && item.y <= 90) {
                        // Get basket position from ref to avoid stale closure
                        const currentBasketX = basketRef.current.x;
                        const basketLeft = currentBasketX - 10;
                        const basketRight = currentBasketX + 10;
                        if (item.x >= basketLeft && item.x <= basketRight) {
                            setScore(s => Math.max(0, s + item.points));
                            setCaughtPrize(item);

                            // Sound effect
                            if (item.points > 0) {
                                SoundManager.play('coin');
                            } else {
                                SoundManager.play('bomb');
                            }

                            setTimeout(() => setCaughtPrize(null), 300);
                            return false;
                        }
                    }
                    return item.y < 100;
                });
                return updated;
            });
        }, 50);

        return () => clearInterval(gameLoop);
    }, [gameState]); // Removed basket.x from dependencies

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('result');
                    SoundManager.play('win');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    // Touch/Mouse controls
    const handleMove = useCallback((clientX) => {
        if (gameState !== 'playing' || !gameAreaRef.current) return;
        const rect = gameAreaRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        const newX = Math.max(10, Math.min(90, x));
        setBasket({ x: newX });
        basketRef.current.x = newX; // Sync ref for game loop
    }, [gameState]);

    const handleTouchMove = (e) => {
        // Note: Don't call preventDefault() here as touch events are passive by default
        if (e.touches && e.touches[0]) {
            handleMove(e.touches[0].clientX);
        }
    };

    const getReward = () => {
        for (let i = REWARDS.length - 1; i >= 0; i--) {
            if (score >= REWARDS[i].minScore) return REWARDS[i];
        }
        return REWARDS[0];
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeLeft(30);
        setFallingItems([]);
        setBasket({ x: 50 });
        SoundManager.play('click');
    };

    const resetGame = () => {
        setGameState('ready');
        setScore(0);
        setTimeLeft(30);
        setFallingItems([]);
        SoundManager.play('click');
    };

    const RewardIcon = getReward().icon;

    return (
        <div className="bg-orange-50 min-h-[calc(100vh-64px)] md:min-h-screen md:py-20 md:px-4 flex flex-col items-center justify-center relative overflow-hidden h-full md:h-auto pb-[40vh] md:pb-0">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-10 left-1/2 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob animation-delay-4000"></div>
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
                    <h2 className="text-3xl font-black text-orange-900 mb-6 font-sans tracking-tight text-center">
                        Призопад
                    </h2>

                    {/* Ready Screen */}
                    {gameState === 'ready' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center text-center w-full"
                        >
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-8xl mb-6 text-amber-600 w-32 h-32"
                            >
                                <IconBasket className="w-full h-full" />
                            </motion.div>
                            <p className="text-orange-700/60 mb-8 max-w-xs">
                                Лови падающие призы корзиной! Избегай бомб.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98, translateY: 0 }}
                                onClick={() => window.location.href = '/game/drop/play'}
                                className="w-full py-5 rounded-2xl font-black text-white text-xl shadow-lg
                                    transition-all transform tracking-wide uppercase flex items-center justify-center gap-2
                                    hover:opacity-90 hover:scale-[1.02]"
                                style={{ backgroundColor: 'var(--primary-color, #f59e0b)', boxShadow: '0 10px 25px -5px var(--primary-color)' }}
                            >
                                🎮 ИГРАТЬ
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Game Area - Fullscreen Overlay */}
                    <AnimatePresence>
                        {gameState === 'playing' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50"
                            >
                                <div
                                    ref={gameAreaRef}
                                    className="relative w-full h-full bg-gradient-to-b from-orange-100 to-amber-200"
                                    onMouseMove={(e) => handleMove(e.clientX)}
                                    onTouchMove={handleTouchMove}
                                >
                                    {/* Score and Timer - Fixed Top */}
                                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between text-xl font-bold z-10 bg-gradient-to-b from-black/20 to-transparent">
                                        <span className="text-yellow-600 bg-white/80 px-4 py-2 rounded-full">💰 {score}</span>
                                        <span className="text-red-500 bg-white/80 px-4 py-2 rounded-full">⏱️ {timeLeft}s</span>
                                    </div>

                                    {/* Falling Items */}
                                    {fallingItems.map(item => {
                                        const Icon = item.icon;
                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`absolute w-12 h-12 ${item.color}`}
                                                style={{
                                                    left: `${item.x}%`,
                                                    top: `${item.y}%`,
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            >
                                                <Icon className="w-full h-full drop-shadow-lg" />
                                            </motion.div>
                                        );
                                    })}

                                    {/* Basket */}
                                    <motion.div
                                        className="fixed w-20 h-20 text-amber-600 z-30"
                                        style={{
                                            left: `${basket.x}%`,
                                            bottom: '80px',
                                            transform: 'translateX(-50%)'
                                        }}
                                    >
                                        <IconBasket className="w-full h-full drop-shadow-xl" />
                                    </motion.div>

                                    {/* Caught Prize Effect */}
                                    <AnimatePresence>
                                        {caughtPrize && (
                                            <motion.div
                                                initial={{ opacity: 1, y: 0, scale: 1 }}
                                                animate={{ opacity: 0, y: -50, scale: 1.5 }}
                                                exit={{ opacity: 0 }}
                                                className={`fixed bottom-32 left-1/2 -translate-x-1/2 font-black text-4xl z-20 ${caughtPrize.points > 0 ? 'text-green-500' : 'text-red-500'}`}
                                            >
                                                {caughtPrize.points > 0 ? `+${caughtPrize.points}` : caughtPrize.points}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Controls hint */}
                                    <p className="absolute bottom-4 left-0 right-0 text-center text-orange-600 text-sm font-medium">
                                        👆 Двигай пальцем или мышкой
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Result Screen */}
                    {gameState === 'result' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center w-full"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: 3 }}
                                className="w-24 h-24 mb-4 text-orange-600"
                            >
                                <RewardIcon className="w-full h-full" />
                            </motion.div>
                            <h3 className="text-2xl font-bold mb-2 text-gray-800">{getReward().title}</h3>
                            <p className="text-4xl font-black text-yellow-500 mb-6">{score} очков</p>

                            {getReward().prize && (
                                <div className="bg-orange-50 rounded-2xl px-6 py-4 mb-6 border border-orange-200">
                                    <p className="text-lg text-gray-600">Ваш приз: <span className="font-bold text-orange-600">{getReward().prize}</span></p>
                                </div>
                            )}

                            <div className="flex gap-3 w-full">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startGame}
                                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-4 rounded-xl font-bold shadow-lg"
                                >
                                    🔄 Ещё раз
                                </motion.button>
                                <Link to="/" className="flex-1 bg-gray-100 text-gray-600 px-4 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center">
                                    🏠 Меню
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Shared Prize Drawer - Now below on Desktop too */}
                <div className="w-full md:max-w-2xl">
                    <PrizeDrawer
                        prizes={drawerPrizes}
                        colorClass="text-orange-600"
                        itemBgClass="bg-orange-50"
                        className="w-full"
                    />
                </div>
            </div>

            <div className="w-full flex justify-center">
                <ThemeCustomizer />
            </div>
        </div>
    );
};

export default PrizeDrop;
