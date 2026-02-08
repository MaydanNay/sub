import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import PrizeDrawer from '../components/PrizeDrawer';
import ThemeCustomizer from '../components/ThemeCustomizer';
import {
    IconCoupon, IconTruck, IconGift, IconCoin, IconJackpot, IconStar, IconSad
} from '../components/GameIcons';

const ScratchCard = () => {
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

    // Convert PRIZES to a format compatible with PrizeDrawer
    const drawerPrizes = PRIZES.map(p => ({
        id: p.id,
        title: p.title,
        description: `Шанс: ${Math.round(p.probability * 100)}% `,
        type: 'win'
    }));

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

        // Sound throttling (play every 100ms max while scratching)
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
        <div className="bg-purple-50 min-h-[calc(100vh-64px)] md:min-h-screen md:py-20 md:px-4 flex flex-col items-center justify-center relative overflow-hidden h-full md:h-auto pb-[40vh] md:pb-0">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-10 left-1/2 w-48 h-48 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob animation-delay-4000"></div>
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
                    <h2 className="text-3xl font-black text-purple-900 mb-6 font-sans tracking-tight text-center">
                        Скретч-карта
                    </h2>

                    {/* Scratch Card */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-full aspect-[3/2] max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Prize layer (underneath) */}
                        <div className={`absolute inset - 0 bg - gradient - to - br ${prize?.color || 'from-gray-400 to-gray-600'} flex flex - col items - center justify - center`}>
                            <motion.div
                                animate={revealed ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                                transition={{ duration: 0.5, repeat: revealed ? Infinity : 0, repeatDelay: 1 }}
                                className="w-24 h-24 mb-4 text-white drop-shadow-lg"
                            >
                                <PrizeIcon className="w-full h-full" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-center px-4 text-white shadow-black/20 drop-shadow-md">{prize?.title}</h2>
                        </div>

                        {/* Scratch canvas (on top) */}
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
                    <div className="w-full max-w-sm mt-6">
                        <div className="flex justify-between text-sm text-purple-600 font-medium mb-1">
                            <span>Прогресс</span>
                            <span>{Math.round(scratchPercent)}%</span>
                        </div>
                        <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ width: `${scratchPercent}% ` }}
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                            />
                        </div>
                    </div>

                    {/* New Card Button */}
                    <div className="w-full font-sans mt-6 max-w-sm">
                        <motion.button
                            whileHover={{ scale: 1.02, translateY: -2 }}
                            whileTap={{ scale: 0.98, translateY: 0 }}
                            onClick={resetGame}
                            className="w-full py-5 rounded-2xl font-black text-white text-xl shadow-lg
                                transition-all transform tracking-wide uppercase flex items-center justify-center gap-2
                                hover:opacity-90 hover:scale-[1.02]"
                            style={{ backgroundColor: 'var(--primary-color, #8b5cf6)', boxShadow: '0 10px 25px -5px var(--primary-color)' }}
                        >
                            🎫 НОВАЯ КАРТА
                        </motion.button>
                    </div>
                </div>

                {/* Shared Prize Drawer - Now below on Desktop too */}
                <div className="w-full md:max-w-2xl">
                    <PrizeDrawer
                        prizes={drawerPrizes}
                        colorClass="text-purple-600"
                        itemBgClass="bg-purple-50"
                        className="w-full"
                    />
                </div>
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
                            initial={{ scale: 0.8, y: 50, rotateX: 20 }}
                            animate={{ scale: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                            <div className="mb-6 flex justify-center">
                                <div className="w-24 h-24 rounded-full p-1 shadow-inner flex items-center justify-center bg-purple-50">
                                    <PrizeIcon className="w-16 h-16 text-purple-500" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                Поздравляем! 🎉
                            </h3>

                            <p className="text-purple-600 font-bold text-lg mb-1">{prize?.title}</p>
                            <p className="text-gray-500 text-sm mb-8">Вы выиграли этот приз!</p>

                            <button
                                onClick={resetGame}
                                className="w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg
                                    bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-purple-500/30"
                            >
                                🎫 Еще карту!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full flex justify-center">
                <ThemeCustomizer />
            </div>
        </div>
    );
};

export default ScratchCard;
