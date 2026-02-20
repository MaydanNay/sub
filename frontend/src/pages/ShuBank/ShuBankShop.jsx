import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconCoin } from '../../components/GameIcons';

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

const SHOP_ITEMS = [
    { id: 'skin_1', name: 'Бизнес-образ #1', price: 1000, category: 'skin', icon: skin1 },
    { id: 'skin_2', name: 'Бизнес-образ #2', price: 1500, category: 'skin', icon: skin2 },
    { id: 'skin_3', name: 'Бизнес-образ #3', price: 2000, category: 'skin', icon: skin3 },
    { id: 'skin_4', name: 'Бизнес-образ #4', price: 2500, category: 'skin', icon: skin4 },
    { id: 'skin_5', name: 'Бизнес-образ #5', price: 3000, category: 'skin', icon: skin5 },
    { id: 'skin_6', name: 'Бизнес-образ #6', price: 3500, category: 'skin', icon: skin6 },
    { id: 'skin_7', name: 'Бизнес-образ #7', price: 4000, category: 'skin', icon: skin7 },
    { id: 'skin_8', name: 'Бизнес-образ #8', price: 4500, category: 'skin', icon: skin8 },
    { id: 'skin_9', name: 'Бизнес-образ #9', price: 5000, category: 'skin', icon: skin9 },
];

const ShuBankShop = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('shubank_stats');
        return saved ? JSON.parse(saved) : { coins: 0, inventory: [] };
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        localStorage.setItem('shubank_stats', JSON.stringify(stats));
    }, [stats]);

    const showMessageFn = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleBuy = (item) => {
        if (stats.inventory.includes(item.id)) {
            // If already owned, maybe just apply it (future logic)
            showMessageFn("Этот скин уже куплен!");
            return;
        }

        if (stats.coins < item.price) {
            showMessageFn("Недостаточно монет! 🪙");
            return;
        }

        setStats(prev => ({
            ...prev,
            coins: prev.coins - item.price,
            inventory: [...prev.inventory, item.id]
        }));
        showMessageFn(`${item.name} куплен! ✨`);
    };

    return (
        <div className="h-screen bg-slate-950 flex justify-center">
            <div
                className="relative w-full max-w-md h-full text-slate-900 font-sans transition-colors duration-1000 overflow-hidden flex flex-col bg-cover bg-center bg-no-repeat shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                style={{ backgroundImage: `url(${backgroundPng})` }}
            >
                <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
                    <button onClick={() => navigate('/game/shubank/play')} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                        <IconArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="bg-white/40 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/20 shadow-lg">
                        <IconCoin className="w-5 h-5 text-amber-500" />
                        <span className="font-black tabular-nums">{stats.coins}</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-6 pt-24 pb-12 scrollbar-hide">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8 drop-shadow-lg">Магазин Образов</h2>

                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-orange-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap"
                                >
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-2 gap-4">
                            {SHOP_ITEMS.map(item => {
                                const isOwned = stats.inventory.includes(item.id);
                                const canAfford = stats.coins >= item.price;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-5 flex flex-col items-center text-center shadow-xl border border-white/20 ${!canAfford && !isOwned ? 'opacity-80' : ''}`}
                                    >
                                        <div className="w-24 h-24 mb-4 bg-slate-50 rounded-3xl p-2">
                                            <img src={item.icon} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
                                        </div>
                                        <div className="flex items-center gap-1 text-orange-500 font-black text-[11px] mb-4">
                                            {isOwned ? (
                                                <span className="text-green-600 uppercase">В коллекции</span>
                                            ) : (
                                                <>
                                                    <span>{item.price}</span>
                                                    <IconCoin className="w-3 h-3" />
                                                </>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleBuy(item)}
                                            disabled={isOwned || !canAfford}
                                            className={`w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${isOwned
                                                ? 'bg-green-500 text-white cursor-default'
                                                : canAfford
                                                    ? 'bg-slate-900 text-white hover:scale-105 active:scale-95'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {isOwned ? 'Куплено' : 'Купить'}
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ShuBankShop;
