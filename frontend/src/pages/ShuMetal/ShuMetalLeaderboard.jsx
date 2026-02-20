import React from 'react';
import { motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import { SHU_METAL_WORKSHOPS } from './gameData';
import { IconTrophy, IconUsers, IconShield, IconChart } from '../../components/GameIcons';

const ShuMetalLeaderboard = () => {
    // Calculate final scores based on Sum / Count formula from documentation
    const rankedWorkshops = [...SHU_METAL_WORKSHOPS].map(ws => ({
        ...ws,
        avgScore: Math.round(ws.stats.score / ws.stats.coworkers)
    })).sort((a, b) => b.avgScore - a.avgScore);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans pb-28">
            <div className="relative z-10 px-6 pt-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-orange-500 italic uppercase">БИТВА ЦЕХОВ</h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Промышленный рейтинг: Смена 1</p>
                    </div>
                    <IconTrophy className="w-10 h-10 text-orange-500 opacity-30 shadow-[0_0_20px_rgba(249,115,22,0.2)]" />
                </div>

                {/* Formula Header */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 mb-8 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <IconChart className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Формула победы</h3>
                        <p className="text-[11px] text-zinc-500 leading-tight">Сумма AluCoins цеха / Количество сотрудников. Шансы равны для всех!</p>
                    </div>
                </div>

                <div className="space-y-4 mb-10">
                    {rankedWorkshops.map((ws, i) => (
                        <motion.div
                            key={ws.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`
                                relative p-4 rounded-2xl flex items-center gap-4 overflow-hidden group
                                ${i === 0 ? 'bg-orange-500/10 border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 'bg-zinc-900/30 border border-zinc-800/60'}
                            `}
                        >
                            {i === 0 && (
                                <div className="absolute top-0 right-0 p-1 bg-orange-500 text-black text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-lg">
                                    ТЕКУЩИЙ ЛИДЕР
                                </div>
                            )}

                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0
                                ${i === 0 ? 'bg-orange-500 text-black' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}
                            `}>
                                {i + 1}
                            </div>

                            <div className="flex-1">
                                <h3 className={`font-bold text-sm leading-none mb-1.5 ${i === 0 ? 'text-orange-400' : 'text-zinc-300'}`}>
                                    {ws.name}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 opacity-60">
                                        <IconUsers className="w-3 h-3" />
                                        <span className="text-[10px] font-bold">{ws.stats.coworkers.toLocaleString()} чел.</span>
                                    </div>
                                    <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                    <div className="flex items-center gap-1 text-orange-500/60">
                                        <span className="text-[10px] font-black">Ср. балл: {ws.avgScore.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {i === 0 && (
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="shrink-0"
                                >
                                    <IconShield className="w-6 h-6 text-orange-500/40" />
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Winners Rewards Section */}
                <div className="bg-zinc-950 border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
                    <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <IconTrophy className="w-4 h-4 text-orange-500" />
                        Награды победителям
                    </h2>

                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { title: 'Премия +10%', desc: 'К месячной зарплате всему цеху' },
                            { title: '+2000 AluCoins', desc: 'Каждому сотруднику победителя' },
                            { title: 'Бейдж «Легенда»', desc: 'Особый статус в профиле сотрудника' },
                            { title: 'Кубок Титанов', desc: 'Переходит в лучший цех на месяц' }
                        ].map((reward, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 bg-zinc-900/50 rounded-xl border border-zinc-800/40">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                                <div>
                                    <h4 className="text-[11px] font-black text-orange-400 uppercase leading-none mb-1">{reward.title}</h4>
                                    <p className="text-[10px] text-zinc-500 leading-tight">{reward.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default ShuMetalLeaderboard;
