import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconCheck, IconTarget, IconUsers, IconShoppingBag, IconCamera } from '../../../components/GameIcons';

const QUESTS = [
    { id: 1, title: "Праздничный набор", desc: "Купи набор из 5+ позиций", reward: "10 ⚡ + Золотой изюм", type: 'upsell', progress: 0, total: 1, claimed: false },
    { id: 2, title: "Разнообразие вкусов", desc: "Купи: сладкое + мясное + хлеб", reward: "Уникальные предметы", type: 'cross-sell', progress: 0, total: 1, claimed: false },
    { id: 3, title: "Постоянный гость", desc: "Соверши 3 покупки за неделю", reward: "Скин 'Наурыз'", type: 'retention', progress: 1, total: 3, claimed: false },
    { id: 4, title: "Расскажи друзьям", desc: "Выложи сторис с отметкой Shu", reward: "Скин 'Ханская юрта'", type: 'viral', progress: 0, total: 1, claimed: false },
    { id: 5, title: "Зови гостей", desc: "Пригласи 3 друзей", reward: "10 ⚡ + Баурсаки", type: 'referral', progress: 1, total: 3, claimed: false },
];

const QuestModal = ({ isOpen, onClose, onClaim }) => {
    if (!isOpen) return null;

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
                    className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl relative pointer-events-auto max-h-[80vh] flex flex-col"
                >
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Задания</h2>
                        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 overflow-y-auto scrollbar-hide space-y-3">
                        {QUESTS.map(quest => (
                            <div key={quest.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                                    ${quest.type === 'upsell' ? 'bg-purple-100 text-purple-600' : ''}
                                    ${quest.type === 'cross-sell' ? 'bg-green-100 text-green-600' : ''}
                                    ${quest.type === 'retention' ? 'bg-blue-100 text-blue-600' : ''}
                                    ${quest.type === 'viral' ? 'bg-pink-100 text-pink-600' : ''}
                                    ${quest.type === 'referral' ? 'bg-orange-100 text-orange-600' : ''}
                                `}>
                                    {quest.type === 'upsell' && <IconShoppingBag className="w-6 h-6" />}
                                    {quest.type === 'cross-sell' && <IconShoppingBag className="w-6 h-6" />}
                                    {quest.type === 'retention' && <IconTarget className="w-6 h-6" />}
                                    {quest.type === 'viral' && <IconCamera className="w-6 h-6" />}
                                    {quest.type === 'referral' && <IconUsers className="w-6 h-6" />}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 text-sm">{quest.title}</h3>
                                    <p className="text-xs text-slate-500 mb-2">{quest.desc}</p>

                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-slate-800 rounded-full"
                                            style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                        <span>{quest.progress}/{quest.total}</span>
                                        <span className="font-bold text-orange-500">Награда: {quest.reward}</span>
                                    </div>
                                </div>

                                <button
                                    disabled={quest.progress < quest.total || quest.claimed}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                        ${quest.claimed
                                            ? 'bg-slate-100 text-slate-400'
                                            : quest.progress >= quest.total
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 active:scale-95'
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {quest.claimed ? <IconCheck className="w-4 h-4" /> : 'Забрать'}
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QuestModal;
