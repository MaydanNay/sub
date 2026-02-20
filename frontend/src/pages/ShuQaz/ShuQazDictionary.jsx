import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DICTIONARY } from './qazData';
import { useNavigate } from 'react-router-dom';

const ShuQazDictionary = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const filteredWords = DICTIONARY.filter(w => {
        const matchesSearch = w.kz.toLowerCase().includes(search.toLowerCase()) || w.ru.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || w.status === filter;
        return matchesSearch && matchesFilter;
    });

    const statusColors = {
        'Master': 'bg-green-100 text-green-700 border-green-200',
        'Learning': 'bg-blue-100 text-blue-700 border-blue-200',
        'New': 'bg-slate-100 text-slate-500 border-slate-200'
    };

    return (
        <div className="w-full h-full min-h-[100dvh] bg-[#F0F4F8] text-[#2D3748] font-sans flex justify-center items-center overflow-hidden relative">
            <div className="w-full max-w-[480px] h-full bg-white shadow-2xl overflow-hidden relative border-x border-slate-200 flex flex-col">

                {/* Header */}
                <div className="p-4 pb-2 bg-white border-b border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => navigate('/game/shuqaz')} className="text-slate-400 text-2xl">←</button>
                        <h1 className="text-2xl font-black text-slate-800">Сандық</h1>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Поиск слов..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-10 text-sm font-medium focus:outline-none focus:border-blue-400 transition-colors"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 italic">🔍</span>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        {['All', 'Master', 'Learning', 'New'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border
                                    ${filter === f ? 'bg-blue-500 text-white border-blue-600 shadow-md' : 'bg-white text-slate-400 border-slate-200'}
                                `}
                            >
                                {f === 'All' ? 'Все' : f === 'Master' ? 'Знаю' : f === 'Learning' ? 'Учу' : 'Новые'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Word List */}
                <div className="flex-grow overflow-y-auto p-6 space-y-3">
                    {filteredWords.map(word => (
                        <motion.div
                            key={word.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border-2 border-slate-100 rounded-3xl p-4 flex justify-between items-center hover:border-blue-100 transition-colors cursor-pointer group"
                        >
                            <div>
                                <div className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors">{word.kz}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{word.ru}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${statusColors[word.status]}`}>
                                    {word.status}
                                </span>
                                <span className="text-[10px] font-black text-slate-300 italic">{word.level}</span>
                            </div>
                        </motion.div>
                    ))}

                    {filteredWords.length === 0 && (
                        <div className="text-center py-20 opacity-40">
                            <span className="text-6xl block mb-4">📭</span>
                            <p className="text-sm font-bold uppercase tracking-widest">Ничего не найдено</p>
                        </div>
                    )}
                </div>

                {/* Audio Button Overlay (Mock) */}
                <div className="absolute bottom-8 right-8 pointer-events-none">
                    <button className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-xl flex items-center justify-center text-2xl pointer-events-auto active:scale-95 transition-transform">
                        🔊
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShuQazDictionary;
