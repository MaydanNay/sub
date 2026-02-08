import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import SoundManager from '../utils/SoundManager';
import { IconGift, IconSad } from './GameIcons';
import PrizeDrawer from './PrizeDrawer';

const PrizeDrop = () => {
    const [dropping, setDropping] = useState(false);
    const [result, setResult] = useState(null);
    const [drawerPrizes, setDrawerPrizes] = useState([]);

    // Simple visual representation of buckets
    const buckets = [
        { id: 'loss1', type: 'loss', label: 'X', color: 'bg-red-200' },
        { id: 'win1', type: 'win', label: '1x', color: 'bg-green-200' },
        { id: 'loss2', type: 'loss', label: 'X', color: 'bg-red-200' },
        { id: 'win2', type: 'win', label: '2x', color: 'bg-green-300' },
        { id: 'loss3', type: 'loss', label: 'X', color: 'bg-red-200' },
    ];

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

    const dropBall = () => {
        if (dropping) return;
        setDropping(true);
        setResult(null);
        SoundManager.play('click'); // Click as drop sound

        // Simulate physics result
        setTimeout(async () => {
            const isWin = Math.random() > 0.5; // 50/50 for demo

            // Randomly pick a bucket based on win/loss
            const possibleBuckets = buckets.filter(b => b.type === (isWin ? 'win' : 'loss'));
            const targetBucket = possibleBuckets[Math.floor(Math.random() * possibleBuckets.length)];

            // In a real app we'd animate the ball path here.
            // For now, simple timeout to result.

            SoundManager.play(isWin ? 'win' : 'failure');

            if (isWin) {
                // Fetch a real prize to award
                try {
                    const response = await api.get('/promotions/random');
                    setResult({ type: 'win', ...response.data });
                } catch (e) {
                    setResult({ type: 'win', title: 'Приз!', description: 'Вы выиграли!' });
                }
            } else {
                setResult({ type: 'loss' });
            }
            setDropping(false);

        }, 2000);
    };

    return (
        <div className="bg-cyan-50 min-h-[calc(100vh-64px)] md:min-h-screen md:py-20 md:px-4 flex flex-col items-center relative overflow-hidden h-full md:h-auto">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-48 h-48 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            </div>

            <div className="max-w-4xl w-full z-10 flex flex-col md:flex-row md:gap-8 items-stretch md:items-start justify-center h-full md:h-auto">
                <div className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8 bg-transparent md:bg-white/60 md:backdrop-blur-xl md:rounded-3xl md:shadow-2xl transition-all duration-300"
                    style={{ paddingBottom: '35vh' }}
                >
                    <div className="w-full flex flex-col items-center md:mb-0 mb-[35vh]">
                        <h2 className="text-3xl font-extrabold text-teal-900 mb-6 font-sans">Плинко</h2>

                        {/* Board Visual */}
                        <div className="relative w-[300px] h-[400px] bg-white rounded-3xl border-4 border-teal-100 shadow-xl overflow-hidden mb-8">
                            {/* Pins */}
                            <div className="absolute inset-0 flex flex-wrap justify-center content-start pt-12 gap-4 opacity-20">
                                {Array(40).fill(0).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-teal-900 mx-2"></div>
                                ))}
                            </div>

                            {/* Falling Ball (Animated) */}
                            {dropping && (
                                <motion.div
                                    className="absolute top-0 left-1/2 w-6 h-6 bg-pink-500 rounded-full shadow-lg z-10 ml-[-12px]"
                                    animate={{ y: 350, x: [0, -20, 20, -40, 40, 0] }}
                                    transition={{ duration: 2, ease: "bounce" }}
                                />
                            )}

                            {/* Buckets */}
                            <div className="absolute bottom-0 w-full flex h-16 border-t border-gray-100">
                                {buckets.map((b, i) => (
                                    <div key={i} className={`flex-1 flex items-center justify-center font-bold ${b.color} text-teal-900 border-r border-white last:border-0`}>
                                        {b.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={dropBall}
                            disabled={dropping}
                            className={`w-full max-w-xs py-4 rounded-2xl font-bold text-white shadow-xl transition-all
                                ${dropping ? 'bg-gray-400' : 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/30'}
                            `}
                        >
                            {dropping ? 'Падает...' : 'Бросить шар!'}
                        </button>
                    </div>
                </div>

                <PrizeDrawer prizes={drawerPrizes} colorClass="text-teal-600" itemBgClass="bg-teal-50" />
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
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                {result.type === 'win' ? 'Победа! 🎉' : 'Мимо 📉'}
                            </h3>
                            {result.type === 'win' ? (
                                <p className="text-teal-600 mb-6 font-bold">{result.title}</p>
                            ) : (
                                <p className="text-gray-500 mb-6">Шар упал не туда.</p>
                            )}
                            <button
                                onClick={() => setResult(null)}
                                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700"
                            >
                                Отлично
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrizeDrop;
