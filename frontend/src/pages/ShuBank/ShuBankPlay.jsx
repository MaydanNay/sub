import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    IconJerboa, IconCoin, IconChart, IconZap, IconPlus, IconShoppingBag,
    IconTrophy, IconArrowLeft, IconUsers, IconTarget
} from '../../components/GameIcons';

import charPng from './images/pers/0.PNG';
import backgroundPng from './images/local.PNG';

import skin1 from './images/skins/1.PNG';
import skin2 from './images/skins/2.PNG';
import skin3 from './images/skins/3.PNG';
import skin4 from './images/skins/4.PNG';
import skin5 from './images/skins/5.PNG';
import skin6 from './images/skins/6.PNG';
import skin7 from './images/skins/7.PNG';
import skin8 from './images/skins/8.PNG';
import skin9 from './images/skins/9.PNG';

import pers1 from './images/pers/1.PNG';
import pers2 from './images/pers/2.PNG';
import pers3 from './images/pers/3.PNG';
import pers4 from './images/pers/4.PNG';
import pers5 from './images/pers/5.PNG';
import pers6 from './images/pers/6.PNG';
import pers7 from './images/pers/7.PNG';
import pers8 from './images/pers/8.PNG';
import pers9 from './images/pers/9.PNG';

const ShuBankPlay = () => {
    const navigate = useNavigate();

    // Game Stats (Aligned with Tech Spec 1.0)
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('shubank_stats');
        const defaultStats = {
            energy: 50,
            calmness: 0,
            coins: 0,
            transactionCount: 0,
            home_level: 1,
            inventory: [], // Store item_ids
            quests_completed: [], // Store quest_ids
            last_transaction_at: Date.now(),
            tushkan_name: 'ShuBank'
        };

        if (!saved) return defaultStats;

        const parsed = JSON.parse(saved);
        return {
            ...defaultStats,
            ...parsed,
            inventory: parsed.inventory || [],
            quests_completed: parsed.quests_completed || []
        };
    });

    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('main');
    const [isAnimating, setIsAnimating] = useState(null);
    const [minigame, setMinigame] = useState(null); // null, clicker, quiz
    const [clickCount, setClickCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [quizIndex, setQuizIndex] = useState(0);

    const QUIZ_DATA = [
        { q: "Что лучше всего снижает риск инфляции?", a: ["Депозит", "Наличные под подушкой", "Траты на сладости"], correct: 0 },
        { q: "Как называется процент, начисляемый на процент?", a: ["Сложный процент", "Легкий процент", "Кэшбэк"], correct: 0 },
        { q: "Какая подушка безопасности считается нормой?", a: ["3-6 окладов", "1 оклад", "Броситься в кредит"], correct: 0 },
        { q: "Что такое овердрафт для бизнеса?", a: ["Краткосрочный кредит при нехватке средств", "Штраф за опоздание", "Вид банковской карты"], correct: 0 },
        { q: "Зачем нужен расчетно-кассовый узел (РКО)?", a: ["Для ведения бизнеса и расчетов", "Для хранения личных сбережений", "Для покупки акций"], correct: 0 },
        { q: "Что дает страхование бизнес-рисков?", a: ["Финансовую защиту от форс-мажоров", "Гарантированную прибыль", "Скидки на аренду"], correct: 0 }
    ];

    const QUESTS_DATA = [
        { id: 'dance_kara', title: 'Биле! Қара Жорға', desc: 'Заставь ShuBank танцевать', reward: 50 },
        { id: 'qr_pay', title: 'QR-платеж', desc: 'Соверши покупку через QR-код', reward: 100 },
        { id: 'save_money', title: 'Копилка', desc: 'Накопи монеты в мини-игре', reward: 150 },
        { id: 'quiz_master', title: 'Мастер Квиза', desc: 'Ответь на все вопросы квиза', reward: 200 },
        { id: 'cashback_goal', title: 'Кэшбэк-мастер', desc: 'Получи повышенный кэшбэк недели', reward: 120 },
        { id: 'mobile_topup', title: 'Баланс+', desc: 'Пополни мобильный через приложение', reward: 80 }
    ];

    // Tech Spec 1.0 Shop Config
    const SHOP_ITEMS = [
        { id: 'skin_1', name: 'Бизнес-образ #1', price: 1000, category: 'skin', icon: skin1, character: pers1 },
        { id: 'skin_2', name: 'Бизнес-образ #2', price: 1500, category: 'skin', icon: skin2, character: pers2 },
        { id: 'skin_3', name: 'Бизнес-образ #3', price: 2000, category: 'skin', icon: skin3, character: pers3 },
        { id: 'skin_4', name: 'Бизнес-образ #4', price: 2500, category: 'skin', icon: skin4, character: pers4 },
        { id: 'skin_5', name: 'Бизнес-образ #5', price: 3000, category: 'skin', icon: skin5, character: pers5 },
        { id: 'skin_6', name: 'Бизнес-образ #6', price: 3500, category: 'skin', icon: skin6, character: pers6 },
        { id: 'skin_7', name: 'Бизнес-образ #7', price: 4000, category: 'skin', icon: skin7, character: pers7 },
        { id: 'skin_8', name: 'Бизнес-образ #8', price: 4500, category: 'skin', icon: skin8, character: pers8 },
        { id: 'skin_9', name: 'Бизнес-образ #9', price: 5000, category: 'skin', icon: skin9, character: pers9 },
    ];

    // Determine current character image based on latest skin in inventory
    const getCharacterImage = () => {
        const skinsInInventory = stats.inventory.filter(id => id.startsWith('skin_'));
        if (skinsInInventory.length === 0) return charPng;
        const latestSkinId = skinsInInventory[skinsInInventory.length - 1];
        const latestSkin = SHOP_ITEMS.find(item => item.id === latestSkinId);
        return latestSkin ? latestSkin.character : charPng;
    };

    const currentCharacterImage = getCharacterImage();

    const houses = [
        { level: 1, name: 'Земляная Нора', color: 'bg-stone-500', emoji: '🕳️' },
        { level: 2, name: 'Уютная Нора', color: 'bg-amber-100', emoji: '🏠' },
        { level: 3, name: 'Кибер-Нора', color: 'bg-indigo-900', emoji: '🎮' },
        { level: 4, name: 'Пентхаус', color: 'bg-gradient-to-br from-yellow-400 to-amber-600', emoji: '👑' }
    ];

    useEffect(() => {
        localStorage.setItem('shubank_stats', JSON.stringify(stats));
    }, [stats]);

    // Tech Spec 1.0: -5 energy every 24h (Simulated for demo)
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                energy: Math.max(0, prev.energy - 0.005) // Aligned with -5 energy per 24h (~0.2 per hour)
            }));
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // Clicker logic handler
    useEffect(() => {
        let interval;
        if (minigame === 'clicker' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && minigame === 'clicker') {
            setMinigame(null);
            setStats(prev => ({ ...prev, coins: prev.coins + clickCount }));
            showMessageFn(`Игра окончена! Заработано ${clickCount} 🪙`);
            completeQuest('save_money');
        }
        return () => clearInterval(interval);
    }, [minigame, timeLeft, clickCount]);

    const showMessageFn = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(null), 3000);
    };

    const completeQuest = (questId) => {
        if (stats.quests_completed.includes(questId)) return;
        const quest = QUESTS_DATA.find(q => q.id === questId);
        if (quest) {
            setStats(prev => ({
                ...prev,
                coins: prev.coins + quest.reward,
                quests_completed: [...prev.quests_completed, questId]
            }));
            showMessageFn(`Квест выполнен: ${quest.title}! +${quest.reward}🪙`);
        }
    };

    const handleQuizAnswer = (optionIndex) => {
        const currentQ = QUIZ_DATA[quizIndex];
        if (optionIndex === currentQ.correct) {
            setStats(prev => ({ ...prev, coins: prev.coins + 50 }));
            showMessageFn("Верно! +50🪙");
            setIsAnimating('success');
            completeQuest('quiz_master');
        } else {
            showMessageFn("Не совсем... Попробуй еще! 🧐");
        }

        if (quizIndex < QUIZ_DATA.length - 1) {
            setQuizIndex(v => v + 1);
        } else {
            setMinigame(null);
            setQuizIndex(0);
        }
    };

    const handleBuy = (item) => {
        navigate('/game/shubank/shop');
    };

    const handleTransaction = () => {
        setStats(prev => ({
            ...prev,
            energy: Math.min(100, prev.energy + 10),
            coins: prev.coins + 10,
            transactionCount: (prev.transactionCount || 0) + 1,
            last_transaction_at: Date.now()
        }));
        showMessageFn("Транзакция! +10⚡ +10🪙");
        setIsAnimating('success');
        setTimeout(() => setIsAnimating(null), 2000);
    };

    const handleDeposit = (amount) => {
        setStats(prev => {
            const newBalance = (prev.depositBalance || 0) + amount;
            let calmness = 0;
            if (newBalance >= 1000000) calmness = 100;
            else if (newBalance >= 200000) calmness = 80;
            else if (newBalance >= 50000) calmness = 50;

            let newLevel = prev.home_level;
            if (newBalance >= 1000000) newLevel = 4;
            else if (newBalance >= 200000) newLevel = 3;
            else if (newBalance >= 50000) newLevel = 2;

            return {
                ...prev,
                depositBalance: newBalance,
                calmness: calmness,
                home_level: newLevel
            };
        });
        showMessageFn(`Баланс обновлен! Спокойствие: ${Math.floor(amount / 1000)}💙`);
    };

    const startClicker = () => {
        setClickCount(0);
        setTimeLeft(10);
        setMinigame('clicker');
    };

    const currentHouse = houses[stats.home_level - 1];

    // Tech Spec 1.0: Animations based on state
    const tushkanState = stats.calmness === 0 ? 'critical' : stats.energy > 80 && stats.calmness >= 80 ? 'success' : 'normal';

    return (
        <div className="h-screen bg-slate-950 flex justify-center">
            <div
                className="relative w-full max-w-md h-full text-slate-900 font-sans transition-colors duration-1000 overflow-hidden flex flex-col bg-cover bg-center bg-no-repeat shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                style={{ backgroundImage: `url(${backgroundPng})` }}
            >
                <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
                    <button onClick={() => navigate('/game/shubank')} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg"><IconArrowLeft className="w-6 h-6" /></button>
                    <div className="flex gap-4">
                        <div className="bg-white/40 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/20 shadow-lg">
                            <IconCoin className="w-5 h-5 text-amber-500" />
                            <span className="font-black tabular-nums">{stats.coins}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24 pb-48 relative overflow-y-auto scrollbar-hide">
                    <motion.div key={stats.home_level} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">{currentHouse.emoji} {currentHouse.name}</h2>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">УРОВЕНЬ {stats.home_level}</p>
                    </motion.div>

                    <AnimatePresence>
                        {message && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-48 z-[100] bg-orange-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest">{message}</motion.div>}
                    </AnimatePresence>

                    <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-10">
                        <HUDCard label="Энергия" value={stats.energy} color="bg-orange-500" icon={<IconZap className="w-4 h-4" />} />
                        <HUDCard label="Спокойствие" value={stats.calmness} color="bg-blue-500" icon={<IconChart className="w-4 h-4" />} />
                    </div>

                    <div className="relative w-72 h-72 flex items-center justify-center mb-6">
                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-4 w-52 h-14 bg-black/40 rounded-full blur-3xl" />

                        {/* Render Furniture */}
                        {stats.inventory.includes('item_mining_farm') && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute -right-12 bottom-12 text-5xl">📟</motion.div>
                        )}

                        <motion.div
                            animate={
                                isAnimating === 'success' ? { y: [0, -40, 0], scale: [1, 1.2, 1] } :
                                    tushkanState === 'critical' ? { x: [-3, 3, -3, 3, 0] } :
                                        { y: [0, -10, 0] }
                            }
                            transition={tushkanState === 'critical' ? { repeat: Infinity, duration: 0.1 } : { repeat: Infinity, duration: 2 }}
                            className="relative z-10 w-56 h-56 cursor-pointer"
                            onClick={() => {
                                setIsAnimating('dance');
                                setTimeout(() => setIsAnimating(null), 2000);
                                completeQuest('dance_kara');
                            }}
                        >
                            <img
                                src={currentCharacterImage}
                                alt="character"
                                className={`w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${stats.calmness >= 100 ? 'filter sepia(1) saturate(5) hue-rotate(40deg)' : ''}`}
                            />
                            {tushkanState === 'critical' && <div className="absolute -top-4 -right-4 text-4xl">😰</div>}
                            {stats.calmness >= 100 && <div className="absolute -top-4 -right-4 text-4xl">👑</div>}
                        </motion.div>
                    </div>
                </main>

                <nav className="absolute bottom-0 left-0 right-0 z-50 p-6">
                    <div className="max-w-md mx-auto h-24 bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl flex items-center justify-around px-4">
                        <TabBtn active={activeTab === 'main'} icon={<IconJerboa />} label="ShuBank" onClick={() => setActiveTab('main')} />
                        <TabBtn active={activeTab === 'games'} icon={<IconTarget />} label="Игры" onClick={() => setActiveTab('games')} />
                        <TabBtn active={activeTab === 'social'} icon={<IconUsers />} label="Бонусы" onClick={() => setActiveTab('social')} />
                        <TabBtn active={activeTab === 'shop'} icon={<IconShoppingBag />} label="Магазин" onClick={() => navigate('/game/shubank/shop')} />
                    </div>
                </nav>

                <AnimatePresence>
                    {activeTab === 'games' && (
                        <OverlayPanel title="Мини-игры" onClose={() => setActiveTab('main')}>
                            <div className="space-y-4">
                                <GameRow title="Копилка" desc="Тапай! 1 клик = 1 монета" icon="🪙" onClick={startClicker} />
                                <GameRow title="Финансовый Квиз" desc="Заработай 50 монет за ответ" icon="🎓" onClick={() => setMinigame('quiz')} />
                                <GameRow title="Степной забег" desc="Скоро!" icon="🏃" onClick={() => showMessageFn("В разработке")} />
                            </div>
                        </OverlayPanel>
                    )}
                    {activeTab === 'social' && (
                        <OverlayPanel title="Программа Лояльности" onClose={() => setActiveTab('main')}>
                            <div className="space-y-4">
                                {QUESTS_DATA.map(quest => (
                                    <QuestRow
                                        key={quest.id}
                                        title={quest.title}
                                        desc={quest.desc}
                                        reward={quest.reward}
                                        done={stats.quests_completed.includes(quest.id)}
                                    />
                                ))}
                                <hr className="border-slate-100 my-4" />
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Лиги Лояльности</h4>
                                <PrideRow name="Золотая Лига" members="1240" goal="LVL 10" progress={45} />
                                <PrideRow name="Серебряная Лига" members="8500" goal="LVL 5" progress={80} />
                            </div>
                        </OverlayPanel>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {minigame === 'clicker' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-amber-500 flex flex-col items-center justify-center p-8">
                            <h2 className="text-4xl font-black text-white mb-2 italic">ТАПАЙ!</h2>
                            <div className="text-8xl font-black text-white/50 mb-12">{clickCount}</div>
                            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setClickCount(c => c + 1)} className="w-40 h-40 bg-white rounded-full flex items-center justify-center text-7xl">🪙</motion.button>
                            <p className="mt-12 text-white font-bold uppercase tracking-widest text-sm">Время: {timeLeft} сек</p>
                        </motion.div>
                    )}
                    {minigame === 'quiz' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-indigo-600 flex flex-col items-center justify-center p-8">
                            <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl">
                                <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight italic">
                                    Вопрос {quizIndex + 1}/{QUIZ_DATA.length}
                                </h2>
                                <p className="text-lg font-bold text-slate-600 mb-10">{QUIZ_DATA[quizIndex].q}</p>
                                <div className="space-y-4">
                                    {QUIZ_DATA[quizIndex].a.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuizAnswer(i)}
                                            className="w-full py-4 px-6 bg-slate-100 hover:bg-indigo-100 rounded-2xl text-left font-black text-sm transition-colors border-2 border-transparent hover:border-indigo-500"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setMinigame(null)} className="mt-8 text-slate-400 font-bold uppercase text-[10px] tracking-widest block w-full text-center">Выйти</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute top-24 right-6 flex flex-col gap-4 z-40">
                    <SimBtn icon={<IconZap />} onClick={handleTransaction} />
                    <SimBtn icon={<IconPlus />} onClick={() => handleDeposit(10000)} />
                </div>
            </div>
        </div>
    );
};

