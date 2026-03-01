import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '../components/GameIcons';
import { useUser } from '../components/UserProvider';
import axios from 'axios';
// --- IMAGES ---
import imgRice from './ShuShi/images/ingredients/rice.PNG';
import imgNori from './ShuShi/images/ingredients/nori.PNG';
import imgCucumber from './ShuShi/images/ingredients/cucumber.PNG';
import imgAvocado from './ShuShi/images/ingredients/avocado.PNG';
import imgSalmon from './ShuShi/images/ingredients/salmon.PNG';
import imgTuna from './ShuShi/images/ingredients/tuna.PNG';
import imgShrimp from './ShuShi/images/ingredients/shrimp.PNG';
import imgGinger from './ShuShi/images/ingredients/ginger.PNG';
import imgWasabi from './ShuShi/images/ingredients/wasabi.PNG';
import imgSoySauce from './ShuShi/images/ingredients/soy_sauce.PNG';
import imgRedCaviar from './ShuShi/images/ingredients/red_caviar.PNG';
import imgSeaweed from './ShuShi/images/ingredients/seaweed.PNG';
import imgSesame from './ShuShi/images/ingredients/sesame.PNG';
import imgLemon from './ShuShi/images/ingredients/lemon.PNG';
import imgTobiko from './ShuShi/images/ingredients/tobiko.PNG';
import imgRadish from './ShuShi/images/ingredients/white_radish.PNG';
import imgFishSauce from './ShuShi/images/ingredients/fish_sauce.PNG';
import imgGreenOnion from './ShuShi/images/ingredients/green_onion.PNG';

// --- OVERDUE/TRAP IMAGES ---
import overdue1 from './ShuShi/images/overdue/avocado.PNG';
import overdue2 from './ShuShi/images/overdue/cheese.PNG';
import overdue3 from './ShuShi/images/overdue/chocolate.PNG';
import overdue4 from './ShuShi/images/overdue/cucumber.PNG';
import overdue5 from './ShuShi/images/overdue/mousetrap.PNG';
import overdue6 from './ShuShi/images/overdue/rice.PNG';
import overdue7 from './ShuShi/images/overdue/roll.PNG';
import overdue8 from './ShuShi/images/overdue/salmon.PNG';
import overdue9 from './ShuShi/images/overdue/worms.PNG';

// --- INSTRUMENTS ---
import instChopsticks from './ShuShi/images/instruments/chopsticks.PNG';
import instMat from './ShuShi/images/instruments/mat.PNG';

// --- DISH IMAGES ---
import dish1 from './ShuShi/images/dishes/1.PNG';
import dish2 from './ShuShi/images/dishes/2.PNG';
import dish3 from './ShuShi/images/dishes/3.PNG';
import dish4 from './ShuShi/images/dishes/4.PNG';
import dish5 from './ShuShi/images/dishes/5.PNG';

