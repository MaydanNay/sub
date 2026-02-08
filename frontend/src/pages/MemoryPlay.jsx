import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MemoryPlay = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameState, setGameState] = useState('playing'); // playing, won
    const [timer, setTimer] = useState(0);
    const [difficulty, setDifficulty] = useState('easy'); // easy(6), medium(8), hard(12)

    const EMOJIS = ['🎁', '💎', '🌟', '🎯', '🍀', '💰', '🎲', '🏆', '❤️', '🔥', '⚡', '🌈'];

    const DIFFICULTIES = {
        easy: { pairs: 6, cols: 3, name: 'Легко' },
        medium: { pairs: 8, cols: 4, name: 'Средне' },
        hard: { pairs: 12, cols: 4, name: 'Сложно' }
    };

    const REWARDS = [
        { maxMoves: 10, title: 'Мастер памяти!', emoji: '🧠', prize: 'Скидка 20%' },
        { maxMoves: 15, title: 'Отлично!', emoji: '⭐', prize: 'Скидка 15%' },
        { maxMoves: 20, title: 'Хорошо!', emoji: '👍', prize: 'Скидка 10%' },
        { maxMoves: 30, title: 'Неплохо!', emoji: '🎯', prize: 'Скидка 5%' },
        { maxMoves: Infinity, title: 'Попробуй ещё!', emoji: '💪', prize: null }
    ];

    useEffect(() => {
        if (gameState === 'playing') {
            const interval = setInterval(() => setTimer(t => t + 1), 1000);
            return () => clearInterval(interval);
        }
    }, [gameState]);

    useEffect(() => {
        initGame();
    }, []);

    const initGame = () => {
        const { pairs } = DIFFICULTIES[difficulty];
        const selectedEmojis = EMOJIS.slice(0, pairs);
        const cardPairs = [...selectedEmojis, ...selectedEmojis];

        const shuffled = cardPairs
            .map((emoji, i) => ({ id: i, emoji, isFlipped: false }))
            .sort(() => Math.random() - 0.5);

        setCards(shuffled);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setTimer(0);
        setGameState('playing');
    };

    const handleCardClick = (id) => {
        if (gameState !== 'playing') return;
        if (flipped.length === 2) return;
        if (flipped.includes(id)) return;
        if (matched.includes(id)) return;

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);

            const [first, second] = newFlipped;
            const firstCard = cards.find(c => c.id === first);
            const secondCard = cards.find(c => c.id === second);

            if (firstCard.emoji === secondCard.emoji) {
                setTimeout(() => {
                    setMatched(prev => [...prev, first, second]);
                    setFlipped([]);
                    if (matched.length + 2 === cards.length) {
                        setGameState('won');
                    }
                }, 500);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    const getReward = () => {
        const baseMoves = DIFFICULTIES[difficulty].pairs;
        const adjustedMoves = moves / (baseMoves / 6);
        return REWARDS.find(r => adjustedMoves <= r.maxMoves) || REWARDS[REWARDS.length - 1];
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const { cols } = DIFFICULTIES[difficulty];

    return (
        <div className="min-h-screen bg-[#0f1115] text-white overflow-x-hidden relative flex flex-col">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-[2px]">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/game/memory')}
                    className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10 active:scale-95"
                >
                    ← Выйти
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent italic uppercase"
                >
                    MEMORY
                </motion.div>

                <div className="flex items-center gap-3 bg-purple-500/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-purple-500/20 shadow-xl">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Ходы:</span>
                    <span className="text-xl font-black italic tracking-tighter tabular-nums">
                        {moves}
                    </span>
                </div>
            </div>

            <div className="pt-24 pb-8 px-4 flex-1 flex flex-col items-center max-w-lg mx-auto w-full">
                {/* Game Board */}
                {gameState === 'playing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col justify-center w-full"
                    >
                        {/* Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-purple-400/60 mb-2">
                                <span>Найдено пар</span>
                                <span>{matched.length / 2} / {cards.length / 2}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${(matched.length / cards.length) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                                />
                            </div>
                        </div>

                        {/* Cards Grid */}
                        <div
                            className="grid gap-3"
                            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                        >
                            {cards.map((card) => {
                                const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
                                const isMatched = matched.includes(card.id);

                                return (
                                    <motion.div
                                        key={card.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCardClick(card.id)}
                                        className="relative aspect-square cursor-pointer"
                                        style={{ perspective: 1000 }}
                                    >
                                        <motion.div
                                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="w-full h-full relative"
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            <div
                                                className={`absolute inset-0 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl ${isMatched ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/10'
                                                    } border-2 backdrop-blur-md shadow-lg`}
                                                style={{ backfaceVisibility: 'hidden' }}
                                            >
                                                <span className="opacity-20 font-black">?</span>
                                            </div>
                                            <div
                                                className={`absolute inset-0 rounded-2xl flex items-center justify-center text-3xl sm:text-5xl ${isMatched ? 'bg-emerald-500 text-white' : 'bg-white'
                                                    } shadow-xl`}
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    transform: 'rotateY(180deg)'
                                                }}
                                            >
                                                {card.emoji}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Win Screen */}
                <AnimatePresence>
                    {gameState === 'won' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[3rem] p-10 text-center max-w-sm w-full shadow-2xl"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.5, repeat: 3 }}
                                    className="text-8xl mb-6"
                                >
                                    {getReward().emoji}
                                </motion.div>
                                <h2 className="text-3xl font-black mb-2 italic uppercase bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                                    {getReward().title}
                                </h2>

                                <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-3xl font-black text-white tabular-nums">{moves}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">ходов</p>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black text-white tabular-nums">{formatTime(timer)}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">время</p>
                                        </div>
                                    </div>
                                </div>

                                {getReward().prize && (
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-600 text-white rounded-2xl px-6 py-4 mb-8 shadow-xl">
                                        <p className="font-black text-lg uppercase tracking-tight">🎁 {getReward().prize}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={initGame}
                                        className="bg-white text-black px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]"
                                    >
                                        🔄 Заново
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/')}
                                        className="bg-white/10 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/10"
                                    >
                                        🏠 Меню
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[150px] animate-pulse animation-delay-2000" />
            </div>
        </div>
    );
};

export default MemoryPlay;
