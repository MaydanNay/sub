import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import {
    IconCoupon, IconTruck, IconGift, IconCoin, IconJackpot, IconStar
} from '../components/GameIcons';

const ScratchCardPlay = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [isScratching, setIsScratching] = useState(false);
    const [scratchPercent, setScratchPercent] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [prize, setPrize] = useState(null);
    const lastSoundTime = useRef(0);

    const PRIZES = [
        { id: 1, title: 'Скидка 10%', icon: IconCoupon, color: 'from-blue-400 to-blue-600', probability: 0.3 },
        { id: 2, title: 'Скидка 20%', icon: IconStar, color: 'from-green-400 to-green-600', probability: 0.2 },
        { id: 3, title: 'Бесплатная доставка', icon: IconTruck, color: 'from-purple-400 to-purple-600', probability: 0.25 },
        { id: 4, title: 'Подарок', icon: IconGift, color: 'from-pink-400 to-pink-600', probability: 0.15 },
        { id: 5, title: 'Купон 500₽', icon: IconCoin, color: 'from-yellow-400 to-amber-600', probability: 0.08 },
        { id: 6, title: 'ДЖЕКПОТ!', icon: IconJackpot, color: 'from-amber-400 to-red-600', probability: 0.02 },
    ];

    useEffect(() => {
        generatePrize();
        initCanvas();
    }, []);

    const generatePrize = () => {
        const rand = Math.random();
        let cumulative = 0;
        for (const p of PRIZES) {
            cumulative += p.probability;
            if (rand <= cumulative) {
                setPrize(p);
                return;
            }
        }
        setPrize(PRIZES[0]);
    };

    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Create scratch layer gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.5, '#8b5cf6');
        gradient.addColorStop(1, '#a855f7');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add pattern
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (let i = 0; i < canvas.width; i += 20) {
            for (let j = 0; j < canvas.height; j += 20) {
                if ((i + j) % 40 === 0) {
                    ctx.fillRect(i, j, 10, 10);
                }
            }
        }

        // Add text
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('СОТРИ ЗДЕСЬ ✨', canvas.width / 2, canvas.height / 2);
    };

    const scratch = (e) => {
        if (!isScratching || revealed) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        let x, y;
        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Sound throttling
        const now = Date.now();
        if (now - lastSoundTime.current > 100) {
            SoundManager.play('scratch');
            lastSoundTime.current = now;
        }

        calculateScratchPercent();
    };

    const calculateScratchPercent = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        let transparent = 0;
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparent++;
        }

        const percent = (transparent / (pixels.length / 4)) * 100;
        setScratchPercent(percent);

        if (percent > 50 && !revealed) {
            setRevealed(true);
            SoundManager.play('win');
        }
    };

    const resetGame = () => {
        setRevealed(false);
        setScratchPercent(0);
        generatePrize();
        setTimeout(() => initCanvas(), 100);
        SoundManager.play('click');
    };

    const PrizeIcon = prize?.icon || IconGift;

    return (
        <div className="bg-purple-50 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-10 left-1/2 w-48 h-48 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => navigate('/game/scratch')}
                    className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-xl text-purple-900 font-bold hover:bg-white/80 transition-all"
                >
                    ← Назад
                </button>
            </div>

            {/* Game Area */}
            <div className="flex flex-col items-center justify-center z-10 w-full max-w-md px-4">
                <h2 className="text-3xl font-black text-purple-900 mb-8 font-sans tracking-tight text-center">
                    Скретч-карта
                </h2>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-full aspect-[3/2] rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Prize layer */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${prize?.color || 'from-gray-400 to-gray-600'} flex flex-col items-center justify-center`}>
                        <motion.div
                            animate={revealed ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                            transition={{ duration: 0.5, repeat: revealed ? Infinity : 0, repeatDelay: 1 }}
                            className="w-24 h-24 mb-4 text-white drop-shadow-lg"
                        >
                            <PrizeIcon className="w-full h-full" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-center px-4 text-white shadow-black/20 drop-shadow-md">{prize?.title}</h2>
                    </div>

                    {/* Scratch canvas */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full cursor-pointer touch-none"
                        onMouseDown={() => setIsScratching(true)}
                        onMouseUp={() => setIsScratching(false)}
                        onMouseLeave={() => setIsScratching(false)}
                        onMouseMove={scratch}
                        onTouchStart={() => setIsScratching(true)}
                        onTouchEnd={() => setIsScratching(false)}
                        onTouchMove={scratch}
                    />

                    {/* Border */}
                    <div className="absolute inset-0 border-4 border-white/30 rounded-3xl pointer-events-none" />
                </motion.div>

                {/* Progress */}
                <div className="w-full mt-8">
                    <div className="flex justify-between text-sm text-purple-600 font-medium mb-1">
                        <span>Прогресс</span>
                        <span>{Math.round(scratchPercent)}%</span>
                    </div>
                    <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ width: `${scratchPercent}%` }}
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                        />
                    </div>
                </div>

                {/* New Card Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetGame}
                    className="w-full py-4 mt-8 rounded-2xl font-black text-white text-xl shadow-lg
                        transition-all bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                    🎫 НОВАЯ КАРТА
                </motion.button>
            </div>

            {/* Result Modal */}
            <AnimatePresence>
                {revealed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setRevealed(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Поздравляем! 🎉</h3>
                            <p className="text-purple-600 font-bold text-lg mb-6">{prize?.title}</p>
                            <button
                                onClick={resetGame}
                                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-600"
                            >
                                🎫 Еще карту!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScratchCardPlay;
