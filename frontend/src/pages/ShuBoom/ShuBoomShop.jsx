import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Star, ShoppingBag, Coffee, Shirt, Tag } from 'lucide-react';


import axios from 'axios';
import confetti from 'canvas-confetti';
import BottomNav from './BottomNav';
import { useNotification } from '../../components/NotificationProvider';
import GameLoader from './GameLoader';

import { useUser } from '../../components/UserProvider';
import moneyPng from './images/money.PNG';
import boxPng from './images/box.PNG';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const OFFERS = [
    { id: 'promo1', title: '1+1 Кофе', cost: 500, img: '☕', bg: 'bg-orange-50 text-orange-600' },
    { id: 'promo2', title: 'Скидка 20%', cost: 300, img: '🏷️', bg: 'bg-blue-50 text-blue-600' },
    { id: 'promo3', title: 'XP Буст', cost: 1000, img: '⚡', bg: 'bg-yellow-50 text-yellow-600' },
];

const FOOD = [
    { id: 'croissant', title: 'Круассан', cost: 150, img: '🥐' },
    { id: 'donut', title: 'Пончик', cost: 120, img: '🍩' },
    { id: 'latte', title: 'Латте', cost: 200, img: '☕' },
    { id: 'pizza', title: 'Пицца', cost: 450, img: '🍕' },
];

const SKINS = [
    { id: 'glasses', title: 'Очки', cost: 1000, img: '🕶️' },
    { id: 'hat', title: 'Шляпа', cost: 1500, img: '🎩' },
    { id: 'cape', title: 'Плащ', cost: 2500, img: '🧥' },
];

