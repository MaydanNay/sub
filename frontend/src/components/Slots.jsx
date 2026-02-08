import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import SoundManager from '../utils/SoundManager';
import { IconGift, IconSad } from './GameIcons';
import PrizeDrawer from './PrizeDrawer';

const Slots = () => {
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [drawerPrizes, setDrawerPrizes] = useState([]);

    // Slots State: 3 reels
    const [reels, setReels] = useState(['🍎', '🍋', '🍒']);

    const symbols = ['🍎', '🍋', '🍒', '🍇', '💎', '7️⃣'];

    useEffect(() => {
        fetchPrizes();
    }, []);

    const fetchPrizes = async () => {
        try {
            const response = await api.get('/promotions');
            const data = response.data;
            const displayList = [...data];
            displayList.push({
                id: 'loss-item',
                title: 'Ничего',
                description: 'Попробуй еще раз',
                type: 'loss',
                icon: IconSad
            });
            setDrawerPrizes(displayList);
        } catch (err) {
            console.error("Failed to fetch prizes", err);
        }
    };

    const spinSlots = () => {
        if (spinning) return;
        setSpinning(true);
        setResult(null);
        SoundManager.play('spin');

        // Animation Simulation
        const interval = setInterval(() => {
            setReels([
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ]);
        }, 100);

        setTimeout(async () => {
            clearInterval(interval);

            const isWin = Math.random() > 0.7; // Harder to win slots
            let finalReels = [];

            if (isWin) {
                const sym = symbols[Math.floor(Math.random() * symbols.length)];
                finalReels = [sym, sym, sym];
                SoundManager.play('win');
                try {
                    const response = await api.get('/promotions/random');
                    setResult({ type: 'win', ...response.data });
                } catch (e) {
                    setResult({ type: 'win', title: 'Джекпот!', description: 'Вы собрали 3 в ряд!' });
                }
            } else {
                // Ensure no match
                finalReels = [
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)]
                ];
                // Simple check to avoid accidental win
                if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
                    finalReels[2] = symbols[(symbols.indexOf(finalReels[2]) + 1) % symbols.length];
                }
                SoundManager.play('failure');
                setResult({ type: 'loss' });
            }

            setReels(finalReels);
            setSpinning(false);

        }, 2000);
    };

    return (
        <div className="bg-yellow-50 min-h-[calc(100vh-64px)] md:min-h-screen md:py-20 md:px-4 flex flex-col items-center relative overflow-hidden h-full md:h-auto">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-10 left-10 w-56 h-56 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            </div>

            <div className="max-w-4xl w-full z-10 flex flex-col md:flex-row md:gap-8 items-stretch md:items-start justify-center h-full md:h-auto">
                <div className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8 bg-transparent md:bg-white/60 md:backdrop-blur-xl md:rounded-3xl md:shadow-2xl transition-all duration-300"
                    style={{ paddingBottom: '35vh' }}
                >
                    <div className="w-full flex flex-col items-center md:mb-0 mb-[35vh]">
                        <h2 className="text-3xl font-extrabold text-orange-900 mb-8 font-sans">Слоты</h2>

                        {/* Slot Machine Visual */}
                        <div className="bg-gray-800 p-6 rounded-3xl shadow-2xl border-4 border-yellow-500 w-full max-w-[320px] mb-8 relative">
                            {/* Reels Container */}
                            <div className="flex justify-between gap-2 bg-white rounded-xl p-4 h-32 items-center overflow-hidden">
                                {reels.map((symbol, i) => (
                                    <div key={i} className="flex-1 h-full flex items-center justify-center bg-gray-100 rounded-lg text-4xl shadow-inner border border-gray-200">
                                        {symbol}
                                    </div>
                                ))}
                            </div>
                            {/* Decorative Shine */}
                            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl pointer-events-none"></div>
                        </div>

                        <button
                            onClick={spinSlots}
                            disabled={spinning}
                            className={`w-full max-w-xs py-5 rounded-full font-bold text-white text-xl shadow-xl transition-all border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1
                                ${spinning ? 'bg-gray-500 border-gray-700' : 'bg-yellow-500 hover:bg-yellow-400 shadow-yellow-500/30'}
                            `}
                        >
                            {spinning ? 'Крутим...' : 'Вращать!'}
                        </button>
                    </div>
                </div>

                <PrizeDrawer prizes={drawerPrizes} colorClass="text-orange-600" itemBgClass="bg-orange-50" />
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
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scaling: 0.8, opacity: 0 }}
                            className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                {result.type === 'win' ? 'ДЖЕКПОТ! 🎰' : 'Не повезло'}
                            </h3>
                            {result.type === 'win' ? (
                                <p className="text-orange-600 mb-6 font-bold">{result.title}</p>
                            ) : (
                                <p className="text-gray-500 mb-6">Попробуйте еще раз.</p>
                            )}
                            <button
                                onClick={() => setResult(null)}
                                className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600"
                            >
                                OK
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Slots;
