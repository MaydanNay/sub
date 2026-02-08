import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SheepTamagotchiPlay = () => {
    const navigate = useNavigate();

    // Game State
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('sheep_stats');
        return saved ? JSON.parse(saved) : {
            hunger: 80,
            happiness: 80,
            money: 100,
            xp: 0,
            luck: 50,
            isWalking: false,
            walkEndTime: null,
            isDead: false
        };
    });

    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('sheep_inventory');
        return saved ? JSON.parse(saved) : [];
    });

    const [equipped, setEquipped] = useState(() => {
        const saved = localStorage.getItem('sheep_equipped');
        return saved ? JSON.parse(saved) : { hat: null, accessory: null };
    });

    const [activeTab, setActiveTab] = useState('main');
    const [message, setMessage] = useState(null);
    const [showShop, setShowShop] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [walkTimeRemaining, setWalkTimeRemaining] = useState(null);
    const [particles, setParticles] = useState([]);

    // Constants
    const MAX_STAT = 100;
    const WALK_DURATION_MS = 2 * 60 * 60 * 1000;

    // Items Database
    const SHOP_ITEMS = [
        { id: 'apple', name: 'Яблоко', type: 'food', price: 10, value: 15, icon: '🍎', desc: '+15 hunger' },
        { id: 'carrot', name: 'Морковь', type: 'food', price: 8, value: 10, icon: '🥕', desc: '+10 hunger' },
        { id: 'cookie', name: 'Печенье', type: 'food', price: 15, value: 20, icon: '🍪', desc: '+20 happiness' },
        { id: 'cake', name: 'Тортик', type: 'food', price: 30, value: 40, icon: '🍰', desc: '+40 happiness' },
        { id: 'pizza', name: 'Пицца', type: 'food', price: 50, value: 60, icon: '🍕', desc: '+60 hunger' },
        { id: 'sushi', name: 'Суши', type: 'food', price: 80, value: 80, icon: '🍣', desc: '+80 hunger' },
        { id: 'ball', name: 'Мячик', type: 'toy', price: 40, value: 25, icon: '⚽', desc: '+25 happiness' },
        { id: 'teddy', name: 'Мишка', type: 'toy', price: 60, value: 35, icon: '🧸', desc: '+35 happiness' },
        { id: 'kite', name: 'Воздушн.змей', type: 'toy', price: 80, value: 45, icon: '🪁', desc: '+45 happiness' },
        { id: 'gamepad', name: 'Геймпад', type: 'toy', price: 120, value: 60, icon: '🎮', desc: '+60 happiness' },
        { id: 'hat_top', name: 'Цилиндр', type: 'hat', price: 150, icon: '🎩', desc: 'Классика' },
        { id: 'crown', name: 'Корона', type: 'hat', price: 300, icon: '👑', desc: 'Король!' },
        { id: 'cap', name: 'Кепка', type: 'hat', price: 80, icon: '🧢', desc: 'Стиль' },
        { id: 'party_hat', name: 'Колпак', type: 'hat', price: 50, icon: '🎉', desc: 'Праздник' },
        { id: 'cowboy', name: 'Ковбойская', type: 'hat', price: 200, icon: '🤠', desc: 'Йи-ха!' },
        { id: 'glasses', name: 'Очки', type: 'accessory', price: 100, icon: '👓', desc: 'Умник' },
        { id: 'sunglasses', name: 'Солнечные', type: 'accessory', price: 120, icon: '🕶️', desc: 'Крутой' },
        { id: 'bow', name: 'Бантик', type: 'accessory', price: 80, icon: '🎀', desc: 'Милота' },
        { id: 'scarf', name: 'Шарф', type: 'accessory', price: 90, icon: '🧣', desc: 'Тепло' },
        { id: 'medal', name: 'Медаль', type: 'accessory', price: 250, icon: '🏅', desc: 'Чемпион' },
        { id: 'necklace', name: 'Ожерелье', type: 'accessory', price: 180, icon: '📿', desc: 'Блеск' },
    ];

    const PLACES = [
        { id: 'cafe', name: 'Кафе', luckBonus: 10, cost: 25, icon: '☕', cooldown: 25000 },
        { id: 'spa', name: 'SPA', luckBonus: 20, cost: 70, icon: '💆', cooldown: 50000 },
        { id: 'park', name: 'Парк', luckBonus: 15, cost: 40, icon: '🎢', cooldown: 35000 },
        { id: 'temple', name: 'Храм', luckBonus: 35, cost: 120, icon: '⛩️', cooldown: 90000 },
        { id: 'casino', name: 'Казино', luckBonus: 50, cost: 200, icon: '🎰', cooldown: 120000 },
        { id: 'cinema', name: 'Кино', luckBonus: 12, cost: 35, icon: '🎬', cooldown: 30000 },
    ];

    const TASKS = [
        { id: 'shear', name: 'Постричь', reward: 40, cooldown: 8000, icon: '✂️' },
        { id: 'graze', name: 'Пастись', reward: 15, cooldown: 4000, icon: '🌿' },
        { id: 'pet_show', name: 'Выставка', reward: 120, cooldown: 45000, icon: '🏆' },
        { id: 'dance', name: 'Танцевать', reward: 30, cooldown: 6000, icon: '💃' },
        { id: 'sing', name: 'Петь', reward: 25, cooldown: 5000, icon: '🎤' },
        { id: 'model', name: 'Фотосессия', reward: 80, cooldown: 20000, icon: '📸' },
    ];

    const [taskCooldowns, setTaskCooldowns] = useState({});
    const [placeCooldowns, setPlaceCooldowns] = useState({});

    useEffect(() => {
        if (stats.isWalking && stats.walkEndTime) {
            const checkWalk = setInterval(() => {
                const now = Date.now();
                if (now >= stats.walkEndTime) {
                    const survivalChance = stats.luck;
                    const roll = Math.random() * 100;
                    if (roll > survivalChance) {
                        setStats(prev => ({ ...prev, isWalking: false, walkEndTime: null, isDead: true }));
                        showMessageFn("Овечка не вернулась... 😢💀");
                    } else {
                        const moneyEarned = 200 + Math.floor(Math.random() * 300);
                        setStats(prev => ({
                            ...prev,
                            isWalking: false,
                            walkEndTime: null,
                            money: prev.money + moneyEarned,
                            happiness: Math.min(MAX_STAT, prev.happiness + 50),
                            xp: prev.xp + 100
                        }));
                        spawnParticles('💰', 8);
                        showMessageFn(`Вернулся! +${moneyEarned}💰`);
                    }
                    clearInterval(checkWalk);
                } else {
                    setWalkTimeRemaining(stats.walkEndTime - now);
                }
            }, 1000);
            return () => clearInterval(checkWalk);
        }
    }, [stats.isWalking, stats.walkEndTime, stats.luck]);

    useEffect(() => {
        if (stats.isDead) return;
        const interval = setInterval(() => {
            setStats(prev => {
                if (prev.isWalking) return prev;
                return { ...prev, hunger: Math.max(0, prev.hunger - 1), happiness: Math.max(0, prev.happiness - 1) };
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [stats.isDead]);

    useEffect(() => {
        localStorage.setItem('sheep_stats', JSON.stringify(stats));
        localStorage.setItem('sheep_inventory', JSON.stringify(inventory));
        localStorage.setItem('sheep_equipped', JSON.stringify(equipped));
    }, [stats, inventory, equipped]);

    const showMessageFn = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(null), 2500);
    };

    const spawnParticles = (emoji, count = 5) => {
        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: Date.now() + i,
            emoji,
            x: Math.random() * 200 - 100,
            delay: Math.random() * 0.3
        }));
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 2000);
    };

    const startWalk = () => {
        if (stats.isWalking) return showMessageFn("Уже гуляет! 🚶");
        if (stats.luck < 20) return showMessageFn("Мало удачи! 🍀");
        setStats(prev => ({ ...prev, isWalking: true, walkEndTime: Date.now() + WALK_DURATION_MS }));
        showMessageFn(`Ушёл гулять! 🚶 (${stats.luck}%)`);
    };

    const visitPlace = (place) => {
        const now = Date.now();
        if (placeCooldowns[place.id] && now < placeCooldowns[place.id]) return showMessageFn("Подожди ⏳");
        if (stats.money < place.cost) return showMessageFn("Нет монет 💸");
        setStats(prev => ({ ...prev, money: prev.money - place.cost, luck: Math.min(MAX_STAT, prev.luck + place.luckBonus), happiness: Math.min(MAX_STAT, prev.happiness + 10) }));
        setPlaceCooldowns(prev => ({ ...prev, [place.id]: now + place.cooldown }));
        spawnParticles('🍀', 6);
        showMessageFn(`+${place.luckBonus} 🍀`);
    };

    const feedSheep = (item) => {
        if (stats.hunger >= MAX_STAT) return showMessageFn("Не голоден! 🤢");
        setStats(prev => ({ ...prev, hunger: Math.min(MAX_STAT, prev.hunger + item.value), xp: prev.xp + 5 }));
        consumeItem(item);
        spawnParticles('😋', 4);
    };

    const playWithSheep = (item) => {
        if (stats.happiness >= MAX_STAT) return showMessageFn("Счастлив! 😄");
        setStats(prev => ({ ...prev, happiness: Math.min(MAX_STAT, prev.happiness + item.value), xp: prev.xp + 10 }));
        consumeItem(item);
        spawnParticles('🎉', 6);
    };

    const buyItem = (item) => {
        if (stats.money >= item.price) {
            setStats(prev => ({ ...prev, money: prev.money - item.price }));
            setInventory(prev => [...prev, item]);
            spawnParticles('✨', 4);
            showMessageFn(`Куплено!`);
        } else showMessageFn("Нет монет 💸");
    };

    const consumeItem = (item) => {
        const index = inventory.findIndex(i => i.id === item.id);
        if (index > -1) {
            const newInv = [...inventory];
            newInv.splice(index, 1);
            setInventory(newInv);
        }
    };

    const equipItem = (item) => {
        setEquipped(prev => ({ ...prev, [item.type]: item }));
        spawnParticles('💫', 5);
        showMessageFn(`Надето!`);
    };

    const performTask = (task) => {
        const now = Date.now();
        if (taskCooldowns[task.id] && now < taskCooldowns[task.id]) return showMessageFn("Подожди ⏳");
        setStats(prev => ({ ...prev, money: prev.money + task.reward, xp: prev.xp + 15, hunger: Math.max(0, prev.hunger - 5), happiness: Math.max(0, prev.happiness - 5) }));
        setTaskCooldowns(prev => ({ ...prev, [task.id]: now + task.cooldown }));
        spawnParticles('💰', 5);
        showMessageFn(`+${task.reward} 💰`);
    };

    const resetGame = () => {
        localStorage.removeItem('sheep_stats');
        localStorage.removeItem('sheep_inventory');
        localStorage.removeItem('sheep_equipped');
        window.location.reload();
    };

    const formatTime = (ms) => {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const getMood = () => {
        if (stats.isDead) return "dead";
        if (stats.isWalking) return "walking";
        if (stats.hunger < 20) return "sick";
        if (stats.happiness < 30) return "sad";
        if (stats.hunger < 50) return "hungry";
        return "happy";
    };

    const renderSheep = () => {
        const mood = getMood();
        const faces = { dead: '💀', walking: '🚶', sick: '🤢', sad: '😢', hungry: '🥺', happy: '🐑' };
        return (
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                <AnimatePresence>
                    {particles.map(p => (
                        <motion.div key={p.id} initial={{ opacity: 1, y: 0, x: p.x, scale: 0 }} animate={{ opacity: 0, y: -100, scale: 1.5, rotate: p.x }} exit={{ opacity: 0 }} transition={{ duration: 1.5, delay: p.delay }} className="absolute text-3xl pointer-events-none z-30">{p.emoji}</motion.div>
                    ))}
                </AnimatePresence>
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-[60px] animate-pulse" />
                <motion.div
                    animate={mood === 'happy' ? { y: [0, -20, 0], rotate: [0, 5, -5, 0] } : mood === 'walking' ? { x: [-10, 10, -10] } : { scale: [1, 0.95, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-8xl sm:text-9xl relative z-10 cursor-pointer drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {faces[mood]}
                    {equipped.hat && !stats.isDead && <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: -55, opacity: 1 }} className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl sm:text-6xl drop-shadow-lg">{equipped.hat.icon}</motion.div>}
                    {equipped.accessory && !stats.isDead && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-10 left-1/2 -translate-x-1/2 text-4xl sm:text-5xl z-20 drop-shadow-md">{equipped.accessory.icon}</motion.div>}
                </motion.div>
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-4 w-32 h-8 bg-black/40 rounded-[100%] blur-2xl" />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white overflow-hidden relative flex flex-col font-sans">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
                <div className="flex items-center gap-3">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/game/sheep')}
                        className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10 active:scale-95"
                    >
                        ← Выйти
                    </motion.button>
                </div>

                <div className="flex gap-3">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-indigo-500/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-indigo-500/20 shadow-xl flex items-center gap-2">
                        <span className="text-indigo-400 font-black text-xs uppercase tracking-widest">Ур.</span>
                        <span className="text-lg font-black tabular-nums">{Math.floor(stats.xp / 100) + 1}</span>
                    </motion.div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white/5 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        <span className="text-lg font-black tabular-nums">{stats.money}</span>
                    </motion.div>
                </div>
            </div>

            {/* Walking State Overlay */}
            <AnimatePresence>
                {stats.isWalking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[70] flex flex-col items-center justify-center p-8 text-center">
                        <motion.div animate={{ x: [-20, 20, -20], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-9xl mb-8">🚶🐑</motion.div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">В приключении...</h2>
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 mb-8 max-w-xs w-full">
                            <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em] mb-2">Осталось:</p>
                            <p className="text-4xl font-black italic tracking-tighter tabular-nums">{walkTimeRemaining ? formatTime(walkTimeRemaining) : '...'}</p>
                        </div>
                        <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">Ваша удача: {stats.luck}% 🍀</p>
                        <button onClick={() => navigate('/game/sheep')} className="mt-12 text-slate-500 hover:text-white font-black text-xs uppercase tracking-[0.4em] transition-colors">Вернуться в меню</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pt-24 pb-48 flex flex-col items-center px-6">
                <AnimatePresence>
                    {message && (
                        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] bg-indigo-600 text-white px-8 py-3 rounded-2xl shadow-[0_20px_40px_rgba(79,70,229,0.3)] font-black text-xs uppercase tracking-widest border border-indigo-400">{message}</motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg">
                    {renderSheep()}

                    <div className="grid grid-cols-3 gap-4 w-full mt-12 mb-8">
                        {[
                            { label: '🍖 Голод', value: stats.hunger, color: 'from-pink-500 to-rose-600', glow: 'shadow-pink-500/20' },
                            { label: '😊 Счастье', value: stats.happiness, color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20' },
                            { label: '🍀 Удача', value: stats.luck, color: 'from-emerald-400 to-teal-600', glow: 'shadow-emerald-500/20' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-4 border border-white/10 flex flex-col items-center shadow-2xl relative overflow-hidden group">
                                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">{s.label}</span>
                                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden shadow-inner relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.value}%` }}
                                        className={`h-full bg-gradient-to-r ${s.color} rounded-full transition-all duration-500 ${s.glow} shadow-[0_0_15px]`}
                                    />
                                </div>
                                <span className="text-[11px] font-black text-white mt-2 tabular-nums">{Math.round(s.value)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Center - Floating Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-8 z-50">
                <div className="max-w-md mx-auto h-24 bg-slate-900/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex items-center justify-around px-6">
                    <NavBtn emoji="🏠" label="Дом" active={activeTab === 'main'} onClick={() => setActiveTab('main')} />
                    <NavBtn emoji="🍀" label="Места" active={activeTab === 'places'} onClick={() => setActiveTab('places')} />
                    <NavBtn emoji="🛠️" label="Работа" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <NavBtn emoji="🛍️" label="Шоп" onClick={() => setShowShop(true)} />
                    <NavBtn emoji="🎒" label="Инв." badge={inventory.length} onClick={() => setShowInventory(true)} />
                </div>
            </div>

            {/* Modals */}
            <GameModal isOpen={showShop} onClose={() => setShowShop(false)} title="МАГАЗИН" icon="🛍️">
                <div className="space-y-6">
                    <div className="bg-indigo-600/10 rounded-3xl p-6 border border-indigo-500/20 flex justify-between items-center">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Баланс:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">💰</span>
                            <span className="text-2xl font-black">{stats.money}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {SHOP_ITEMS.map(item => (
                            <ShopCard key={item.id} item={item} onBuy={() => buyItem(item)} canAfford={stats.money >= item.price} />
                        ))}
                    </div>
                </div>
            </GameModal>

            <GameModal isOpen={showInventory} onClose={() => setShowInventory(false)} title="ИНВЕНТАРЬ" icon="🎒">
                {inventory.length === 0 ? (
                    <div className="py-20 text-center opacity-30">
                        <span className="text-9xl block mb-6">🏜️</span>
                        <p className="font-black text-xs uppercase tracking-[0.4em]">Пусто...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {inventory.map((item, idx) => (
                            <InvCard key={idx} item={item} onUse={() => {
                                if (item.type === 'food') feedSheep(item);
                                else if (item.type === 'toy') playWithSheep(item);
                                else equipItem(item);
                            }} />
                        ))}
                    </div>
                )}
            </GameModal>

            {/* Places and Tasks Overlay Panels (Simplified Contextual Displays) */}
            <AnimatePresence>
                {activeTab !== 'main' && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-36 left-0 right-0 z-40 px-8">
                        <div className="max-w-md mx-auto bg-slate-800/90 backdrop-blur-2xl rounded-[3rem] p-6 border border-white/10 shadow-2xl max-h-[40vh] overflow-y-auto scrollbar-hide">
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">{activeTab === 'places' ? 'ЛОКАЦИИ' : 'ЗАДАНИЯ'}</h3>
                                <button onClick={() => setActiveTab('main')} className="text-slate-500 hover:text-white text-[10px] font-black uppercase">✕</button>
                            </div>
                            <div className="space-y-3">
                                {activeTab === 'places' ? (
                                    PLACES.map(place => <PlaceRow key={place.id} place={place} cooldown={placeCooldowns[place.id] > Date.now()} onClick={() => visitPlace(place)} />)
                                ) : (
                                    TASKS.map(task => <TaskRow key={task.id} task={task} cooldown={taskCooldowns[task.id] > Date.now()} onClick={() => performTask(task)} />)
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-[150px] animate-pulse" />
            </div>

            {/* Death Screen */}
            <AnimatePresence>
                {stats.isDead && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center">
                        <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="text-9xl mb-12">💀</motion.div>
                        <h1 className="text-4xl font-black mb-4 tracking-tighter text-white uppercase italic">Овечка ушла...</h1>
                        <p className="text-slate-500 font-bold mb-12 max-w-xs leading-relaxed uppercase text-[10px] tracking-widest">Удача — капризная штука. Попробуй ещё раз, следя за шансом выживания.</p>
                        <div className="flex flex-col gap-4 w-full max-w-xs">
                            <motion.button onClick={resetGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-indigo-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 border border-indigo-400">Начать новую жизнь</motion.button>
                            <motion.button onClick={() => navigate('/game/sheep')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white/5 text-slate-400 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] border border-white/5">В меню</motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub-components (Replaced previous ones) ---

const NavBtn = ({ emoji, label, active, onClick, badge }) => (
    <motion.button
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={`flex flex-col items-center gap-1 transition-all relative ${active ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'}`}
    >
        <span className="text-3xl">{emoji}</span>
        <span className="text-[9px] font-black text-white uppercase tracking-widest">{label}</span>
        {badge > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                {badge}
            </span>
        )}
        {active && <motion.div layoutId="active-indicator" className="absolute -bottom-2 w-1 h-1 bg-indigo-500 rounded-full" />}
    </motion.button>
);

const GameModal = ({ isOpen, onClose, title, icon, children }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-end sm:items-center justify-center p-4">
                <motion.div initial={{ y: "100%", scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: "100%", scale: 0.9 }} className="bg-slate-900 ring-1 ring-white/10 rounded-[3rem] p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-[0_50px_100px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{icon}</span>
                            <h2 className="text-3xl font-black tracking-tighter italic uppercase">{title}</h2>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors">✕</button>
                    </div>
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const ShopCard = ({ item, onBuy, canAfford }) => (
    <div className={`p-5 rounded-[2.5rem] flex flex-col items-center text-center transition-all bg-white/5 border border-white/5 group hover:bg-white/10 ${!canAfford && 'opacity-50 grayscale'}`}>
        <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</span>
        <span className="text-xs font-black mb-1 uppercase tracking-wider">{item.name}</span>
        <span className="text-[10px] font-bold text-slate-500 mb-4 h-8">{item.desc}</span>
        <button
            onClick={onBuy}
            disabled={!canAfford}
            className={`w-full py-3 rounded-2xl font-black text-[11px] tracking-widest transition-all ${canAfford ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
        >
            {item.price} 💰
        </button>
    </div>
);

const InvCard = ({ item, onUse }) => (
    <div className="p-5 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col items-center text-center hover:bg-white/10 transition-all">
        <span className="text-5xl mb-4">{item.icon}</span>
        <span className="text-xs font-black mb-4 uppercase tracking-wider">{item.name}</span>
        <button onClick={onUse} className="w-full py-3 bg-white/10 hover:bg-indigo-600 text-white rounded-2xl font-black text-[11px] tracking-widest transition-all uppercase">
            {item.type === 'food' ? 'Кормить' : item.type === 'toy' ? 'Играть' : 'Надеть'}
        </button>
    </div>
);

const PlaceRow = ({ place, cooldown, onClick }) => (
    <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-4">
            <span className="text-3xl">{place.icon}</span>
            <div>
                <p className="font-black text-xs text-white uppercase tracking-tight">{place.name}</p>
                <p className="text-[10px] font-black text-emerald-400/80 uppercase">+{place.luckBonus} Удача 🍀</p>
            </div>
        </div>
        <button onClick={onClick} disabled={cooldown} className={`px-6 py-2.5 rounded-2xl text-[11px] font-black tracking-widest transition-all ${cooldown ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-lg active:scale-95'}`}>
            {cooldown ? '⏳' : `${place.cost}💰`}
        </button>
    </div>
);

const TaskRow = ({ task, cooldown, onClick }) => (
    <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-4">
            <span className="text-3xl">{task.icon}</span>
            <div>
                <p className="font-black text-xs text-white uppercase tracking-tight">{task.name}</p>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">+{task.reward} наград 💰</p>
            </div>
        </div>
        <button onClick={onClick} disabled={cooldown} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all ${cooldown ? 'bg-white/5 text-slate-600' : 'bg-indigo-600 text-white active:scale-95'}`}>
            {cooldown ? '⏳' : 'РАБОТАТЬ'}
        </button>
    </div>
);

export default SheepTamagotchiPlay;
