import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import SoundManager from '../utils/SoundManager';
import { IconGift, IconSad } from './GameIcons';
import PrizeDrawer from './PrizeDrawer';
import ThemeCustomizer from './ThemeCustomizer';

const ITEM_HEIGHT = 120; // Height of each prize item in pixels
const VISIBLE_ITEMS = 3; // How many items are visible at once

const WheelGame = () => {
    const [promotions, setPromotions] = useState([]);
    const [tape, setTape] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [displayPrizes, setDisplayPrizes] = useState([]);

    const controls = useAnimation();
    const tickInterval = useRef(null);

    useEffect(() => {
        fetchPromotions();
        return () => stopTicking();
    }, []);

    const fetchPromotions = async () => {
        try {
            const response = await api.get('/promotions');
            const data = response.data;
            if (data.length > 0) {
                const uniquePrizes = [...data];
                uniquePrizes.push({
                    id: 'loss-display',
                    title: 'Неудача',
                    description: 'Шанс на проигрыш',
                    type: 'loss',
                    icon: IconSad
                });
                setDisplayPrizes(uniquePrizes);

                const mixedItems = [];
                data.forEach((item, index) => {
                    mixedItems.push({ ...item, type: 'win' });
                    if ((index + 1) % 2 === 0) {
                        mixedItems.push({
                            id: `loss-${index}`,
                            title: 'Неудача',
                            description: 'Попробуйте еще раз',
                            type: 'loss',
                            icon: IconSad
                        });
                    }
                });

                if (!mixedItems.some(i => i.type === 'loss')) {
                    mixedItems.push({
                        id: 'loss-default',
                        title: 'Неудача',
                        description: 'В следующий раз повезет',
                        type: 'loss',
                        icon: IconSad
                    });
                }

                setPromotions(mixedItems);
                setTape(generateTape(mixedItems, 5));
            }
        } catch (err) {
            console.error("Failed to fetch promotions", err);
            setError("Не удалось загрузить призы. Попробуйте позже.");
        }
    };

    const generateTape = (items, repeats) => {
        let newTape = [];
        for (let i = 0; i < repeats; i++) {
            newTape = [...newTape, ...items];
        }
        return newTape;
    };

    const startTicking = () => {
        let count = 0;
        const maxTicks = 50;
        tickInterval.current = setInterval(() => {
            count++;
            if (count % 3 === 0) SoundManager.play('tick');
            if (count > maxTicks) stopTicking();
        }, 100);
    };

    const stopTicking = () => {
        if (tickInterval.current) {
            clearInterval(tickInterval.current);
            tickInterval.current = null;
        }
    };

    const spinWheel = async () => {
        if (spinning || promotions.length === 0) return;

        setSpinning(true);
        setResult(null);
        setError(null);
        SoundManager.play('spin');

        try {
            const isWin = Math.random() > 0.3;
            let targetItem;

            if (isWin) {
                const winItems = promotions.filter(p => p.type === 'win');
                if (winItems.length === 0) {
                    targetItem = promotions[0];
                } else {
                    const randomIndex = Math.floor(Math.random() * winItems.length);
                    targetItem = winItems[randomIndex];
                }
            } else {
                const lossItems = promotions.filter(p => p.type === 'loss');
                const randomIndex = Math.floor(Math.random() * lossItems.length);
                targetItem = lossItems[randomIndex];
            }

            const REPEATS_FOR_SPIN = 30;
            const winnerIndexInSet = promotions.findIndex(p => p.id === targetItem.id);

            const currentTapeLength = tape.length;
            const extension = generateTape(promotions, 50);
            const fullTape = [...tape, ...extension];
            setTape(fullTape);

            const targetIndex = currentTapeLength + (25 * promotions.length) + winnerIndexInSet;

            const offset = (VISIBLE_ITEMS * ITEM_HEIGHT / 2) - (ITEM_HEIGHT / 2);
            const targetY = - (targetIndex * ITEM_HEIGHT) + offset;

            startTicking();

            await controls.start({
                y: targetY,
                transition: {
                    duration: 5,
                    ease: [0.1, 0.8, 0.1, 1]
                }
            });

            stopTicking();
            SoundManager.play('click');

            setTimeout(() => {
                setResult(targetItem);
                setSpinning(false);
                if (targetItem.type === 'win') {
                    SoundManager.play('win');
                } else {
                    SoundManager.play('failure');
                }
            }, 500);

        } catch (err) {
            console.error(err);
            setError("Ошибка сети. Попробуйте еще раз!");
            setSpinning(false);
            SoundManager.play('failure');
        }
    };

    return (
        <div className="bg-indigo-50 min-h-[calc(100vh-64px)] md:min-h-screen md:py-20 md:px-4 flex flex-col items-center relative overflow-hidden h-full md:h-auto">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
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

            <div className="max-w-4xl w-full z-10 flex flex-col md:flex-row md:gap-8 items-stretch md:items-start justify-center h-full md:h-auto">

                {/* Game Area */}
                <div
                    className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8 bg-transparent md:bg-white/60 md:backdrop-blur-xl md:rounded-3xl md:shadow-2xl transition-all duration-300"
                    style={{ paddingBottom: '25vh' /* Always reserve space for collapsed drawer on mobile */ }}
                >
                    <div className="md:hidden h-0 w-0" style={{ marginBottom: 0 }}></div>

                    {/* Game Content Wrapper */}
                    <h2 className="text-3xl font-black text-indigo-900 mb-6 font-sans tracking-tight drop-shadow-sm text-center z-10 w-full">Колесо Фортуны</h2>
                    <div className="w-full flex flex-col items-center md:mb-0 mb-[25vh]">
                        {/* Header removed */}

                        {/* Slot Machine Container */}
                        <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[320px] mb-6"
                            style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT }}>

                            {/* Selection Frame (Center Overlay) - No Arrows */}
                            <div className="absolute top-1/2 left-0 w-full h-[120px] transform -translate-y-1/2 z-20 pointer-events-none border-y-4 border-indigo-500 bg-indigo-500/5 shadow-inner block">
                                {/* Pointers removed as requested */}
                            </div>

                            {/* Shadow Checkers */}
                            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none"></div>

                            {/* Moving Tape */}
                            <motion.div
                                className="w-full"
                                animate={controls}
                                initial={{ y: 0 }}
                            >
                                {tape.map((item, index) => {
                                    const isLoss = item.type === 'loss';
                                    return (
                                        <div
                                            key={`${item.id}-${index}`}
                                            className={`flex items-center justify-start px-6 border-b border-gray-100 ${isLoss ? 'bg-gray-50' : 'bg-white'}`}
                                            style={{ height: ITEM_HEIGHT }}
                                        >
                                            <div className={`w-16 h-16 rounded-full flex-shrink-0 p-1 mr-4 border overflow-hidden flex items-center justify-center ${isLoss ? 'bg-gray-200 border-gray-300' : 'bg-gray-50 border-gray-200'}`}>
                                                {item.type === 'loss' ? (
                                                    <IconSad className="w-10 h-10 text-gray-400" />
                                                ) : item.image_url ? (
                                                    <img src={item.image_url} alt="icon" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <IconGift className="w-10 h-10 text-purple-500" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <h3 className={`font-bold text-lg leading-tight ${isLoss ? 'text-gray-500' : 'text-gray-800'}`}>{item.title}</h3>
                                                <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </motion.div>
                        </div>

                        <div className="h-4 w-full flex justify-center items-center z-10 mb-2">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-red-500 font-medium bg-red-50 px-4 py-1 rounded-lg text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="w-full pb-0 font-sans">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={spinWheel}
                                disabled={spinning || promotions.length === 0}
                                className={`
                                    w-full py-4 rounded-2xl font-bold text-white shadow-xl
                                    transition-all transform z-10 text-lg uppercase tracking-wide md:max-w-xs mx-auto block
                                    ${spinning || promotions.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'hover:opacity-90 hover:scale-[1.02]'
                                    }
                                `}
                                style={!(spinning || promotions.length === 0) ? { backgroundColor: 'var(--primary-color, #6366f1)', boxShadow: '0 10px 25px -5px var(--primary-color)' } : {}}
                            >
                                {spinning ? 'Удачи!...' : 'Крутить! 🎰'}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Shared Prize Drawer */}
                <PrizeDrawer
                    prizes={displayPrizes}
                    colorClass="text-indigo-600"
                    itemBgClass="bg-indigo-50"
                    closedHeight="h-[25vh]"
                />
            </div>

            {/* Result Modal / Overlay */}
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
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`absolute top-0 left-0 w-full h-3 bg-gradient-to-r ${result.type === 'win' ? 'from-indigo-500 to-purple-500' : 'from-gray-400 to-gray-600'}`}></div>

                            <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${result.type === 'win' ? 'text-indigo-900' : 'text-gray-500'}`}>
                                {result.type === 'win' ? 'Ура! Вы выиграли!' : 'Не повезло...'}
                            </h3>

                            <div className={`w-24 h-24 mx-auto rounded-full p-1 shadow-inner mb-6 flex items-center justify-center ${result.type === 'win' ? 'bg-indigo-50' : 'bg-gray-100'}`}>
                                {result.type === 'loss' ? (
                                    <IconSad className="w-16 h-16 text-gray-400" />
                                ) : result.image_url ? (
                                    <img src={result.image_url} alt="Prize" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="p-4 w-full h-full">
                                        <IconGift className="w-full h-full" />
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">{result.title}</h2>
                            <p className="text-gray-500 mb-8">{result.description}</p>

                            <button
                                onClick={() => setResult(null)}
                                className={`
                                    w-full py-4 rounded-xl font-bold text-base transition-colors shadow-lg
                                    ${result.type === 'win'
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }
                                `}
                            >
                                {result.type === 'win' ? 'Отлично!' : 'Закрыть'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <ThemeCustomizer />
        </div >
    );
};

export default WheelGame;
