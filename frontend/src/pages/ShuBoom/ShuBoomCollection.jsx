import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../components/UserProvider';
import { Loader, Star, Coins } from 'lucide-react';


import BottomNav from './BottomNav';
import axios from 'axios';
import { useNotification } from '../../components/NotificationProvider';
import moneyPng from './images/money.PNG';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const USER_PHONE = "7770000000";

const ShuBoomCollection = () => {
    const { show } = useNotification();
    const { user } = useUser();
    const [promotions, setPromotions] = useState([]);
    const [collection, setCollection] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [promoRes, collRes] = await Promise.all([
                    axios.get(`${API_URL}/promotions`),
                    axios.get(`${API_URL}/collection/${USER_PHONE}`)
                ]);
                setPromotions(promoRes.data);
                setCollection(collRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
                show("Ошибка загрузки инвентаря", 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const allItems = [
        ...promotions.map(p => ({ ...p, type: 'coupon', name: p.title, img: p.image_url, desc: p.description })),
        ...collection.map(item => ({
            id: item.character.id,
            type: 'skin',
            name: item.character.name,
            img: item.character.image_2d,
            desc: `${item.character.rarity} • Lvl ${item.level} (x${item.quantity})`
        }))
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
            {/* Header */}
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <div className="w-9" />
                <h1 className="font-black text-lg text-gray-800">Инвентарь</h1>

                <div className="flex flex-col items-end gap-1.5">
                    <div className="bg-slate-100/80 px-2 py-1 rounded-full text-slate-600 text-[10px] font-bold flex items-center gap-1 border border-slate-200 shadow-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{user?.balance_points || 0}</span>
                    </div>
                    <div className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-yellow-100 shadow-sm">
                        <span>🪙</span>
                        {user?.coins || 0}
                    </div>
                </div>
            </div>


            {/* Unified Content */}
            <div className="px-4 py-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center py-10 text-gray-400">
                        <Loader className="w-8 h-8 animate-spin" />
                    </div>
                ) : allItems.length > 0 ? (
                    allItems.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 relative overflow-hidden">
                            {/* Category Chip */}
                            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-wider ${item.type === 'coupon' ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'
                                }`}>
                                {item.type === 'coupon' ? 'КУПОН' : 'ПЕРСОНАЖ'}
                            </div>

                            <div className={`w-16 h-16 rounded-xl shrink-0 overflow-hidden flex items-center justify-center ${item.type === 'skin' ? 'bg-slate-50' : 'bg-orange-50'
                                }`}>
                                <img src={item.img} alt={item.name} className={`w-full h-full ${item.type === 'skin' ? 'object-contain p-2 opacity-80' : 'object-cover'}`} />
                            </div>
                            <div className="flex-1 min-w-0 pr-16">
                                <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.desc}</p>

                                <button className={`mt-2 text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform ${item.type === 'coupon' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {item.type === 'coupon' ? 'ИСПОЛЬЗОВАТЬ' : 'ВЫБРАТЬ'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        Ваш инвентарь пуст
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default ShuBoomCollection;
