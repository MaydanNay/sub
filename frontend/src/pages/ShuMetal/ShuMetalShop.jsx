import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import { SHU_METAL_SHOP } from './gameData';
import coinImage from './images/alucoin.png';

const ShuMetalShop = () => {
    const categories = ['Все', 'Мерч', 'Комфорт', 'Гаджеты', 'Эмоции', 'Семья'];
    const [activeCategory, setActiveCategory] = useState('Все');

    const filteredItems = activeCategory === 'Все'
        ? SHU_METAL_SHOP
        : SHU_METAL_SHOP.filter(item => item.category === activeCategory);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans pb-28">
            <div className="relative z-10 px-6 pt-12">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-orange-500 italic uppercase">МАГАЗИН</h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none pr-4">Эксклюзивные награды за AluCoins</p>
                    </div>
                    <div className="bg-zinc-900 border border-orange-500/20 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg shadow-orange-500/5">
                        <img src={coinImage} alt="Coin" className="w-4 h-4" />
                        <span className="text-sm font-black text-orange-500">1,250</span>
                    </div>
                </div>

                {/* Category Selector */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shrink-0
                                ${activeCategory === cat
                                    ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl overflow-hidden flex flex-col group hover:border-orange-500/30 transition-colors"
                            >
                                <div className="h-32 relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent z-10" />
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                                    <div className="absolute bottom-2 left-2 z-20 text-[8px] font-black uppercase tracking-widest text-orange-400 bg-black/60 px-1.5 py-0.5 rounded border border-orange-500/20">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-3 flex-1 flex flex-col">
                                    <h3 className="text-[11px] font-bold mb-3 leading-tight h-8 line-clamp-2 text-zinc-100">
                                        {item.name}
                                    </h3>
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-zinc-800">
                                            <img src={coinImage} alt="Coin" className="w-3 h-3" />
                                            <span className="text-xs font-black text-orange-500">{item.price.toLocaleString()}</span>
                                        </div>
                                        <button className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-black active:scale-90 transition-transform shadow-lg shadow-orange-500/20 hover:bg-orange-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredItems.length === 0 && (
                    <div className="py-20 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        На складе наград<br />пусто в этой категории
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default ShuMetalShop;
