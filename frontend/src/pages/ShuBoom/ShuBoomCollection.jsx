import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../components/UserProvider';
import { Star, Coins } from 'lucide-react';
import GameLoader from './GameLoader';
import confetti from 'canvas-confetti';


import BottomNav from './BottomNav';
import axios from 'axios';
import { useNotification } from '../../components/NotificationProvider';
import moneyPng from './images/money.PNG';
import { CHARACTERS } from './gameData';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const ShuBoomCollection = () => {
    const { show } = useNotification();
    const { user, userPhone, fetchUser: fetchGlobalUser, loading: userLoading, error: userError } = useUser();
    const [promotions, setPromotions] = useState([]);
    const [collection, setCollection] = useState([]);
    const [loading, setLoading] = useState(true);
    const [localError, setLocalError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = useCallback(async (signal) => {
        if (!userPhone) return;
        try {
            const [promoRes, collRes] = await Promise.all([
                axios.get(`${API_URL}/promotions`, { signal }),
                axios.get(`${API_URL}/collection/${userPhone}`, { signal })
            ]);
            setPromotions(promoRes.data);
            setCollection(collRes.data);
        } catch (err) {
            if (axios.isCancel(err)) return;
            console.error("Failed to fetch data", err);
            setLocalError("Не удалось загрузить инвентарь");
        } finally {
            setLoading(false);
        }
    }, [userPhone]);

    useEffect(() => {
        const controller = new AbortController();
        if (userPhone) {
            fetchData(controller.signal);
        }
        return () => controller.abort();
    }, [fetchData, userPhone]);

    const allItems = [
        ...promotions
            .filter(p => {
                if (!user?.coupons) return false;
                // Convert to string to avoid type mismatch (int vs string)
                const couponIds = user.coupons.map(c => String(c));
                return couponIds.includes(String(p.id));
            })
            .map(p => ({ ...p, type: 'coupon', name: p.title, img: p.image_url, desc: p.description, isEquipped: false })),
        ...(user?.skins || []).map(skinId => {
            const skinMap = {
                'glasses': { name: 'Очки', img: '🕶️' },
                'hat': { name: 'Шляпа', img: '🎩' },
                'cape': { name: 'Плащ', img: '🦸' },
                'flower': { name: 'Цветочек', img: '🌸' },
                'butterfly': { name: 'Бабочка', img: '🦋' },
                'crown': { name: 'Корона', img: '👑' }
            };
            const skinInfo = skinMap[skinId] || { name: `Скин: ${skinId}`, img: '👗' };
            return { id: skinId, type: 'skin_overlay', name: skinInfo.name, img: skinInfo.img, desc: 'Особый аксессуар', isEquipped: false };
        }),
        ...collection.map(item => {
            const gameChar = CHARACTERS.find(c => c.name === item.character.name);
            return {
                id: item.character.id,
                type: 'character',
                name: item.character.name,
                img: gameChar ? gameChar.avatar : item.character.image_2d,
                isAsset: !!gameChar,
                desc: `${item.character.rarity} • Lvl ${item.level} (x${item.quantity})`,
                quantity: item.quantity,
                level: item.level,
                isEquipped: String(user?.equipped_character_id) === String(item?.character?.id)
            };
        })
    ];

    const handleRetry = () => {
        setLoading(true);
        setLocalError(null);
        fetchGlobalUser();
        fetchData();
    };

    const handleSelect = async (item) => {
        if (!userPhone || item.isEquipped || actionLoading) return;
        setActionLoading(true);
        try {
            if (item.type === 'coupon') {
                const res = await axios.post(`${API_URL}/user/use_coupon?user_phone=${userPhone}&coupon_id=${item.id}`);
                if (res.data.success) {
                    show(`${item.name} успешно использован!`, 'success');
                    fetchData();
                    fetchGlobalUser();
                }
            } else {
                const res = await axios.post(`${API_URL}/user/equip?user_phone=${userPhone}`, {
                    character_id: item.type === 'character' ? item.id : null,
                    skin_id: item.type === 'skin_overlay' ? item.id : null
                });
                if (res.data.success) {
                    show(`${item.name} выбрано!`, 'success');
                    fetchGlobalUser();
                }
            }
        } catch (err) {
            show("Ошибка", 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMerge = async (characterId) => {
        if (!userPhone || actionLoading) return;
        setActionLoading(true);
        try {
            const res = await axios.post(`${API_URL}/collection/merge?user_phone=${userPhone}`, { character_id: characterId });
            if (res.data.success) {
                show(`Персонаж улучшен! Новый уровень: ${res.data.new_level}`, 'success');
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                fetchData();
                fetchGlobalUser();
            }
        } catch (err) {
            show(err.response?.data?.detail || "Ошибка слияния", 'error');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <GameLoader
            loading={userLoading || loading}
            error={userError || localError}
            retry={handleRetry}
            message="Загрузка инвентаря..."
        >
            <div className="min-h-screen bg-slate-50 pb-24 font-montserrat" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
                <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                    <div className="w-9" />
                    <h1 className="font-black text-lg text-gray-800 font-montserrat">Инвентарь</h1>

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

                <div className="px-4 py-4 space-y-3">
                    {allItems.length > 0 ? (
                        allItems.map((item, idx) => (
                            <div key={idx} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all flex gap-4 relative overflow-hidden ${item.isEquipped ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-100'}`}>
                                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-wider font-montserrat ${item.type === 'coupon' ? 'bg-indigo-50 text-indigo-600' : item.type === 'skin_overlay' ? 'bg-amber-50 text-amber-600' : 'bg-pink-50 text-pink-600'}`}>
                                    {item.isEquipped ? 'ИСПОЛЬЗУЕТСЯ' : item.type === 'coupon' ? 'КУПОН' : item.type === 'skin_overlay' ? 'СКИН' : 'ПЕРСОНАЖ'}
                                </div>
                                <div className={`w-16 h-16 rounded-xl shrink-0 overflow-hidden flex items-center justify-center ${item.type === 'character' ? 'bg-slate-50' : 'bg-orange-50'}`}>
                                    {item.img && (typeof item.img === 'string' && (item.img.includes('http') || item.isAsset)) ? (
                                        <img src={item.img} alt={item.name} className={`w-full h-full ${item.type === 'character' ? 'object-contain p-2 opacity-80' : 'object-cover'}`} />
                                    ) : (
                                        <span className="text-4xl drop-shadow-md">{item.img}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pr-16 font-montserrat">
                                    <h3 className="font-bold text-gray-800 text-sm font-montserrat">{item.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 font-montserrat">{item.desc}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleSelect(item)}
                                            disabled={item.isEquipped || actionLoading}
                                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform ${item.isEquipped ? 'bg-green-500 text-white' : item.type === 'coupon' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'} ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {item.isEquipped ? 'ВЫБРАНО' : item.type === 'coupon' ? 'ИСПОЛЬЗОВАТЬ' : 'ВЫБРАТЬ'}
                                        </button>
                                        {item.type === 'character' && item.quantity >= 3 && item.level === 1 && (
                                            <button
                                                onClick={() => handleMerge(item.id)}
                                                disabled={actionLoading}
                                                className={`bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform shadow-md ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                МЕРДЖ (3)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-400 text-sm">Ваш инвентарь пуст</div>
                    )}
                </div>

                <BottomNav />
            </div>
        </GameLoader>
    );
};

export default ShuBoomCollection;
