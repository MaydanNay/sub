import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShuBeautyIntro from './Intro';
import ShuBeautyPhaser from './components/PhaserGame';
import { IconClock, IconStar, IconArrowLeft, IconRotateCw } from '../../components/GameIcons';
import { Link } from 'react-router-dom';

const ShuBeautyGame = () => {
    const [gameState, setGameState] = useState('intro'); // intro, playing, result
    const [character, setCharacter] = useState(null);
    const [score, setScore] = useState(0);
    const [finalResult, setFinalResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60);

    const handleStart = (charId) => {
        setCharacter(charId);
        setGameState('playing');
        setScore(0);
        setTimeLeft(60);
    };

    const handleGameOver = (result) => {
        setFinalResult(result);
        setGameState('result');
    };

    const handleScoreUpdate = (newScore) => {
        setScore(newScore);
    };

    // Timer effect for UI
    React.useEffect(() => {
        let interval;
        if (gameState === 'playing') {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        return 0; // handled by Phaser
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);


    if (gameState === 'intro') {
        return <ShuBeautyIntro onStart={handleStart} />;
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative touch-none">
            {/* Game Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl flex items-center gap-2 text-white font-bold">
                        <IconStar className="w-5 h-5 text-yellow-400" />
                        <span>{score}</span>
                    </div>
                </div>

                <div className={`bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 font-mono font-bold text-xl ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    <IconClock className="w-5 h-5" />
                    <span>00:{timeLeft.toString().padStart(2, '0')}</span>
                </div>
            </div>

            {/* Game Container */}
            <div className="relative w-full max-w-md h-full flex items-center justify-center">
                {gameState === 'playing' && (
                    <ShuBeautyPhaser
                        character={character}
                        onGameOver={handleGameOver}
                        onScoreUpdate={handleScoreUpdate}
                    />
                )}

                {gameState === 'result' && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-sm w-[90%] text-center shadow-2xl z-20"
                    >
                        <div className="text-6xl mb-4">
                            {finalResult?.victory ? '🎉' : '⏰'}
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 mb-2">
                            {finalResult?.victory ? 'Победа!' : 'Время вышло!'}
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Ты собрала косметичку на <span className="font-bold text-pink-600">{score}</span> очков!
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setGameState('intro')}
                                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <IconRotateCw className="w-5 h-5" />
                                Собрать еще раз
                            </button>
                            <Link
                                to="/catalog"
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <IconArrowLeft className="w-5 h-5" />
                                В меню
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Controls Hint */}
            {gameState === 'playing' && (
                <div className="absolute bottom-8 text-white/50 text-sm animate-pulse pointer-events-none">
                    Свайпай, чтобы бежать
                </div>
            )}
        </div>
    );
};

export default ShuBeautyGame;