const HUDCard = ({ label, value, color, icon }) => (
    <div className="bg-white/20 backdrop-blur-md rounded-[2rem] p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
            <div className="text-white/60">{icon}</div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">{label}</span>
        </div>
        <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${value}%` }} className={`h-full ${color}`} />
        </div>
    </div>
);

const TabBtn = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-white scale-110' : 'text-white/40'}`}>
        <div className="w-6 h-6">{React.cloneElement(icon, { className: 'w-full h-full' })}</div>
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

const OverlayPanel = ({ title, children, onClose }) => (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-x-0 bottom-24 z-[60] px-6">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 shadow-2xl max-h-[50vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black tracking-tighter uppercase italic">{title}</h3>
                <button onClick={onClose} className="text-slate-400">✕</button>
            </div>
            {children}
        </div>
    </motion.div>
);

const GameRow = ({ title, desc, icon, onClick }) => (
    <div onClick={onClick} className="flex items-center gap-4 bg-slate-100 p-4 rounded-3xl cursor-pointer hover:bg-slate-200 transition-colors">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
            <h4 className="font-bold text-sm">{title}</h4>
            <p className="text-[10px] text-slate-500">{desc}</p>
        </div>
        <div className="text-orange-500 font-black">▶</div>
    </div>
);

const PrideRow = ({ name, members, goal, progress }) => (
    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
        <div className="flex justify-between mb-2">
            <div>
                <h4 className="font-black text-xs uppercase tracking-tight">{name}</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase">{members} человек • Цель: {goal}</p>
            </div>
            <div className="text-blue-600 font-black text-xs">{progress}%</div>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
        </div>
    </div>
);

const SimBtn = ({ icon, onClick }) => (
    <button onClick={onClick} className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-xl hover:bg-white/40 transition-all">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
    </button>
);

const QuestRow = ({ title, desc, reward, done }) => (
    <div className={`flex items-center gap-4 p-4 rounded-3xl border ${done ? 'bg-green-50 border-green-100 opacity-60' : 'bg-slate-50 border-slate-100'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${done ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {done ? '✓' : '🎯'}
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-sm">{title}</h4>
            <p className="text-[10px] text-slate-500">{desc}</p>
        </div>
        <div className="text-right">
            <div className="text-orange-500 font-black text-xs">+{reward}🪙</div>
            {done && <div className="text-[8px] font-black text-green-600 uppercase">Готово</div>}
        </div>
    </div>
);

export default ShuBankPlay;
