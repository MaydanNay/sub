import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconSushi, IconFish } from '../components/GameIcons';
import confetti from 'canvas-confetti';

// --- DATA ---
const INGREDIENTS = [
    { id: 'rice', name: 'Рис', icon: '🍚', type: 'base' },
    { id: 'nori', name: 'Нори', icon: '⬛', type: 'base' },
    { id: 'cucumber', name: 'Огурец', icon: '🥒', type: 'veg' },
    { id: 'avocado', name: 'Авокадо', icon: '🥑', type: 'veg' },
    { id: 'salmon', name: 'Лосось', icon: '🐟', type: 'fish' },
    { id: 'eel', name: 'Угорь', icon: '🐍', type: 'fish' },
    { id: 'crab', name: 'Краб', icon: '🦀', type: 'fish' },
    { id: 'cheese', name: 'Сыр', icon: '🧀', type: 'filling' },
    { id: 'sauce_unagi', name: 'Унаги', icon: '🍯', type: 'sauce' },
    { id: 'sauce_spicy', name: 'Спайси', icon: '🌶️', type: 'sauce' },
    // Traps
    { id: 'tomato', name: 'Помидор', icon: '🍅', type: 'trap' },
    { id: 'sausage', name: 'Колбаса', icon: '🌭', type: 'trap' },
    { id: 'pineapple', name: 'Ананас', icon: '🍍', type: 'trap' },
    { id: 'chocolate', name: 'Шоколад', icon: '🍫', type: 'trap' },
    { id: 'banana', name: 'Банан', icon: '🍌', type: 'trap' },
];

const ROLLS = [
    { id: 'california', name: 'Калифорния', ingredients: ['rice', 'nori', 'cucumber', 'crab', 'avocado'], difficulty: 1 },
    { id: 'philadelphia', name: 'Филадельфия', ingredients: ['rice', 'nori', 'cheese', 'salmon', 'cucumber'], difficulty: 1 },
    { id: 'canada', name: 'Канада', ingredients: ['rice', 'nori', 'cheese', 'eel', 'salmon', 'sauce_unagi'], difficulty: 2 },
    { id: 'kappa', name: 'Каппа Маки', ingredients: ['rice', 'nori', 'cucumber'], difficulty: 0 },
    { id: 'spicy_crab', name: 'Спайси Краб', ingredients: ['rice', 'nori', 'crab', 'sauce_spicy'], difficulty: 1 },
    { id: 'dragon', name: 'Дракон', ingredients: ['rice', 'nori', 'eel', 'cucumber', 'avocado', 'sauce_unagi', 'cheese'], difficulty: 3 },
];

const REWARDS = [
    { streak: 3, prize: 'Бесплатный лимонад', condition: 'к заказу от 3000 ₸', code: 'LEMON3000' },
    { streak: 5, prize: '-15% на категорию «Запеченные роллы»', condition: 'на любой заказ', code: 'BAKED15' },
    { streak: 7, prize: 'Бесплатный ролл Филадельфия Лайт', condition: 'к заказу от 5000 ₸', code: 'PHILA5000' },
    { streak: 10, prize: '-25% на весь заказ', condition: 'при заказе от 7000 ₸', code: 'ALL25PRO' },
];

const COOLDOWN_TIME = 10 * 60 * 1000; // 10 minutes