// --- DATA ---
const INGREDIENTS = [
    { id: 'rice', name: 'Рис', icon: imgRice, type: 'base' },
    { id: 'nori', name: 'Нори', icon: imgNori, type: 'base' },
    { id: 'cucumber', name: 'Огурец', icon: imgCucumber, type: 'veg' },
    { id: 'avocado', name: 'Авокадо', icon: imgAvocado, type: 'veg' },
    { id: 'salmon', name: 'Лосось', icon: imgSalmon, type: 'fish' },
    { id: 'tuna', name: 'Тунец', icon: imgTuna, type: 'fish' },
    { id: 'shrimp', name: 'Креветка', icon: imgShrimp, type: 'fish' },
    { id: 'wasabi', name: 'Васаби', icon: imgWasabi, type: 'extra' },
    { id: 'ginger', name: 'Имбирь', icon: imgGinger, type: 'extra' },
    { id: 'sauce_soy', name: 'Соевый соус', icon: imgSoySauce, type: 'sauce' },

    // Traps / Others
    { id: 'lemon', name: 'Лимон', icon: imgLemon, type: 'trap' },
    { id: 'sesame', name: 'Кунжут', icon: imgSesame, type: 'trap' },
    { id: 'seaweed', name: 'Чука', icon: imgSeaweed, type: 'trap' },
    { id: 'caviar', name: 'Икра', icon: imgRedCaviar, type: 'trap' },
    { id: 'tobiko', name: 'Тобико', icon: imgTobiko, type: 'trap' },
    { id: 'radish', name: 'Дайкон', icon: imgRadish, type: 'trap' },
    { id: 'fish_sauce', name: 'Рыбный соус', icon: imgFishSauce, type: 'trap' },
    { id: 'green_onion', name: 'Лук', icon: imgGreenOnion, type: 'trap' },

    // Overdue Traps
    { id: 'overdue_1', name: 'Старый авокадо', icon: overdue1, type: 'trap' },
    { id: 'overdue_2', name: 'Плесневелый сыр', icon: overdue2, type: 'trap' },
    { id: 'overdue_3', name: 'Старый шоколад', icon: overdue3, type: 'trap' },
    { id: 'overdue_4', name: 'Гнилой огурец', icon: overdue4, type: 'trap' },
    { id: 'overdue_5', name: 'Мышеловка', icon: overdue5, type: 'trap' },
    { id: 'overdue_6', name: 'Грязный рис', icon: overdue6, type: 'trap' },
    { id: 'overdue_7', name: 'Испорченный ролл', icon: overdue7, type: 'trap' },
    { id: 'overdue_8', name: 'Тухлый лосось', icon: overdue8, type: 'trap' },
    { id: 'overdue_9', name: 'Черви', icon: overdue9, type: 'trap' },

    // Instruments as Traps (don't add to sushi!)
    { id: 'inst_chopsticks', name: 'Палочки', icon: instChopsticks, type: 'trap' },
    { id: 'inst_mat', name: 'Циновка', icon: instMat, type: 'trap' },
];

const ROLLS = [
    { id: 'california', name: 'Калифорния', ingredients: ['rice', 'nori', 'cucumber', 'shrimp', 'avocado'], difficulty: 1, image: dish1 },
    { id: 'philadelphia', name: 'Филадельфия', ingredients: ['rice', 'nori', 'wasabi', 'salmon', 'cucumber'], difficulty: 1, image: dish2 },
    { id: 'maguro', name: 'Магуро', ingredients: ['rice', 'nori', 'tuna', 'wasabi'], difficulty: 2, image: dish3 },
    { id: 'kappa', name: 'Каппа Маки', ingredients: ['rice', 'nori', 'cucumber'], difficulty: 0, image: dish4 },
    { id: 'spicy_shrimp', name: 'Эби Маки', ingredients: ['rice', 'nori', 'shrimp', 'ginger'], difficulty: 1, image: dish5 },
    { id: 'vegan', name: 'Веган Ролл', ingredients: ['rice', 'nori', 'cucumber', 'avocado'], difficulty: 0, image: dish1 },
    { id: 'sake', name: 'Сяке Маки', ingredients: ['rice', 'nori', 'salmon'], difficulty: 0, image: dish2 },
    { id: 'spicy_tuna', name: 'Острый Тунец', ingredients: ['rice', 'nori', 'tuna', 'wasabi', 'ginger'], difficulty: 2, image: dish3 },
    { id: 'ebi_crunch', name: 'Эби Кранч', ingredients: ['rice', 'nori', 'shrimp', 'avocado'], difficulty: 1, image: dish4 },
    { id: 'soy_special', name: 'Соевый Тунец', ingredients: ['rice', 'nori', 'tuna', 'sauce_soy'], difficulty: 1, image: dish5 },
    { id: 'rainbow', name: 'Радужный Ролл', ingredients: ['rice', 'nori', 'salmon', 'tuna', 'avocado'], difficulty: 2, image: dish1 },
    // Extra variety
    { id: 'lite_roll', name: 'Лайт Ролл', ingredients: ['rice', 'nori', 'cucumber', 'sesame'], difficulty: 0, image: dish2 },
    { id: 'seaweed_maki', name: 'Чука Маки', ingredients: ['rice', 'nori', 'seaweed', 'sesame'], difficulty: 1, image: dish3 },
    { id: 'royal_shrimp', name: 'Роял Креветка', ingredients: ['rice', 'nori', 'shrimp', 'caviar'], difficulty: 2, image: dish4 },
    { id: 'omega_mix', name: 'Омега Микс', ingredients: ['rice', 'nori', 'salmon', 'tuna', 'cucumber'], difficulty: 2, image: dish5 },
    { id: 'chef_dream', name: 'Мечта Шефа', ingredients: ['rice', 'nori', 'salmon', 'shrimp', 'avocado', 'wasabi'], difficulty: 3, image: dish1 },
];

