import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconCoin, IconLightning, IconShoppingBag, IconCamera } from '../../../components/GameIcons';

const ShopModal = ({ isOpen, onClose, coins, onBuyEnergy, onBuyItem, onOpenScan }) => {
    if (!isOpen) return null;

    const OFFERS = [
        { id: 'item', title: "Ингредиент", desc: "Случайный продукт (ур. 1)", price: 20, icon: "📦", action: () => onBuyItem(20) },
        { id: 'energy', title: "Энергия", desc: "+5 энергии", price: 50, icon: "⚡", action: () => onBuyEnergy(50, 5) },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none"
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl relative pointer-events-auto flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-slate-800">Магазин</h2>
                            <div className="flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full">
                                <span className="text-xs">🪙</span>
                                <span className="text-xs font-bold text-amber-700">{coins}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 overflow-y-auto scrollbar-hide space-y-6">
                        {/* Coin Offers */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">За монеты</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {OFFERS.map(offer => (
                                    <button
                                        key={offer.id}
                                        onClick={offer.action}
                                        disabled={coins < offer.price}
                                        className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden
                                            ${coins >= offer.price
                                                ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 active:scale-95'
                                                : 'bg-slate-50 border-slate-100 grayscale opacity-70 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        <div className="text-3xl mb-1">{offer.icon}</div>
                                        <div className="text-center">
                                            <div className="font-bold text-slate-800 leading-tight">{offer.title}</div>
                                            <div className="text-[10px] text-slate-500">{offer.desc}</div>
                                        </div>
                                        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                                            ${coins >= offer.price ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}
                                        `}>
                                            {offer.price} 🪙
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Special Offers (O2O) */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Спецпредложения</h3>
                            <button
                                onClick={() => { onClose(); onOpenScan(); }}
                                className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <IconCamera className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Восстановить энергию</div>
                                        <div className="text-xs text-blue-100">Сканируй чек из Shu Bakery</div>
                                    </div>
                                </div>
                                <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold group-hover:scale-105 transition-transform">
                                    Бесплатно
                                </div>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ShopModal;
