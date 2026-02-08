import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import SoundManager from '../utils/SoundManager';
import { IconGift, IconSad } from './GameIcons';
import PrizeDrawer from './PrizeDrawer';

const ScratchCard = () => {
    const [prizes, setPrizes] = useState([]);
    const [drawerPrizes, setDrawerPrizes] = useState([]);
    const [scratching, setScratching] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [revealedCount, setRevealedCount] = useState(0);

    const [cards, setCards] = useState(Array(9).fill(null));
    const [scratchedIndices, setScratchedIndices] = useState([]);

    useEffect(() => {
        fetchPrizes();
        initializeGame();
    }, []);

    const fetchPrizes = async () => {
        try {
            const response = await api.get('/promotions');
            const data = response.data;
            const displayList = [...data];
            displayList.push({
                id: 'loss-item',
                title: 'Ничего',
                description: 'Шанс на неудачу',
                type: 'loss',
                icon: IconSad
            });
            setDrawerPrizes(displayList);
            setPrizes(data);
        } catch (err) {
            console.error("Failed to fetch prizes", err);
        }
    };

    const initializeGame = () => {
        setResult(null);
        setScratchedIndices([]);
        setRevealedCount(0);
        setError(null);

        // Initial "Covered" state is handled by rendering Logic
        // We will generate the outcome only after user starts scratching (or pre-generate)
        // For security, usually pre-generate on server. Here we simulate.
    };

    const startGame = async () => {
        if (scratching) return;
        setScratching(true);
        initializeGame();

        // Determine outcome
        // 30% loss
        const isWin = Math.random() > 0.3;
        let outcomeCards = [];
        let winPrize = null;

        if (isWin && prizes.length > 0) {
            // Win: 3 matching symbols
            winPrize = prizes[Math.floor(Math.random() * prizes.length)];
            // Fill 3 spots with this prize
            outcomeCards = [winPrize, winPrize, winPrize];
            // Fill remaining 6 with random distinct prizes (or loose items)
            for (let i = 0; i < 6; i++) {
                const random = prizes[Math.floor(Math.random() * prizes.length)];
                // Ensure we don't accidentally create another set of 3 winning cards if we can help it, 
                // but for simple logic we just push random. 
                // To be safer, maybe push "Loss" items sometimes.
                outcomeCards.push(Math.random() > 0.5 ? random : { type: 'loss' });
            }
        } else {
            // Loss: No 3 matching symbols
            // We can facilitate this by ensuring mostly diverse items or 3 "Loss" items
            // Let's go with 3 "Sad Faces" = Loss to be clear? 
            // Or just "Not 3 matching prizes".
            // User requested "Failure" state. 
            // Common scratch mechanic: Find 3 matching to win. 
            // If we find 3 matching "Sad Faces", is that a win or loss? Usually loss.
            // Let's fill with random stuff ensuring no 3 match.
            outcomeCards = [];
            // Actually, simplest Loss visualization is "3 Sad Faces".
            const lossItem = { type: 'loss' };
            outcomeCards = [lossItem, lossItem, lossItem];
            for (let i = 0; i < 6; i++) {
                const random = prizes.length > 0 ? prizes[Math.floor(Math.random() * prizes.length)] : { type: 'loss' };
                outcomeCards.push(random);
            }
            winPrize = null; // explicit loss
        }

        // Shuffle
        outcomeCards = outcomeCards.sort(() => Math.random() - 0.5);
        setCards(outcomeCards);
    };

    const handleScratch = (index) => {
        if (!scratching || scratchedIndices.includes(index)) return;

        SoundManager.play('scratch'); // Need to ensure this sound exists or map to 'click'
        const newIndices = [...scratchedIndices, index];
        setScratchedIndices(newIndices);

        if (newIndices.length === 9) { // Or some logic to end game?
            // Usually scratch all.
            finishGame();
        }

        // If we want auto-completion logic:
        // Check if 3 matching found?
    };

    const finishGame = () => {
        setScratching(false);
        // Calculate result based on Revealed Cards
        // We know the result from generation, but let's derive it to be consistent
        // Count occurrences
        const counts = {};
        cards.forEach(c => {
            const id = c.id || 'loss';
            counts[id] = (counts[id] || 0) + 1;
        });

        const winnerId = Object.keys(counts).find(id => counts[id] >= 3);

        if (winnerId && winnerId !== 'loss') {
            const prize = cards.find(c => c.id === winnerId);
            setResult({ type: 'win', ...prize });
            SoundManager.play('win');
        } else {
            setResult({ type: 'loss' });
            SoundManager.play('failure');
        }
    };

    return (
        <div className="bg-blue-50 min-h-[calc(100vh-64px)] md:min-h-screen md:py-20 md:px-4 flex flex-col items-center relative overflow-hidden h-full md:h-auto">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-20 right-10 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            </div>

            <div className="max-w-4xl w-full z-10 flex flex-col md:flex-row md:gap-8 items-stretch md:items-start justify-center h-full md:h-auto">
                <div className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8 bg-transparent md:bg-white/60 md:backdrop-blur-xl md:rounded-3xl md:shadow-2xl transition-all duration-300"
                    style={{ paddingBottom: '35vh' }}
                >
                    <div className="w-full flex flex-col items-center md:mb-0 mb-[35vh]">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-extrabold text-blue-900 mb-1">Скретч-карта</h2>
                            <p className="text-blue-600/80">Собери 3 одинаковых символа!</p>
                        </div>

                        {/* Card Grid */}
                        <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl shadow-xl w-full max-w-[320px]">
                            {cards.map((card, idx) => {
                                const isRevealed = scratchedIndices.includes(idx);
                                return (
                                    <motion.div
                                        key={idx}
                                        whileHover={!isRevealed && scratching ? { scale: 1.05 } : {}}
                                        whileTap={!isRevealed && scratching ? { scale: 0.95 } : {}}
                                        onClick={() => scratching ? handleScratch(idx) : null}
                                        className={`
                                            aspect-square rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative
                                            ${isRevealed ? 'bg-blue-50' : 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-inner'}
                                        `}
                                    >
                                        {/* Content (Hidden or Shown) */}
                                        <div className={`w-full h-full p-2 flex items-center justify-center transition-opacity duration-300 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                                            {card && (
                                                card.type === 'loss' ?
                                                    <IconSad className="w-full h-full text-gray-300" /> :
                                                    (card.image_url ? <img src={card.image_url} alt="" className="w-full h-full object-contain" /> : <IconGift className="w-full h-full text-indigo-500" />)
                                            )}
                                        </div>

                                        {/* Scratch Layer Overlay */}
                                        {!isRevealed && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-white/50 text-2xl font-bold">?</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="mt-8 w-full max-w-xs">
                            {!scratching && (
                                <button
                                    onClick={startGame}
                                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-500/30 transition-all text-xl"
                                >
                                    Играть
                                </button>
                            )}
                            {scratching && scratchedIndices.length < 9 && (
                                <p className="text-center text-gray-500 animate-pulse">Стирай защитный слой!</p>
                            )}
                            {scratching && scratchedIndices.length === 9 && (
                                <button
                                    onClick={finishGame}
                                    className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-green-500/30 transition-all text-xl"
                                >
                                    Проверить
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <PrizeDrawer prizes={drawerPrizes} colorClass="text-blue-600" itemBgClass="bg-blue-50" />
            </div>

            {/* Result Modal */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => { setResult(null); setScratching(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                {result.type === 'win' ? 'Нашел!' : 'Не повезло'}
                            </h3>
                            {result.type === 'win' ? (
                                <p className="text-blue-600 mb-6">Ты собрал 3 одинаковых приза!</p>
                            ) : (
                                <p className="text-gray-500 mb-6">Попробуй еще раз</p>
                            )}
                            <button
                                onClick={() => { setResult(null); setScratching(false); }}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold"
                            >
                                Закрыть
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScratchCard;