const REWARDS = [
    { streak: 3, prize: 'Бесплатный лимонад', condition: 'к заказу от 3000 ₸', code: 'LEMON3000' },
    { streak: 5, prize: 'Порция роллов в подарок', condition: 'на любой заказ от 4500 ₸', code: 'ROLLS5FREE' },
    { streak: 7, prize: 'Бесплатный ролл Филадельфия Лайт', condition: 'к заказу от 5000 ₸', code: 'PHILA5000' },
    { streak: 10, prize: '-25% на весь заказ', condition: 'при заказе от 7000 ₸', code: 'ALL25PRO' },
];

const COOLDOWN_TIME = 10 * 60 * 1000; // 10 minutes

const formatTime = (ms) => {
    if (!ms || ms < 0) return "00:00";
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const ShuShiPlay = () => {
    const navigate = useNavigate();
    const { user, userPhone, fetchUser } = useUser();

    // State
    const [gameState, setGameState] = useState('intro'); // intro, memorize, playing, result, cooldown, mistake
    const [streak, setStreak] = useState(() => {
        const saved = localStorage.getItem(`shushi_streak_${userPhone || 'guest'}`);
        return saved ? parseInt(saved, 10) : 0;
    });
    const [lives, setLives] = useState(3);
    const [currentRoll, setCurrentRoll] = useState(null);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [board, setBoard] = useState([]); // Ingredients placed on board
    const [timer, setTimer] = useState(3);
    const [cooldownEnd, setCooldownEnd] = useState(null);
    const [catMood, setCatMood] = useState('neutral'); // neutral, happy, angry, waiting
    const [lastReward, setLastReward] = useState(null);
    const [showCode, setShowCode] = useState(false);
    const [notification, setNotification] = useState(null); // { type: 'error'|'success', message: string }

    // Preload Images
    useEffect(() => {
        const imagesToPreload = [
            ...INGREDIENTS.map(i => i.icon),
            ...ROLLS.map(r => r.image)
        ];
        imagesToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    // Refs for timer and randomness
    const timerRef = useRef(null);
    const lastRollsRef = useRef([]); // Track last 3 rolls to avoid repetition

    // Persist Streak
    useEffect(() => {
        if (userPhone) {
            localStorage.setItem(`shushi_streak_${userPhone}`, streak.toString());
        }
    }, [streak, userPhone]);

    // Initial Load - Check Cooldown
    useEffect(() => {
        const savedCooldown = localStorage.getItem(`shushi_cooldown_${userPhone || 'guest'}`);
        if (savedCooldown) {
            const end = parseInt(savedCooldown, 10);
            if (Date.now() < end) {
                setCooldownEnd(end);
                setGameState('cooldown');
                setLives(0);
            } else {
                localStorage.removeItem(`shushi_cooldown_${userPhone || 'guest'}`);
            }
        }
    }, [userPhone]);

    // Cooldown Timer
    const [, setTick] = useState(0);
    useEffect(() => {
        if (gameState === 'cooldown' && cooldownEnd) {
            const interval = setInterval(() => {
                const now = Date.now();
                if (now >= cooldownEnd) {
                    setGameState('intro');
                    setCooldownEnd(null);
                    setLives(3);
                    localStorage.removeItem(`shushi_cooldown_${userPhone || 'guest'}`);
                    clearInterval(interval);
                } else {
                    setTick(t => t + 1); // Trigger re-render for countdown
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
        // Difficulty level (0 to 3)
        const difficultyLevel = Math.min(3, Math.floor(streak / 3));

        // Filter rolls that are appropriate for the level OR slightly easier
        // Also ensure they aren't in the recent history
        const possibleRolls = ROLLS.filter(r =>
            r.difficulty <= difficultyLevel + 1 &&
            !lastRollsRef.current.includes(r.id)
        );

        // Fallback to all rolls if filter is too restrictive
        const pool = possibleRolls.length > 0 ? possibleRolls : ROLLS;
        const roll = pool[Math.floor(Math.random() * pool.length)];

        // Update history (keep last 3)
        lastRollsRef.current = [roll.id, ...lastRollsRef.current].slice(0, 3);

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

        // Trap selection: Mix of normal traps, overdue, and instruments
        const allPotentialTraps = INGREDIENTS.filter(i => !currentRoll.ingredients.includes(i.id) && i.type === 'trap');

        // Shuffle and take a pool of traps based on streak
        const trapPoolSize = 6 + Math.floor(streak / 2);
        const traps = allPotentialTraps
            .sort(() => 0.5 - Math.random())
            .slice(0, trapPoolSize);

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
            // Save reward to local storage
            const myRewardsKey = `shushi_rewards_${userPhone || 'guest'}`;
            const myRewards = JSON.parse(localStorage.getItem(myRewardsKey) || '[]');
            myRewards.push({ ...reward, date: Date.now() });
            localStorage.setItem(myRewardsKey, JSON.stringify(myRewards));
        } else {
            setLastReward(null);
        }

        import('canvas-confetti').then(confetti => {
            confetti.default({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        });

        setGameState('result');
    };

    const handleLose = () => {
        setCatMood('angry');

        if (lives > 1) {
            const newLives = lives - 1;
            setLives(newLives);

            // Custom Notification
            setNotification({ type: 'error', message: `Упс! Минус жизнь. Осталось: ${newLives}` });
            setTimeout(() => setNotification(null), 2000);

            setBoard([]);
            setTimer(3);
            setGameState('mistake');
        } else {
            setLives(0);
            setStreak(0); // Reset streak on full lose
            // Set cooldown
            const end = Date.now() + COOLDOWN_TIME;
            localStorage.setItem(`shushi_cooldown_${userPhone || 'guest'}`, end.toString());
            setCooldownEnd(end);
            setGameState('cooldown');
        }
    };

    const removeCooldown = () => {
        // Notification for simulating order
        setNotification({ type: 'success', message: 'Заказ оформлен! Блокировка снята. +3 жизни.' });

        setTimeout(() => {
            setNotification(null);
            localStorage.removeItem(`shushi_cooldown_${userPhone || 'guest'}`);
            setCooldownEnd(null);
            setGameState('intro');
            setLives(3);
        }, 2000);
    };

    // --- RENDER HELPERS ---

    return (
        <div className="h-[100dvh] bg-slate-900 text-white font-montserrat overflow-hidden relative selection:bg-pink-500 selection:text-white flex flex-col">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm"></div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center p-3 md:p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
                <button
                    onClick={() => navigate('/game/shushi')}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                    aria-label="Назад"
                >
                    <IconArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400">Серия</span>
                    <span className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 tabular-nums">
                        {streak} 🔥
                    </span>
                </div>
                <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <span key={i} className={`text-lg md:text-xl transition-all duration-300 ${i < lives ? 'filter drop-shadow-[0_0_5px_rgba(236,72,153,0.5)] scale-110' : 'grayscale opacity-30 scale-90'}`}>
                            ❤️
                        </span>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col flex-grow overflow-hidden justify-end">

                {/* Intro State */}
                {gameState === 'intro' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-24 h-24 md:w-32 md:h-32 mb-6 animate-bounce">
                            <img src={dish1} alt="Sushi" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black mb-4">Готов, стажер?</h2>
                        <p className="text-sm md:text-slate-400 mb-8 max-w-xs mx-auto text-slate-400">
                            Собери как можно больше роллов подряд. У тебя 3 секунды на запоминание!
                        </p>
                        <button
                            onClick={startRound}
                            className="w-full max-w-xs py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl text-base md:text-lg font-bold hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all"
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
                            className="w-32 h-32 md:w-48 md:h-48 mb-6 md:mb-8 flex items-center justify-center"
                        >
                            <img src={currentRoll.image} alt={currentRoll.name} className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                        </motion.div>
                        <h2 className="text-2xl md:text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                            {currentRoll.name}
                        </h2>
                        {/* Anti-cheat: No labels, only visual icons */}
                        <div className="flex flex-wrap gap-2 md:gap-4 justify-center mt-4 md:mt-6 opacity-80">
                            {currentRoll.ingredients.map(ingId => {
                                const ing = INGREDIENTS.find(i => i.id === ingId);
                                return (
                                    <div key={ingId} className="w-20 h-20 md:w-28 md:h-28 bg-white/5 rounded-xl border border-white/10 p-3 overflow-hidden shadow-lg">
                                        <img src={ing?.icon} alt="?" className="w-full h-full object-contain" />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-8 md:mt-12 text-4xl md:text-5xl font-black text-amber-400 tabular-nums animate-pulse">
                            {timer}
                        </div>
                    </div>
                )}

                {/* Playing State */}
                {gameState === 'playing' && (
                    <div className="flex-1 flex flex-col relative overflow-hidden">
                        {/* Notification Overlay */}
                        <AnimatePresence>
                            {notification && (
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className={`absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-[100] px-4 md:px-6 py-2 rounded-full text-xs md:text-base font-bold shadow-2xl backdrop-blur-md border ${notification.type === 'error' ? 'bg-red-500/90 border-red-400' : 'bg-green-500/90 border-green-400'
                                        }`}
                                >
                                    {notification.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Character Mascot Wrapper - Absolute so it doesn't push down the board */}
                        <div className="absolute top-10 left-0 right-0 h-16 md:h-24 flex items-center justify-center pointer-events-none z-20">
                            <motion.div
                                animate={catMood === 'angry' ? { x: [-5, 5, -5, 5, 0] } : {}}
                                transition={{ duration: 0.2 }}
                                className="text-4xl md:text-6xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                            >
                                {catMood === 'happy' ? '😸' : catMood === 'angry' ? '😿' : '😼'}
                            </motion.div>
                            {/* Speech Bubble */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute -top-1 left-1/2 -translate-x-[-20%] bg-white text-slate-900 px-2 py-0.5 md:px-3 md:py-1 rounded-xl rounded-bl-none text-[8px] md:text-[10px] font-black uppercase tracking-wider shadow-xl border-2 border-slate-900 whitespace-nowrap z-30"
                            >
                                {catMood === 'happy' ? 'Огонь!' : catMood === 'angry' ? 'Блин!' : 'Жду...'}
                            </motion.div>
                        </div>

                        {/* Spacer for Mascot */}
                        <div className="h-12 md:h-20 flex-shrink-0"></div>

                        {/* Board Area - Sushi Roller */}
                        <div className="bg-slate-800/80 backdrop-blur-sm mx-4 mb-4 mt-auto rounded-3xl border border-white/20 relative flex flex-col items-center justify-center pt-8 pb-4 px-4 md:pt-10 md:pb-6 md:px-6 h-80 md:h-80 overflow-hidden shadow-2xl transition-all">
                            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-black text-white uppercase tracking-[0.25em] bg-pink-600 px-4 py-1.5 rounded-full shadow-lg shadow-pink-900/40 z-10 border-2 border-slate-900">
                                {currentRoll.name}
                            </span>

                            {/* The "Mat" */}
                            <div className="w-full max-w-[280px] h-32 md:h-40 bg-slate-900/80 rounded-2xl border-2 border-dashed border-slate-700 flex flex-wrap content-center justify-center gap-2 p-2 relative overflow-y-auto no-scrollbar">
                                {board.length === 0 && (
                                    <span className="text-slate-600 text-[10px] md:text-sm font-medium text-center px-4">Добавь нужные ингредиенты на циновку...</span>
                                )}
                                <AnimatePresence>
                                    {board.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            onClick={() => handleIngredientClick(item)}
                                            className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-lg md:rounded-xl flex flex-col items-center justify-center border border-white/20 cursor-pointer shadow-lg relative p-1.5 md:p-2"
                                        >
                                            <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-[12px] shadow-sm">✕</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={checkResult}
                                disabled={board.length === 0}
                                className={`mt-3 md:mt-4 px-6 md:px-10 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-black uppercase tracking-widest transition-all shrink-0 ${board.length > 0
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 active:scale-95'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                Готово!
                            </button>
                        </div>

                        {/* Conveyor Belt - Ingredients */}
                        <div className="h-40 md:h-56 bg-slate-900 border-t border-white/10 relative overflow-hidden flex-shrink-0">
                            {/* Conveyor Animation Background */}
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_50%,#fff_50%)] bg-[length:40px_100%] animate-[slide_2s_linear_infinite]"></div>

                            <div className="relative z-10 flex items-center h-full overflow-x-auto px-4 md:px-6 gap-3 md:gap-4 no-scrollbar">
                                {availableIngredients.map((item) => {
                                    const isSelected = board.find(i => i.id === item.id);
                                    return (
                                        <motion.button
                                            key={item.id}
                                            onClick={() => !isSelected && handleIngredientClick(item)}
                                            disabled={isSelected}
                                            whileTap={{ scale: 0.9 }}
                                            className={`flex-shrink-0 w-24 h-28 md:w-28 md:h-36 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all p-1.5 md:p-2 ${isSelected
                                                ? 'bg-slate-800 border-slate-700 opacity-20 grayscale'
                                                : 'bg-slate-800 border-slate-600 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10'
                                                }`}
                                        >
                                            <div className="w-12 h-12 md:w-16 md:h-16 mb-0.5 md:mb-1">
                                                <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-[8px] md:text-[10px] font-bold text-center px-0.5 leading-tight">{item.name}</span>
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
                        <div className="text-7xl md:text-9xl mb-4 animate-bounce">
                            😻
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-green-400 mb-2">
                            {streak === 1 ? 'Первый пошел!' : 'Отлично!'}
                        </h2>
                        <p className="text-sm md:text-base text-slate-400 mb-8">
                            {streak === 1 ? 'Так держать, стажер!' : 'Ролл собран идеально.'}
                        </p>

                        {/* Progress to Next Reward */}
                        {(() => {
                            const nextRewardObj = REWARDS.find(r => r.streak > streak);
                            const prevRewardObj = [...REWARDS].reverse().find(r => r.streak <= streak);
                            const currentTarget = nextRewardObj ? nextRewardObj.streak : REWARDS[REWARDS.length - 1].streak;
                            const progressPercent = Math.min(100, (streak / currentTarget) * 100);

                            return (
                                <div className="w-full max-w-xs mb-8">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Прогресс до приза</span>
                                        <span className="text-lg md:text-xl font-black text-pink-500 tabular-nums">
                                            {streak}<span className="text-slate-600 mx-1">/</span>{currentTarget}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                                        />
                                    </div>
                                    {nextRewardObj && (
                                        <p className="text-[9px] md:text-[10px] text-slate-500 mt-2 italic text-center">
                                            Ещё {currentTarget - streak} побед(ы) до: {nextRewardObj.prize}
                                        </p>
                                    )}
                                </div>
                            );
                        })()}

                        {lastReward && !showCode ? (
                            <div className="bg-slate-800 p-4 md:p-6 rounded-3xl border border-white/10 mb-8 w-full max-w-sm">
                                <h3 className="text-lg md:text-xl font-bold mb-4">🎁 Твой приз готов!</h3>
                                <p className="text-xs md:text-sm text-slate-400 mb-4">Введите номер, чтобы получить промокод:</p>
                                <input
                                    type="tel"
                                    placeholder="+7 (___) ___-__-__"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-center mb-4 text-base md:text-lg"
                                />
                                <button
                                    onClick={() => setShowCode(true)}
                                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-bold"
                                >
                                    Получить код
                                </button>
                            </div>
                        ) : lastReward && showCode ? (
                            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-4 md:p-6 rounded-3xl border border-indigo-500/30 mb-8 max-w-sm w-full text-left md:text-center">
                                <span className="text-[10px] md:text-xs font-bold text-indigo-400 uppercase tracking-widest">Награда за {lastReward.streak} побед</span>
                                <div className="text-xl md:text-2xl font-bold text-white mt-1 md:mt-2 mb-1">{lastReward.prize}</div>
                                <div className="text-xs md:text-sm text-slate-500 mb-1">{lastReward.condition}</div>
                                <div className="text-[9px] md:text-[10px] text-red-400 mb-4 uppercase tracking-widest font-bold">Действует 7 дней</div>
                                <div className="bg-black/30 p-3 rounded-xl font-mono text-center text-base md:text-lg tracking-widest border border-white/5 select-all">
                                    {lastReward.code}
                                </div>
                            </div>
                        ) : null}

                        <button
                            onClick={startRound}
                            className="px-8 md:px-10 py-3 md:py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                            Дальше →
                        </button>
                    </div>
                )}

                {/* Cooldown State */}
                {gameState === 'cooldown' && (
                    <div className="absolute inset-0 bg-red-950/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <div className="text-7xl md:text-9xl mb-4 text-red-500">
                            😿
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-red-500 mb-2">Ошибка!</h2>
                        <p className="text-sm md:text-base text-red-200/80 mb-8">Ты положил что-то не то...</p>

                        <div className="bg-black/40 p-4 md:p-6 rounded-3xl mb-8">
                            <div className="text-[10px] md:text-xs text-red-400 uppercase tracking-widest mb-2">Блокировка игры</div>
                            <div className="text-3xl md:text-5xl font-mono font-bold tabular-nums">
                                {formatTime(cooldownEnd - Date.now())}
                            </div>
                        </div>

                        <button
                            onClick={removeCooldown}
                            className="w-full max-w-xs py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white font-bold shadow-lg shadow-green-900/50 mb-4 animate-pulse"
                        >
                            Снять блокировку (Заказ)
                        </button>
                        <p className="text-[10px] md:text-xs text-slate-500 max-w-xs mx-auto">
                            Сделай любой заказ, чтобы вернуться в игру и получить +3 жизни.
                        </p>
                    </div>
                )}

                {/* Mistake State */}
                {gameState === 'mistake' && (
                    <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <div className="text-7xl md:text-9xl mb-4 animate-shake">
                            😿
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-red-400 mb-2">
                            Упс! Ошибка
                        </h2>
                        <p className="text-sm md:text-base text-slate-400 mb-8 max-w-xs mx-auto">
                            Ты потерял одну жизнь. Будь внимательнее, стажер!
                        </p>

                        <div className="flex gap-1 mb-8">
                            {[...Array(3)].map((_, i) => (
                                <span key={i} className={`text-3xl md:text-4xl transition-all duration-300 ${i < lives ? 'filter drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'grayscale opacity-20 scale-90'}`}>
                                    ❤️
                                </span>
                            ))}
                        </div>

                        <button
                            onClick={() => setGameState('memorize')}
                            className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-pink-500/20"
                        >
                            Попробовать еще
                        </button>
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
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
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
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
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