const ShuShiPlay = () => {
    const navigate = useNavigate();

    // State
    const [gameState, setGameState] = useState('intro'); // intro, memorize, playing, result, cooldown
    const [streak, setStreak] = useState(0);
    const [currentRoll, setCurrentRoll] = useState(null);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [board, setBoard] = useState([]); // Ingredients placed on board
    const [timer, setTimer] = useState(3);
    const [cooldownEnd, setCooldownEnd] = useState(null);
    const [catMood, setCatMood] = useState('neutral'); // neutral, happy, angry, waiting
    const [lastReward, setLastReward] = useState(null);
    const [showCode, setShowCode] = useState(false);

    // Refs for timer
    const timerRef = useRef(null);

    // Initial Load - Check Cooldown
    useEffect(() => {
        const savedCooldown = localStorage.getItem('shushi_cooldown');
        if (savedCooldown) {
            const end = parseInt(savedCooldown, 10);
            if (Date.now() < end) {
                setCooldownEnd(end);
                setGameState('cooldown');
            } else {
                localStorage.removeItem('shushi_cooldown');
            }
        }
    }, []);

    // Cooldown Timer
    useEffect(() => {
        if (gameState === 'cooldown' && cooldownEnd) {
            const interval = setInterval(() => {
                if (Date.now() >= cooldownEnd) {
                    setGameState('intro');
                    setCooldownEnd(null);
                    localStorage.removeItem('shushi_cooldown');
                    clearInterval(interval);
                } else {
                    // Force re-render for timer update? Not strictly needed if we just calculate remaining time in render
                    setTimer(prev => prev); // Dummy update
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState, cooldownEnd]);

    // Game Loop - Memorize Phase
    useEffect(() => {
        if (gameState === 'memorize') {
            setCatMood('neutral');
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        startPlaying();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState]);

    const startRound = () => {
        // Pick random roll based on streak (simulated difficulty increase)
        const difficulty = Math.min(3, Math.floor(streak / 3));
        const possibleRolls = ROLLS.filter(r => Math.abs(r.difficulty - difficulty) <= 1 || r.difficulty <= difficulty);
        const roll = possibleRolls[Math.floor(Math.random() * possibleRolls.length)];

        setCurrentRoll(roll);
        setBoard([]);
        setTimer(3);
        setCatMood('neutral');
        setShowCode(false);
        setGameState('memorize');
    };

    const startPlaying = () => {
        setGameState('playing');

        // Prepare ingredients: Correct ones + Random Traps
        const correct = INGREDIENTS.filter(i => currentRoll.ingredients.includes(i.id));
        const traps = INGREDIENTS.filter(i => !currentRoll.ingredients.includes(i.id))
            .sort(() => 0.5 - Math.random())
            .slice(0, 5 + Math.floor(streak / 2)); // Add more traps as streak increases

        const mixed = [...correct, ...traps].sort(() => 0.5 - Math.random());
        setAvailableIngredients(mixed);
    };

    const handleIngredientClick = (ingredient) => {
        // Toggle ingredient on board
        if (board.find(i => i.id === ingredient.id)) {
            setBoard(prev => prev.filter(i => i.id !== ingredient.id));
        } else {
            setBoard(prev => [...prev, ingredient]);
        }
    };

    const checkResult = () => {
        const boardIds = board.map(i => i.id).sort();
        const correctIds = [...currentRoll.ingredients].sort();

        const isCorrect = JSON.stringify(boardIds) === JSON.stringify(correctIds);

        if (isCorrect) {
            handleWin();
        } else {
            handleLose();
        }
    };

    const handleWin = () => {
        setCatMood('happy');
        const newStreak = streak + 1;
        setStreak(newStreak);

        // Check for rewards
        const reward = REWARDS.find(r => r.streak === newStreak);
        if (reward) {
            setLastReward(reward);
            // Save reward to local storage or backend
            const myRewards = JSON.parse(localStorage.getItem('shushi_rewards') || '[]');
            myRewards.push({ ...reward, date: Date.now() });
            localStorage.setItem('shushi_rewards', JSON.stringify(myRewards));
        } else {
            setLastReward(null);
        }

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        setGameState('result');
    };

    const handleLose = () => {
        setCatMood('angry');
        // Set cooldown
        const end = Date.now() + COOLDOWN_TIME;
        localStorage.setItem('shushi_cooldown', end.toString());
        setCooldownEnd(end);

        setGameState('cooldown');
    };

    const removeCooldown = () => {
        // Simulate order logic
        if (confirm("Перейти к оформлению заказа для снятия блокировки? (Демо: Блокировка снята!)")) {
            localStorage.removeItem('shushi_cooldown');
            setCooldownEnd(null);
            setGameState('intro');
            setStreak(prev => prev); // Keep streak or reset? Usually reset on lose, but "O2O" might encourage keeping? 
            // Prompt says: "Если ты ошибся... блокировка на 10 минут... если сделать заказ, блокировка снимается и дают 3 жизни"
            // For demo simplification, we just reset state to intro but maybe notify user.
            alert("Спасибо за заказ! Блокировка снята. Вы получили +3 жизни (демо).");
        }
    };

    // --- RENDER HELPERS ---

    const formatTime = (ms) => {
        if (!ms || ms < 0) return "00:00";
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="h-[100dvh] bg-slate-900 text-white font-sans overflow-hidden relative selection:bg-pink-500 selection:text-white flex flex-col">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm"></div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
                <button onClick={() => navigate('/game/shushi')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    <IconArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">Серия</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 tabular-nums">
                        {streak} 🔥
                    </span>
                </div>
                <div className="w-9 h-9"></div> {/* Spacer */}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col flex-grow">

                {/* Intro State */}
                {gameState === 'intro' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="text-8xl mb-6 animate-bounce">🍣</div>
                        <h2 className="text-3xl font-black mb-4">Готов, стажер?</h2>
                        <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                            Собери как можно больше роллов подряд. У тебя 3 секунды на запоминание!
                        </p>
                        <button
                            onClick={startRound}
                            className="w-full max-w-xs py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl text-xl font-bold hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all"
                        >
                            Погнали!
                        </button>
                    </div>
                )}

                {/* Memorize State */}
                {gameState === 'memorize' && currentRoll && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-9xl mb-8 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            🍱
                            {/* In real app, use currentRoll.image */}
                        </motion.div>
                        <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                            {currentRoll.name}
                        </h2>
                        {/* Anti-cheat: No labels, only visual icons */}
                        <div className="flex flex-wrap gap-4 justify-center mt-6 opacity-80">
                            {currentRoll.ingredients.map(ingId => {
                                const ing = INGREDIENTS.find(i => i.id === ingId);
                                return (
                                    <span key={ingId} className="text-4xl filter drop-shadow-lg" title="?">
                                        {ing?.icon}
                                    </span>
                                );
                            })}
                        </div>
                        <div className="mt-12 text-6xl font-black text-amber-400 tabular-nums animate-pulse">
                            {timer}
                        </div>
                    </div>
                )}

                {/* Playing State */}
                {gameState === 'playing' && (
                    <div className="flex-1 flex flex-col">
                        {/* Board Area - Sushi Roller */}
                        <div className="flex-1 bg-slate-800/50 backdrop-blur-sm m-4 rounded-3xl border border-white/10 relative flex flex-col items-center justify-center p-4">
                            <span className="absolute top-4 left-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {currentRoll.name}
                            </span>

                            {/* The "Mat" */}
                            <div className="w-full max-w-[240px] aspect-square bg-slate-900/80 rounded-2xl border-2 border-dashed border-slate-700 flex flex-wrap content-center justify-center gap-2 p-2 relative">
                                {board.length === 0 && (
                                    <span className="text-slate-600 text-sm font-medium">Добавь ингредиенты...</span>
                                )}
                                <AnimatePresence>
                                    {board.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            onClick={() => handleIngredientClick(item)}
                                            className="w-12 h-12 bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-white/20 cursor-pointer shadow-lg relative"
                                        >
                                            <span className="text-2xl">{item.icon}</span>
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">✕</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={checkResult}
                                disabled={board.length === 0}
                                className={`mt-4 px-10 py-3 rounded-xl font-black uppercase tracking-widest transition-all ${board.length > 0
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 active:scale-95'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                Готово!
                            </button>
                        </div>

                        {/* Conveyor Belt - Ingredients */}
                        <div className="h-48 bg-slate-900 border-t border-white/10 relative overflow-hidden">
                            {/* Conveyor Animation Background */}
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_50%,#fff_50%)] bg-[length:40px_100%] animate-[slide_2s_linear_infinite]"></div>

                            <div className="relative z-10 flex items-center h-full overflow-x-auto px-6 gap-4 no-scrollbar">
                                {availableIngredients.map((item) => {
                                    const isSelected = board.find(i => i.id === item.id);
                                    return (
                                        <motion.button
                                            key={item.id}
                                            onClick={() => !isSelected && handleIngredientClick(item)}
                                            disabled={isSelected}
                                            whileTap={{ scale: 0.9 }}
                                            className={`flex-shrink-0 w-20 h-28 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${isSelected
                                                ? 'bg-slate-800 border-slate-700 opacity-20 grayscale'
                                                : 'bg-slate-800 border-slate-600 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10'
                                                }`}
                                        >
                                            <span className="text-3xl">{item.icon}</span>
                                            <span className="text-[10px] font-bold text-center px-1">{item.name}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Result State */}
                {gameState === 'result' && (
                    <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <div className="text-9xl mb-4 animate-bounce">
                            😻
                        </div>
                        <h2 className="text-4xl font-black text-green-400 mb-2">
                            {streak === 1 ? 'Первый пошел!' : 'Отлично!'}
                        </h2>
                        <p className="text-slate-400 mb-8">
                            {streak === 1 ? 'Так держать, стажер!' : 'Ролл собран идеально.'}
                        </p>

                        {lastReward && !showCode ? (
                            <div className="bg-slate-800 p-6 rounded-3xl border border-white/10 mb-8 w-full max-w-sm">
                                <h3 className="text-xl font-bold mb-4">🎁 Твой приз готов!</h3>
                                <p className="text-sm text-slate-400 mb-4">Введите номер, чтобы получить промокод:</p>
                                <input
                                    type="tel"
                                    placeholder="+7 (___) ___-__-__"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-center mb-4 text-lg"
                                />
                                <button
                                    onClick={() => setShowCode(true)}
                                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-bold"
                                >
                                    Получить код
                                </button>
                            </div>
                        ) : lastReward && showCode ? (
                            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 mb-8 max-w-sm w-full">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Награда за {lastReward.streak} побед</span>
                                <div className="text-2xl font-bold text-white mt-2 mb-1">{lastReward.prize}</div>
                                <div className="text-sm text-slate-500 mb-1">{lastReward.condition}</div>
                                <div className="text-[10px] text-red-400 mb-4 uppercase tracking-widest font-bold">Действует 7 дней</div>
                                <div className="bg-black/30 p-3 rounded-xl font-mono text-center text-lg tracking-widest border border-white/5 select-all">
                                    {lastReward.code}
                                </div>
                            </div>
                        ) : null}

                        <button
                            onClick={startRound}
                            className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                            Дальше →
                        </button>
                    </div>
                )}

                {/* Cooldown State */}
                {gameState === 'cooldown' && (
                    <div className="absolute inset-0 bg-red-950/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <div className="text-9xl mb-4">
                            😿
                        </div>
                        <h2 className="text-4xl font-black text-red-500 mb-2">Ошибка!</h2>
                        <p className="text-red-200/80 mb-8">Ты положил что-то не то...</p>

                        <div className="bg-black/40 p-6 rounded-3xl mb-8">
                            <div className="text-xs text-red-400 uppercase tracking-widest mb-2">Блокировка игры</div>
                            <div className="text-5xl font-mono font-bold tabular-nums">
                                {formatTime(cooldownEnd - Date.now())}
                            </div>
                        </div>

                        <button
                            onClick={removeCooldown}
                            className="w-full max-w-xs py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white font-bold shadow-lg shadow-green-900/50 mb-4 animate-pulse"
                        >
                            Снять блокировку (Заказ)
                        </button>
                        <p className="text-xs text-slate-500 max-w-xs">
                            Сделай любой заказ, чтобы вернуться в игру и получить +3 жизни.
                        </p>
                    </div>
                )}

            </div>

            {/* Knife Slash Animation */}
            {
                gameState === 'result' && (
                    <div className="absolute inset-0 z-[60] pointer-events-none overflow-hidden">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-white shadow-[0_0_20px_#fff] animate-slash-line"></div>
                        <div className="absolute inset-0 bg-white/10 animate-flash"></div>
                    </div>
                )
            }

            {/* Audio Placeholder */}
            {/* <audio loop autoPlay src="/assets/lofi-beats.mp3" /> */}

            {/* Animations */}
            <style>{`
                @keyframes slide {
                    0% { background-position: 0 0; }
                    100% { background-position: 40px 0; }
                }
                @keyframes slash-line {
                    0% { transform: scaleX(0) rotate(-5deg); opacity: 0; }
                    50% { transform: scaleX(1) rotate(-5deg); opacity: 1; }
                    100% { transform: scaleX(1) rotate(-5deg); opacity: 0; }
                }
                @keyframes flash {
                    0% { opacity: 0; }
                    10% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .animate-slash-line {
                    animation: slash-line 0.3s ease-out forwards;
                }
                .animate-flash {
                    animation: flash 0.5s ease-out forwards;
                }
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .no-scrollbar {
                  -ms-overflow-style: none;  /* IE and Edge */
                  scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div >
    );
};

export default ShuShiPlay;
