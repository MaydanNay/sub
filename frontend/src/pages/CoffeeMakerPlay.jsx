import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CoffeeMakerPlay = () => {
    const navigate = useNavigate();
    // Game State
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('coffee_maker_stats');
        return saved ? JSON.parse(saved) : {
            money: 50,
            reputation: 50,
            customersServed: 0,
            currentStreak: 0,
            bestStreak: 0,
            level: 1
        };
    });

    const [currentOrder, setCurrentOrder] = useState(null);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [message, setMessage] = useState(null);
    const [gamePhase, setGamePhase] = useState('waiting'); // waiting, making, result
    const [particles, setParticles] = useState([]);

    // Coffee Types
    const COFFEE_RECIPES = {
        espresso: { name: 'Эспрессо', ingredients: ['coffee'], price: 30, emoji: '☕' },
        americano: { name: 'Американо', ingredients: ['coffee', 'water'], price: 40, emoji: '🫖' },
        latte: { name: 'Латте', ingredients: ['coffee', 'milk'], price: 50, emoji: '🥛' },
        cappuccino: { name: 'Капучино', ingredients: ['coffee', 'milk', 'foam'], price: 60, emoji: '☕' },
        mocha: { name: 'Мокко', ingredients: ['coffee', 'milk', 'chocolate'], price: 70, emoji: '🍫' },
        caramel_latte: { name: 'Карамель Латте', ingredients: ['coffee', 'milk', 'caramel'], price: 80, emoji: '🍮' },
        iced_coffee: { name: 'Айс Кофе', ingredients: ['coffee', 'ice', 'milk'], price: 65, emoji: '🧊' },
        hot_chocolate: { name: 'Горячий шоколад', ingredients: ['milk', 'chocolate', 'cream'], price: 55, emoji: '🍫' },
    };

    const INGREDIENTS = [
        { id: 'coffee', name: 'Кофе', emoji: '☕', color: 'from-amber-700 to-amber-900' },
        { id: 'milk', name: 'Молоко', emoji: '🥛', color: 'from-white to-gray-100' },
        { id: 'water', name: 'Вода', emoji: '💧', color: 'from-blue-300 to-blue-500' },
        { id: 'foam', name: 'Пенка', emoji: '🫧', color: 'from-gray-100 to-white' },
        { id: 'chocolate', name: 'Шоколад', emoji: '🍫', color: 'from-amber-800 to-amber-950' },
        { id: 'caramel', name: 'Карамель', emoji: '🍮', color: 'from-amber-400 to-amber-600' },
        { id: 'ice', name: 'Лёд', emoji: '🧊', color: 'from-cyan-200 to-cyan-400' },
        { id: 'cream', name: 'Сливки', emoji: '🍦', color: 'from-yellow-50 to-yellow-100' },
    ];

    const CUSTOMERS = [
        { name: 'Анна', emoji: '👩', patience: 'high' },
        { name: 'Борис', emoji: '👨', patience: 'medium' },
        { name: 'Виктор', emoji: '🧔', patience: 'low' },
        { name: 'Галина', emoji: '👵', patience: 'high' },
        { name: 'Денис', emoji: '👦', patience: 'medium' },
        { name: 'Елена', emoji: '👩‍💼', patience: 'low' },
        { name: 'Жора', emoji: '🧑', patience: 'medium' },
        { name: 'Зина', emoji: '👧', patience: 'high' },
    ];

    useEffect(() => {
        localStorage.setItem('coffee_maker_stats', JSON.stringify(stats));
    }, [stats]);

    useEffect(() => {
        if (gamePhase === 'making' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gamePhase, timeLeft]);

    const handleTimeout = () => {
        setStats(prev => ({
            ...prev,
            reputation: Math.max(0, prev.reputation - 15),
            currentStreak: 0
        }));
        showMessageFn('Время вышло! Клиент ушёл 😠');
        setGamePhase('waiting');
        setCurrentOrder(null);
        setSelectedIngredients([]);
    };

    const spawnParticles = (emoji, count = 5) => {
        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: Date.now() + i,
            emoji,
            x: Math.random() * 150 - 75,
            delay: Math.random() * 0.3
        }));
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 2000);
    };

    const showMessageFn = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(null), 2500);
    };

    const startNewOrder = () => {
        const coffeeTypes = Object.keys(COFFEE_RECIPES);
        const randomCoffee = coffeeTypes[Math.floor(Math.random() * coffeeTypes.length)];
        const randomCustomer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];

        const patienceTime = { high: 45, medium: 30, low: 20 };
        const baseTime = patienceTime[randomCustomer.patience];
        const levelBonus = Math.max(0, 5 - stats.level);

        setCurrentOrder({
            coffee: randomCoffee,
            customer: randomCustomer,
            recipe: COFFEE_RECIPES[randomCoffee]
        });
        setSelectedIngredients([]);
        setTimeLeft(baseTime + levelBonus);
        setGamePhase('making');
    };

    const addIngredient = (ingredient) => {
        if (selectedIngredients.length >= 5) return;
        setSelectedIngredients(prev => [...prev, ingredient.id]);
        spawnParticles(ingredient.emoji, 3);
    };

    const removeLastIngredient = () => {
        setSelectedIngredients(prev => prev.slice(0, -1));
    };

    const clearIngredients = () => {
        setSelectedIngredients([]);
    };

    const serveCoffee = () => {
        if (!currentOrder) return;

        const recipe = currentOrder.recipe.ingredients;
        const isCorrect = arraysEqual(recipe.sort(), [...selectedIngredients].sort());

        if (isCorrect) {
            const tip = Math.floor(timeLeft * 2);
            const earned = currentOrder.recipe.price + tip;
            setStats(prev => ({
                ...prev,
                money: prev.money + earned,
                reputation: Math.min(100, prev.reputation + 5),
                customersServed: prev.customersServed + 1,
                currentStreak: prev.currentStreak + 1,
                bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
                level: Math.floor((prev.customersServed + 1) / 10) + 1
            }));
            spawnParticles('💰', 8);
            showMessageFn(`Отлично! +${earned}💰`);
        } else {
            setStats(prev => ({
                ...prev,
                reputation: Math.max(0, prev.reputation - 10),
                currentStreak: 0
            }));
            spawnParticles('😞', 3);
            showMessageFn('Неправильный рецепт! 😞');
        }

        setGamePhase('waiting');
        setCurrentOrder(null);
        setSelectedIngredients([]);
    };

    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        return a.every((val, idx) => val === b[idx]);
    };

    const resetGame = () => {
        setStats({
            money: 50,
            reputation: 50,
            customersServed: 0,
            currentStreak: 0,
            bestStreak: 0,
            level: 1
        });
        setGamePhase('waiting');
    };

    if (stats.reputation <= 0) {
        return (
            <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center space-y-6">
                    <div className="text-8xl">😢</div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-amber-500">Кофейня закрыта</h1>
                    <p className="text-gray-400">Репутация упала до нуля</p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <p className="text-lg">Обслужено клиентов: {stats.customersServed}</p>
                        <p className="text-lg">Лучшая серия: {stats.bestStreak}</p>
                    </div>
                    <motion.button onClick={resetGame} whileTap={{ scale: 0.9 }} className="bg-amber-600 w-full py-4 rounded-xl font-bold">🔄 Попробовать снова</motion.button>
                    <button onClick={() => navigate('/')} className="text-white/40 uppercase text-xs font-black tracking-widest">← в каталог</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1115] text-white overflow-x-hidden relative flex flex-col font-sans">
            {/* Standard Game Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-[2px]">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/game/barista')}
                    className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10 active:scale-95"
                >
                    ← Выйти
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl font-black tracking-tighter bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent italic uppercase"
                >
                    BARISTA
                </motion.div>

                <div className="flex items-center gap-3 bg-amber-500/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-amber-500/20 shadow-xl">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Деньги:</span>
                    <span className="text-xl font-black italic tracking-tighter tabular-nums text-amber-400">
                        {stats.money}💰
                    </span>
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {message && (
                    <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-white text-amber-900 px-6 py-3 rounded-2xl shadow-2xl font-black text-sm uppercase tracking-tight">{message}</motion.div>
                )}
            </AnimatePresence>

            <div className="pt-24 pb-8 px-4 flex-1 flex flex-col items-center max-w-lg mx-auto w-full">
                {/* Stats Bar */}
                <div className="w-full grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Уровень</p>
                        <p className="text-xl font-black text-amber-400">{stats.level}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Репутация</p>
                        <p className="text-xl font-black text-emerald-400">{stats.reputation}%</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Серия</p>
                        <p className="text-xl font-black text-amber-500">{stats.currentStreak}🔥</p>
                    </div>
                </div>

                {/* Main Game Area */}
                <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 mb-6 shadow-2xl relative min-h-[300px] flex flex-col">
                    <AnimatePresence>
                        {particles.map(p => (
                            <motion.div key={p.id} initial={{ opacity: 1, y: 0, x: p.x, scale: 0 }} animate={{ opacity: 0, y: -100, scale: 2 }} transition={{ duration: 1.5, delay: p.delay }} className="absolute left-1/2 top-1/2 text-3xl pointer-events-none z-30">{p.emoji}</motion.div>
                        ))}
                    </AnimatePresence>

                    {gamePhase === 'waiting' ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10">
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl mb-8">🛎️</motion.div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startNewOrder}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-amber-900/20 uppercase tracking-widest"
                            >
                                Принять заказ
                            </motion.button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            {/* Customer & Order */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                                        {currentOrder?.customer.emoji}
                                    </div>
                                    <div>
                                        <p className="font-black text-white/40 uppercase text-[10px] tracking-widest mb-1">{currentOrder?.customer.name}</p>
                                        <p className="text-xl font-black italic tracking-tighter text-amber-400">{currentOrder?.recipe.name}</p>
                                    </div>
                                </div>
                                <div className={`text-2xl font-black tabular-nums ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                                    {timeLeft}с
                                </div>
                            </div>

                            {/* Recipe Hint */}
                            <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 text-center">Рецепт</p>
                                <div className="flex gap-3 justify-center flex-wrap">
                                    {currentOrder?.recipe.ingredients.map((ing, i) => {
                                        const ingData = INGREDIENTS.find(x => x.id === ing);
                                        return (
                                            <div key={i} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl shadow-sm">
                                                {ingData?.emoji}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Cup with ingredients */}
                            <div className="flex items-center justify-center gap-6 mb-4">
                                <div className="relative w-28 h-32 bg-gradient-to-b from-stone-600/20 to-stone-800/40 backdrop-blur-md rounded-b-[2rem] rounded-t-lg border-4 border-white/10 flex flex-col-reverse items-center justify-start overflow-hidden shadow-2xl">
                                    {selectedIngredients.map((ing, i) => {
                                        const ingData = INGREDIENTS.find(x => x.id === ing);
                                        return (
                                            <motion.div key={i} initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`w-full h-6 bg-gradient-to-r ${ingData?.color} flex items-center justify-center border-t border-white/10`}>
                                                <span className="text-[10px] font-black uppercase text-white/40">{ingData?.name}</span>
                                            </motion.div>
                                        );
                                    })}
                                    {selectedIngredients.length === 0 && <p className="text-[10px] font-black uppercase tracking-widest text-white/10 absolute top-1/2">Пусто</p>}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={removeLastIngredient} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 shadow-lg text-xl">↩️</motion.button>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={clearIngredients} className="bg-red-500/20 hover:bg-red-500/30 p-4 rounded-2xl border border-red-500/20 shadow-lg text-xl">🗑️</motion.button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ingredients Grid */}
                {gamePhase === 'making' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 mb-6">
                        <div className="grid grid-cols-4 gap-3">
                            {INGREDIENTS.map(ing => (
                                <motion.button
                                    key={ing.id}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => addIngredient(ing)}
                                    className="bg-white/5 hover:bg-white/10 aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition border border-white/5 active:bg-white/20"
                                >
                                    <span className="text-2xl">{ing.emoji}</span>
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-white/40">{ing.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Action Button */}
                {gamePhase === 'making' && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={serveCoffee}
                        disabled={selectedIngredients.length === 0}
                        className={`w-full py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all uppercase tracking-widest ${selectedIngredients.length > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-900/20' : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}`}
                    >
                        Подать ☕
                    </motion.button>
                )}
            </div>

            {/* Ambient background effects */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-amber-900/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-full h-full bg-stone-900 blur-[120px] rounded-full" />
            </div>
        </div>
    );
};

export default CoffeeMakerPlay;