const ShuBoomShop = () => {
    const { show } = useNotification();
    const { user, userPhone, fetchUser, loading, error } = useUser();
    const [chest, setChest] = useState(null);
    const [prizes, setPrizes] = useState(null);

    // Sync local chest state with global user.pending_chest
    useEffect(() => {
        if (user?.pending_chest) {
            setChest(user.pending_chest);
        }
    }, [user?.pending_chest]);

    const [isActionPending, setIsActionPending] = useState(false);

    const handleBuyChest = async (type, cost) => {
        if (isActionPending) return;
        if (!user || user.coins < cost) {
            show("Недостаточно монет!", 'error');
            return;
        }
        if (!confirm(`Купить ${type} сундук за ${cost} монет?`)) return;

        setIsActionPending(true);
        try {
            const res = await axios.post(`${API_URL}/shop/buy_chest`, null, { params: { chest_type: type, user_phone: userPhone } });
            if (res.data.success) {
                fetchUser();
                setChest(res.data.chest_type);
            }
        } catch (e) {
            show("Ошибка покупки", 'error');
        } finally {
            setIsActionPending(false);
        }
    };

    const handleBuyItem = async (item, type = 'promo') => {
        if (!user || user.coins < item.cost) {
            show("Недостаточно монет!", 'error');
            return;
        }
        if (!confirm(`Купить ${item.title} за ${item.cost}?`)) return;

        setIsActionPending(true);
        try {
            const res = await axios.post(`${API_URL}/shop/buy_item?user_phone=${userPhone}`, {
                item_id: String(item.id),
                item_type: type,
                cost: item.cost
            });
            if (res.data.success) {
                show(`Вы купили ${item.title}!`, 'success');
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                fetchUser();
            }
        } catch (e) {
            show(e.response?.data?.detail || "Ошибка покупки", 'error');
        } finally {
            setIsActionPending(false);
        }
    };

    const openChest = async () => {
        if (!chest || isActionPending) return;
        setIsActionPending(true);
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        try {
            const res = await axios.post(`${API_URL}/chests/open`, null, { params: { chest_type: chest, user_phone: userPhone } });
            setPrizes(res.data); // Store the full response
            fetchUser();
        } catch (e) {
            console.error(e);
            show("Ошибка открытия сундука", 'error');
            setChest(null);
        } finally {
            setIsActionPending(false);
        }
    };

    // Confetti effect for prizes
    useEffect(() => {
        let animationFrameId;
        if (prizes) {
            const end = Date.now() + 1000;
            const colors = ['#bb0000', '#ffffff'];
            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });
                if (Date.now() < end) {
                    animationFrameId = requestAnimationFrame(frame);
                }
            };
            frame();
        }
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [prizes]);

    return (
        <GameLoader loading={loading} error={error} retry={fetchUser}>
            <div className="min-h-screen bg-slate-50 pb-24 font-montserrat" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
                {/* Header */}
                <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                    <div className="w-9" />

                    <h1 className="font-black text-lg text-gray-800 font-montserrat">Магазин</h1>
                    <div className="flex flex-col items-end gap-1.5">
                        <div className="bg-slate-100/80 px-2 py-1 rounded-full text-slate-600 text-[10px] font-bold flex items-center gap-1 border border-slate-200 shadow-sm font-montserrat">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{user?.balance_points || 0}</span>
                        </div>
                        <div className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-yellow-100 shadow-sm font-montserrat">
                            <span>🪙</span>
                            {user?.coins || 0}
                        </div>
                    </div>

                </div>

                {/* Content */}
                <div className="p-4 space-y-8">

                    {/* 1. CHESTS (Main Feature) */}
                    <section>
                        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 font-montserrat">
                            <ShoppingBag className="w-4 h-4 text-purple-500" />
                            Сундуки
                        </h2>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                            {[
                                { type: 'BRONZE', cost: 500, bg: 'bg-orange-50', text: 'text-orange-900', img: '🥉' },
                                { type: 'SILVER', cost: 1000, bg: 'bg-slate-100', text: 'text-slate-900', img: '🥈' },
                                { type: 'GOLD', cost: 2000, bg: 'bg-yellow-50', text: 'text-yellow-900', img: '🥇' },
                                { type: 'LEGENDARY', cost: 5000, bg: 'bg-purple-50', text: 'text-purple-900', img: '👑' },
                            ].map((item) => (
                                <motion.button
                                    key={item.type}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBuyChest(item.type, item.cost)}
                                    className={`shrink-0 w-40 p-4 rounded-2xl ${item.bg} border border-black/5 shadow-sm flex flex-col items-start text-left`}
                                >
                                    <span className="text-3xl mb-2 drop-shadow-sm">{item.img}</span>
                                    <h3 className={`font-black text-xs mb-1 ${item.text} font-montserrat`}>{item.type}</h3>
                                    <div className="mt-auto bg-gray-900 text-white px-2.5 py-1 rounded-xl font-bold text-[12px] shadow-lg flex items-center gap-1.5 w-fit border border-white/10 font-montserrat">
                                        <span className="text-sm">🪙</span>
                                        {item.cost}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </section>

                    {/* 2. SPECIAL OFFERS (Horizontal Scroll) */}
                    <section>
                        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 font-montserrat">
                            <Tag className="w-4 h-4 text-blue-500" />
                            Акции и Спецпредложения
                        </h2>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                            {OFFERS.map(offer => (
                                <motion.div
                                    key={offer.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBuyItem(offer)}
                                    className={`shrink-0 w-40 p-4 rounded-2xl ${offer.bg} border border-black/5 shadow-sm flex flex-col`}
                                >
                                    <span className="text-3xl mb-2">{offer.img}</span>
                                    <h3 className="font-bold text-xs mb-1 font-montserrat">{offer.title}</h3>
                                    <div className="mt-auto bg-gray-900 text-white px-2.5 py-1 rounded-xl font-bold text-[12px] shadow-lg flex items-center gap-1.5 w-fit border border-white/10 font-montserrat">
                                        <span className="text-sm">🪙</span> {offer.cost}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* 3. FOOD & DRINKS */}
                    <section>
                        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 font-montserrat">
                            <Coffee className="w-4 h-4 text-orange-500" />
                            Еда и Напитки
                        </h2>
                        <div className="grid grid-cols-4 gap-2">
                            {FOOD.map(item => (
                                <motion.button
                                    key={item.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBuyItem(item)}
                                    className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center"
                                >
                                    <span className="text-2xl mb-1">{item.img}</span>
                                    <span className="text-[10px] font-bold text-gray-700 leading-tight font-montserrat">{item.title}</span>
                                    <div className="mt-1.5 bg-gray-900 text-white px-2 py-0.5 rounded-lg font-bold text-[10px] shadow-md flex items-center gap-1 w-fit border border-white/10 font-montserrat">
                                        <span>🪙</span> {item.cost}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </section>

                    {/* 4. SKINS */}
                    <section>
                        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 font-montserrat">
                            <Shirt className="w-4 h-4 text-pink-500" />
                            Скины
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {SKINS.map(item => (
                                <motion.button
                                    key={item.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBuyItem(item, 'skin')}
                                    className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 text-left"
                                >
                                    <span className="text-3xl bg-slate-50 p-2 rounded-xl">{item.img}</span>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-800">{item.title}</h3>
                                        <div className="flex items-center gap-1.5 bg-gray-900 text-white px-2.5 py-1 rounded-xl font-bold text-[11px] mt-2 shadow-md w-fit border border-white/10 font-montserrat">
                                            <span className="text-sm">🪙</span> {item.cost}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </section>
                </div>

                <BottomNav onScan={() => { }} />

                {/* Chest & Prize Modals */}
                <AnimatePresence>
                    {chest && !prizes && (
                        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6" onClick={openChest}>
                            <motion.button
                                animate={{ scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-64 h-64 flex items-center justify-center filter drop-shadow-[0_0_50px_rgba(255,215,0,0.3)]"
                            >
                                <img src={boxPng} alt="Chest" className="w-full h-full object-contain" />
                            </motion.button>
                            <p className="absolute bottom-20 text-white font-bold opacity-70 animate-bounce">Нажми, чтобы открыть!</p>
                        </div>
                    )}

                    {prizes && (
                        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 text-center">
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 mb-8">
                                {prizes.prize_type === 'CHARACTER' ? (prizes.is_new ? 'НОВЫЙ ГЕРОЙ!' : 'ЕЩЕ ОДИН!') : 'УРА!'}
                            </h2>
                            <div className="w-64 h-64 rounded-[40px] bg-slate-100 shadow-2xl overflow-hidden mb-8 relative flex items-center justify-center">
                                {prizes.image_url && prizes.image_url.includes('http') ? (
                                    <img src={prizes.image_url} alt={prizes.title} className="w-full h-full object-contain p-4" />
                                ) : (
                                    <span className="text-[100px] drop-shadow-lg">{prizes.image_url}</span>
                                )}
                                {prizes.prize_type === 'CHARACTER' && (
                                    <div className="absolute top-4 right-4 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-lg">
                                        {prizes.character.rarity}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl font-black text-gray-800">{prizes.title}</h3>
                            <p className="text-gray-500 font-medium mb-8 uppercase tracking-widest text-xs">
                                {prizes.prize_type === 'CHARACTER' ? 'Персонаж в коллекцию' : prizes.prize_type}
                            </p>
                            <button onClick={() => { setPrizes(null); setChest(null); }} className="w-full max-w-sm bg-black text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform">
                                {prizes.prize_type === 'CHARACTER' ? 'В Коллекцию' : 'Отлично!'}
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </GameLoader>
    );
};

export default ShuBoomShop;
