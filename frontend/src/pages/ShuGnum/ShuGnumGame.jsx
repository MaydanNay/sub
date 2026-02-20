import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import gameConfig from './game/config';
import { motion, AnimatePresence } from 'framer-motion';

const ShuGnumGame = () => {
    const gameRef = useRef(null);
    const [gameState, setGameState] = useState({
        score: 0,
        weight: 0,
        timeLeft: 60,
        isGameOver: false,
        isBasinFilled: false
    });

    useEffect(() => {
        if (gameRef.current) return;

        const config = {
            ...gameConfig,
            callbacks: {
                postBoot: (game) => {
                    const scene = game.scene.getScene('MainScene');

                    scene.events.on('update_hud', (data) => {
                        setGameState(prev => ({ ...prev, ...data }));
                    });

                    scene.events.on('basin_filled', () => {
                        setGameState(prev => ({ ...prev, isBasinFilled: true }));
                    });

                    scene.events.on('game_over', (data) => {
                        setGameState(prev => ({ ...prev, isGameOver: true, ...data }));
                    });
                }
            }
        };

        gameRef.current = new Phaser.Game(config);

        // Update loop for HUD from Phaser to React
        const interval = setInterval(() => {
            const scene = gameRef.current?.scene.getScene('MainScene');
            if (scene && !scene.isGameOver) {
                setGameState(prev => ({
                    ...prev,
                    score: scene.score,
                    weight: scene.saladWeight,
                    timeLeft: scene.timeLeft
                }));
            }
        }, 200);

        return () => {
            clearInterval(interval);
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    const progress = Math.min((gameState.weight / 10000) * 100, 100);

    return (
        <div className="w-full h-screen bg-white flex justify-center items-center overflow-hidden relative font-sans">
            {/* Background - Magnum Logo Watermark */}
            <div className="absolute inset-0 bg-[url('/magnum_logo.svg')] bg-no-repeat bg-center opacity-5 grayscale invert-0 scale-[2]"></div>

            {/* Mobile Container */}
            <div className="relative w-full max-w-[480px] h-full max-h-[900px] bg-white shadow-2xl overflow-hidden border-x border-neutral-100 flex flex-col">

                {/* HUD Top */}
                <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-start pointer-events-none">
                    <div className="flex flex-col">
                        <span className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">Очки</span>
                        <span className="text-3xl font-black text-[#EE1C25] italic leading-none">{gameState.score}</span>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-200 shadow-sm flex items-center gap-2">
                        <span className="text-neutral-500 text-xs">⏱</span>
                        <span className={`text-xl font-mono font-bold ${gameState.timeLeft < 10 ? 'text-[#EE1C25] animate-pulse' : 'text-neutral-800'}`}>
                            {gameState.timeLeft}с
                        </span>
                    </div>
                </div>

                {/* Basin Progress Bar */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[80%] z-20 pointer-events-none">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-neutral-800 uppercase opacity-70">Тазик Оливье</span>
                        <span className="text-[10px] font-bold text-[#EE1C25]">{(gameState.weight / 1000).toFixed(1)} / 10 кг</span>
                    </div>
                    <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200 p-[2px]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-[#EE1C25] to-[#ff4d4d] rounded-full shadow-[0_0_10px_rgba(238,28,37,0.3)]"
                        />
                    </div>
                </div>

                <div id="phaser-game" className="w-full h-full flex-grow" />

                {/* Overlay Elements */}
                <AnimatePresence>
                    {gameState.isGameOver && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-white/90 backdrop-blur-xl z-50 flex flex-center items-center justify-center p-8 text-center"
                        >
                            <div className="flex flex-col items-center">
                                <motion.div
                                    initial={{ scale: 0.8, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className="mb-8"
                                >
                                    <img src="/magnum_logo.svg" alt="Magnum" className="w-32 mx-auto mb-6" />
                                    <h2 className="text-neutral-500 text-sm uppercase tracking-[0.2em] mb-2 font-bold">Раунд Завершен</h2>
                                    <h1 className="text-5xl font-black text-neutral-800 italic uppercase tracking-tighter mb-4">
                                        {gameState.weight >= 10000 ? 'ПОБЕДА!' : 'НЕПЛОХО!'}
                                    </h1>
                                    <div className="text-6xl font-black text-[#EE1C25] mb-2 italic">
                                        {gameState.score}
                                    </div>
                                    <div className="text-neutral-500 text-xs uppercase font-bold">Финальный счет</div>
                                </motion.div>

                                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                                        <div className="text-2xl font-bold text-neutral-800">{(gameState.weight / 1000).toFixed(1)}кг</div>
                                        <div className="text-[10px] text-neutral-400 uppercase font-bold">Салата</div>
                                    </div>
                                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                                        <div className="text-2xl font-bold text-red-500">
                                            {gameState.weight >= 10000 ? '+1000' : '0'}
                                        </div>
                                        <div className="text-[10px] text-neutral-400 uppercase font-bold">Бонусов</div>
                                    </div>
                                </div>

                                {gameState.weight >= 10000 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8"
                                    >
                                        <p className="text-red-600 text-xs font-bold leading-tight uppercase tracking-wider">
                                            Вы нарезали целый тазик! <br /> 1000 бонусов зачислены на ваш баланс Magnum Club.
                                        </p>
                                    </motion.div>
                                )}

                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-[#EE1C25] text-white font-black py-4 rounded-2xl uppercase tracking-tighter hover:bg-[#d41920] transition-colors shadow-lg shadow-red-200"
                                >
                                    Попробовать еще
                                </button>

                                <button
                                    onClick={() => window.location.href = '/catalog'}
                                    className="mt-4 text-neutral-400 text-[10px] uppercase font-bold tracking-[0.1em] hover:text-[#EE1C25] transition-colors"
                                >
                                    Вернуться в каталог
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Visual Feedback Overlays (Blur mockup) */}
                <div id="penalty-blur" className="pointer-events-none absolute inset-0 z-40 bg-white/30 backdrop-blur-md opacity-0 transition-opacity duration-300" />
            </div>
        </div>
    );
};

export default ShuGnumGame;
