import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import {
    IconCoin, IconDiamond, IconGift, IconStar, IconClover, IconBomb, IconBasket, IconCoupon, IconJackpot
} from '../components/GameIcons';

const PrizeDropPlay = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('playing');
    const [basket, setBasket] = useState({ x: 50 });
    const [fallingItems, setFallingItems] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [caughtPrize, setCaughtPrize] = useState(null);
    const gameAreaRef = useRef(null);
    const basketRef = useRef({ x: 50 });

    const PRIZES = [
        { icon: IconCoin, points: 10, speed: 1.5, name: 'Монета', color: 'text-yellow-400' },
        { icon: IconDiamond, points: 50, speed: 1.2, name: 'Алмаз', color: 'text-blue-400' },
        { icon: IconGift, points: 30, speed: 1, name: 'Подарок', color: 'text-pink-400' },
        { icon: IconStar, points: 20, speed: 1.8, name: 'Звезда', color: 'text-yellow-300' },
        { icon: IconClover, points: 25, speed: 1.4, name: 'Удача', color: 'text-green-400' },
        { icon: IconBomb, points: -30, speed: 2, name: 'Бомба', color: 'text-gray-800' },
    ];

    const REWARDS = [
        { minScore: 0, title: 'Попробуй ещё', icon: IconStar, prize: null },
        { minScore: 100, title: 'Скидка 5%', icon: IconCoupon, prize: '5% скидка' },
        { minScore: 200, title: 'Скидка 10%', icon: IconCoupon, prize: '10% скидка' },
        { minScore: 300, title: 'Скидка 15%', icon: IconJackpot, prize: '15% скидка' },
        { minScore: 500, title: 'ДЖЕКПОТ!', icon: IconDiamond, prize: '25% скидка' },
    ];

    const getReward = () => {
        for (let i = REWARDS.length - 1; i >= 0; i--) {
            if (score >= REWARDS[i].minScore) return REWARDS[i];
        }
        return REWARDS[0];
    };

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
                    if (item.y >= 80 && item.y <= 90) {
                        const currentBasketX = basketRef.current.x;
                        const basketLeft = currentBasketX - 10;
                        const basketRight = currentBasketX + 10;
                        if (item.x >= basketLeft && item.x <= basketRight) {
                            setScore(s => Math.max(0, s + item.points));
                            setCaughtPrize(item);

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
    }, [gameState]);

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameState('result');
                    SoundManager.play('win');
                    return 0;
                }
                return t - 1;
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
        basketRef.current.x = newX;
    }, [gameState]);

    const handleTouchMove = (e) => {
        if (e.touches && e.touches[0]) {
            handleMove(e.touches[0].clientX);
        }
    };

    const RewardIcon = getReward().icon;

    return (
        <div
            ref={gameAreaRef}
            className="fixed inset-0 bg-gradient-to-b from-orange-100 to-amber-200 touch-none select-none"
            onMouseMove={(e) => handleMove(e.clientX)}
            onTouchMove={handleTouchMove}
        >
            {/* Playing State */}
            {gameState === 'playing' && (
                <>
                    {/* Score and Timer */}
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
                                className={`absolute w-12 h-12 ${item.color} transition-all duration-75 ease-linear`}
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
                </>
            )}

            {/* Result Screen */}
            {gameState === 'result' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-orange-100 to-amber-200"
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-32 h-32 mb-6 text-amber-500"
                    >
                        <RewardIcon className="w-full h-full" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-orange-800 mb-2">{getReward().title}</h2>
                    <p className="text-2xl font-bold text-orange-600 mb-2">Очков: {score}</p>
                    {getReward().prize && (
                        <p className="text-xl text-green-600 font-bold mb-8 bg-green-100 px-4 py-2 rounded-full">
                            🎁 {getReward().prize}
                        </p>
                    )}

                    <div className="flex gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setGameState('playing');
                                setScore(0);
                                setTimeLeft(30);
                                setFallingItems([]);
                                setBasket({ x: 50 });
                                basketRef.current.x = 50;
                            }}
                            className="px-8 py-4 rounded-2xl font-black text-white text-lg shadow-lg hover:opacity-90"
                            style={{ backgroundColor: 'var(--primary-color, #f59e0b)' }}
                        >
                            🔄 Ещё раз
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/game/drop')}
                            className="px-8 py-4 rounded-2xl font-black text-orange-700 text-lg bg-white shadow-lg hover:bg-gray-50"
                        >
                            ← Назад
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default PrizeDropPlay;
