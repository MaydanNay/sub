import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ReactionPlay = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('waiting'); // waiting, click, result, finished
    const [round, setRound] = useState(0);
    const [times, setTimes] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [currentTime, setCurrentTime] = useState(null);
    const [tooEarly, setTooEarly] = useState(false);
    const timerRef = useRef(null);

    const TOTAL_ROUNDS = 5;

    const REWARDS = [
        { maxMs: 200, title: 'Молниеносно!', emoji: '⚡', prize: 'Скидка 25%', color: 'from-amber-400 to-yellow-600' },
        { maxMs: 250, title: 'Супер быстро!', emoji: '🚀', prize: 'Скидка 20%', color: 'from-purple-500 to-pink-500' },
        { maxMs: 300, title: 'Отлично!', emoji: '🎯', prize: 'Скидка 15%', color: 'from-green-400 to-emerald-500' },
        { maxMs: 400, title: 'Хорошо!', emoji: '👍', prize: 'Скидка 10%', color: 'from-blue-400 to-cyan-500' },
        { maxMs: 500, title: 'Неплохо!', emoji: '😊', prize: 'Скидка 5%', color: 'from-indigo-400 to-purple-500' },
        { maxMs: Infinity, title: 'Тренируйся!', emoji: '💪', prize: null, color: 'from-gray-400 to-gray-500' }
    ];

    const startRound = useCallback(() => {
        setTooEarly(false);
        setGameState('waiting');
        const delay = 1500 + Math.random() * 2500;
        timerRef.current = setTimeout(() => {
            setStartTime(Date.now());
            setGameState('click');
        }, delay);
    }, []);

    useEffect(() => {
        startRound();
        return () => clearTimeout(timerRef.current);
    }, [startRound]);

    const handleClick = () => {
        if (gameState === 'waiting') {
            clearTimeout(timerRef.current);
            setTooEarly(true);
            setGameState('result');
            setCurrentTime(null);
        } else if (gameState === 'click') {
            const reactionTime = Date.now() - startTime;
            setCurrentTime(reactionTime);
            setTimes(prev => [...prev, reactionTime]);
            setGameState('result');
        }
    };

    const nextRound = () => {
        if (round + 1 >= TOTAL_ROUNDS) {
            setGameState('finished');
        } else {
            setRound(r => r + 1);
            startRound();
        }
    };

    const getAverage = () => {
        if (times.length === 0) return 0;
        return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    };

    const getBestTime = () => {
        if (times.length === 0) return 0;
        return Math.min(...times);
    };

    const getReward = () => {
        const avg = getAverage();
        return REWARDS.find(r => avg <= r.maxMs) || REWARDS[REWARDS.length - 1];
    };

    const resetGame = () => {
        setGameState('waiting');
        setRound(0);
        setTimes([]);
        setCurrentTime(null);
        setTooEarly(false);
        clearTimeout(timerRef.current);
        startRound();
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white overflow-x-hidden relative flex flex-col">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-[2px]">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/game/reaction')}
                    className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10 active:scale-95"
                >
                    ← Выйти
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl font-black tracking-tighter bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent italic uppercase"
                >
                    REACTION
                </motion.div>

                <div className="flex items-center gap-3 bg-amber-500/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-amber-500/20 shadow-xl">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Раунд:</span>
                    <span className="text-xl font-black italic tracking-tighter tabular-nums">
                        {round + 1} / {TOTAL_ROUNDS}
                    </span>
                </div>
            </div>

            <div className="pt-24 pb-8 px-4 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
                {/* Waiting Screen */}
                {gameState === 'waiting' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleClick}
                        className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer w-full"
                    >
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-9xl mb-10"
                        >
                            🛑
                        </motion.div>
                        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-red-500">Приготовься...</h2>
                        <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs">Жми только на зеленый!</p>
                    </motion.div>
                )}

                {/* Click Screen */}
                {gameState === 'click' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleClick}
                        className="fixed inset-0 z-40 bg-gradient-to-br from-emerald-500 to-teal-600 flex flex-col items-center justify-center text-center cursor-pointer"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                            className="text-[150px] mb-8"
                        >
                            🚀
                        </motion.div>
                        <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter">ЖМИИИ!</h2>
                    </motion.div>
                )}

                {/* Result Screen */}
                {gameState === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col items-center justify-center text-center w-full"
                    >
                        {tooEarly ? (
                            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-[3rem] p-12 w-full shadow-2xl">
                                <div className="text-8xl mb-8">😱</div>
                                <h2 className="text-4xl font-black text-red-500 mb-4 uppercase tracking-tighter">Слишком рано!</h2>
                                <p className="text-white/40 font-bold mb-10">Поторопился, старина...</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startRound}
                                    className="w-full bg-red-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl"
                                >
                                    🔄 Попробовать еще раз
                                </motion.button>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[3rem] p-12 w-full shadow-2xl">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    className="text-8xl mb-6"
                                >
                                    {currentTime < 250 ? '⚡' : currentTime < 350 ? '🚀' : '👍'}
                                </motion.div>
                                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-4 tabular-nums">
                                    {currentTime} <span className="text-2xl">мс</span>
                                </h2>
                                <p className="text-white/40 font-black uppercase tracking-widest text-xs mb-10">
                                    {currentTime < 200 ? 'Божественно!' :
                                        currentTime < 250 ? 'Супер скорость!' :
                                            currentTime < 300 ? 'Отлично!' : 'Неплохо!'}
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={nextRound}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-amber-900/20"
                                >
                                    {round + 1 < TOTAL_ROUNDS ? '➡️ Следующий раунд' : '🏁 К результатам'}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Final Results */}
                {gameState === 'finished' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center w-full"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: 2 }}
                            className="text-9xl mb-8"
                        >
                            {getReward().emoji}
                        </motion.div>
                        <h2 className="text-4xl font-black mb-4 italic uppercase bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                            {getReward().title}
                        </h2>

                        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[3rem] p-10 mb-8 w-full shadow-2xl">
                            <div className="grid grid-cols-2 gap-8 mb-4">
                                <div>
                                    <p className="text-4xl font-black text-white tabular-nums">{getAverage()}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Среднее (мс)</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-emerald-400 tabular-nums">{getBestTime()}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Лучшее (мс)</p>
                                </div>
                            </div>
                        </div>

                        {getReward().prize && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-gradient-to-r from-yellow-400 to-amber-600 text-white rounded-2xl px-10 py-5 mb-10 shadow-xl"
                            >
                                <p className="font-black text-2xl uppercase tracking-tighter">🎁 {getReward().prize}</p>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetGame}
                                className="bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-sm"
                            >
                                🔄 Заново
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/')}
                                className="bg-white/10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm border border-white/10"
                            >
                                🏠 Меню
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[150px] animate-pulse animation-delay-2000" />
            </div>
        </div>
    );
};

export default ReactionPlay;
