import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import SoundManager from '../utils/SoundManager';
import { IconDiceFace, IconSad } from './GameIcons';
import PrizeDrawer from './PrizeDrawer';
import ThemeCustomizer from './ThemeCustomizer';

const DiceGame = () => {
    const [rolling, setRolling] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [drawerPrizes, setDrawerPrizes] = useState([]);

    // targetRotation: [rotateX, rotateY]
    const [targetRotation, setTargetRotation] = useState({ x: -25, y: 25 });

    // Map dice values (1-6) to their final rotation angles (x, y)
    const faceRotations = {
        1: { x: 0, y: 0 },       // Front (Failure)
        6: { x: 0, y: 180 },     // Back
        3: { x: 0, y: -90 },     // Right
        4: { x: 0, y: 90 },      // Left
        2: { x: -90, y: 0 },     // Top
        5: { x: 90, y: 0 },      // Bottom
    };

    useEffect(() => {
        fetchPrizes();
    }, []);

    const fetchPrizes = async () => {
        try {
            // Fetch promotions to show what you CAN win
            const response = await api.get('/promotions');
            const data = response.data;

            // Add custom "Loss" item to display list
            const displayList = [...data];
            displayList.push({
                id: 'loss-item',
                title: 'Ничего',
                description: 'Шанс на неудачу',
                type: 'loss',
                icon: IconSad
            });

            setDrawerPrizes(displayList);
        } catch (err) {
            console.error("Failed to fetch prizes", err);
        }
    };

    const rollDice = async () => {
        if (rolling) return;
        setRolling(true);
        setResult(null);
        setError(null);

        // Start continuous spinning
        SoundManager.play('spin');

        // Simulate network/calc delay
        setTimeout(async () => {
            try {
                // Determine Win/Loss (30% chance to lose)
                let isWin = Math.random() > 0.3;
                let finalValue = 1; // Default to 1 (Failure face)
                let prizeData = null;

                if (isWin) {
                    // Fetch real prize
                    try {
                        const response = await api.get('/promotions/random');
                        prizeData = response.data;
                        // Random winning face (2-6)
                        finalValue = Math.floor(Math.random() * 5) + 2;
                    } catch (e) {
                        // Fallback if API fails
                        isWin = false;
                        finalValue = 1;
                    }
                } else {
                    // Loss
                    finalValue = 1; // 1 is Sad Face
                }

                const final = faceRotations[finalValue];

                // Animate to target
                setTargetRotation({
                    x: final.x + 360 * 4,
                    y: final.y + 360 * 4
                });

                // Stop spinning
                setRolling(false);
                SoundManager.play('click');

                // Show result
                setTimeout(() => {
                    if (isWin && prizeData) {
                        setResult({ type: 'win', ...prizeData });
                        SoundManager.play('win');
                    } else {
                        setResult({ type: 'loss' });
                        SoundManager.play('failure');
                    }
                }, 1500);

            } catch (err) {
                setError('Ошибка сети. Попробуйте еще раз.');
                setRolling(false);
                SoundManager.play('failure');
            }
        }, 1000);
    };

    return (
        <div className="bg-pink-50 min-h-[calc(100vh-64px)] md:min-h-screen md:py-20 md:px-4 flex flex-col items-center justify-center relative overflow-hidden h-full md:h-auto pb-[40vh] md:pb-0">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-10 left-1/2 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 md:opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header - Animated SHU Logo - Now Top of Page */}
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


                    {/* Dice Scene - Centered */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[150px] perspective-[1000px]">
                        <div className="scene w-[160px] h-[160px]">
                            <motion.div
                                className="cube"
                                animate={rolling ? {
                                    rotateX: [0, 360],
                                    rotateY: [0, 360]
                                } : {
                                    rotateX: targetRotation.x,
                                    rotateY: targetRotation.y
                                }}
                                transition={rolling ? {
                                    duration: 0.8,
                                    ease: "linear",
                                    repeat: Infinity
                                } : {
                                    duration: 1.5,
                                    ease: "easeOut"
                                }}
                            >
                                {/* Face 1: Sad/Loss */}
                                <div className="cube-face face-front bg-red-50 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] flex items-center justify-center p-2 border-4 border-red-100 rounded-2xl">
                                    <IconSad className="w-full h-full text-red-400 opacity-80" />
                                </div>
                                {/* Other Faces: Dice Dots (Winners) */}
                                {[6, 3, 4, 2, 5].map((val, i) => {
                                    const faces = ['face-back', 'face-right', 'face-left', 'face-top', 'face-bottom'];
                                    return (
                                        <div key={val} className={`cube-face ${faces[i]} bg-white shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] flex items-center justify-center p-1 border-4 border-purple-50 rounded-2xl`}>
                                            <IconDiceFace value={val} className="w-full h-full text-purple-600" />
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </div>
                    </div>

                    <div className="w-full font-sans max-w-sm">
                        <motion.button
                            whileHover={{ scale: 1.02, translateY: -2 }}
                            whileTap={{ scale: 0.98, translateY: 0 }}
                            onClick={rollDice}
                            disabled={rolling}
                            className={`
                                w-full py-5 rounded-2xl font-black text-white text-xl shadow-lg
                                transition-all transform tracking-wide uppercase flex items-center justify-center gap-2
                                ${rolling
                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                                    : 'hover:opacity-90 hover:scale-[1.02]'
                                }
                            `}
                            style={!rolling ? { backgroundColor: 'var(--primary-color, #8b5cf6)', boxShadow: '0 10px 25px -5px var(--primary-color)' } : {}}
                        >
                            {rolling ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Крутим...
                                </>
                            ) : 'БРОСИТЬ КУБИК'}
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
                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setResult(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50, rotateX: 20 }}
                            animate={{ scale: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`absolute top-0 left-0 w-full h-3 bg-gradient-to-r ${result.type === 'win' ? 'from-purple-500 to-pink-500' : 'from-gray-400 to-gray-600'}`}></div>

                            <div className="mb-6 flex justify-center">
                                <div className={`w-24 h-24 rounded-full p-1 shadow-inner flex items-center justify-center ${result.type === 'win' ? 'bg-purple-50' : 'bg-gray-100'}`}>
                                    {result.type === 'win' ? (
                                        result.image_url ? (
                                            <img src={result.image_url} alt="Win" className="w-full h-full rounded-full object-cover" />
                                        ) : <IconGift className="w-16 h-16 text-purple-500" />
                                    ) : (
                                        <IconSad className="w-16 h-16 text-gray-400 opacity-50" />
                                    )}
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                {result.type === 'win' ? 'Поздравляем! 🎉' : 'Упс! Пусто 😔'}
                            </h3>

                            {result.type === 'win' ? (
                                <>
                                    <p className="text-purple-600 font-bold text-lg mb-1">{result.title}</p>
                                    <p className="text-gray-500 text-sm mb-8">{result.description}</p>
                                </>
                            ) : (
                                <p className="text-gray-500 mb-8">
                                    Не расстраивайся, повезет в следующий раз!
                                </p>
                            )}

                            <button
                                onClick={() => setResult(null)}
                                className={`
                                    w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg
                                    ${result.type === 'win'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-purple-500/30'
                                        : 'bg-gray-800 hover:bg-gray-900'
                                    }
                                `}
                            >
                                {result.type === 'win' ? 'Забрать!' : 'Попробовать еще'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <ThemeCustomizer />
        </div>
    );
};

export default DiceGame;
