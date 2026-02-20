import React from 'react';
import { motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import { SHU_METAL_TASKS, SHU_METAL_DAILY_QUESTS } from './gameData';
import {
    IconLightning,
    IconEye,
    IconShield,
    IconBrain,
    IconUsers,
    IconClock,
    IconTarget,
    IconZap,
    IconHeart,
    IconTrophy
} from '../../components/GameIcons';

const iconMap = {
    Eye: IconEye,
    Shield: IconShield,
    Lightbulb: IconBrain,
    CheckCircle: IconTarget,
    Users: IconUsers,
    Clock: IconClock,
    Zap: IconZap,
    Heart: IconHeart,
    Trophy: IconTrophy,
    Brain: IconBrain
};

const ShuMetalTasks = () => {
    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans pb-28">
            <div className="relative z-10 px-6 pt-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-orange-500 italic uppercase">ЗАДАНИЯ</h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Рабочий протокол: Активен</p>
                    </div>
                    <div className="group relative">
                        <div className="absolute inset-[-4px] bg-orange-500/20 rounded-xl blur-lg animate-pulse" />
                        <div className="relative w-12 h-12 rounded-xl border border-orange-500/30 flex items-center justify-center bg-zinc-900 shadow-lg">
                            <IconLightning className="w-6 h-6 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Daily Quests Section */}
                <div className="mb-10">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-wider">Дейлики</h2>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Обновление в 06:00</p>
                        </div>
                        <div className="text-[10px] text-orange-500 font-bold uppercase border-b border-orange-500/30 pb-0.5">3/3 Доступно</div>
                    </div>

                    <div className="space-y-3">
                        {SHU_METAL_DAILY_QUESTS.map((quest, i) => {
                            const Icon = iconMap[quest.icon] || IconZap;
                            return (
                                <motion.div
                                    key={quest.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-gradient-to-r from-orange-500/10 to-transparent border-l-2 border-orange-500 p-3 flex items-center gap-4 active:bg-orange-500/20 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-orange-400">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xs font-bold leading-none mb-1">{quest.title}</h3>
                                        <div className="text-[10px] text-orange-500 font-black">+{quest.reward} AluCoins</div>
                                    </div>
                                    <button className="text-[10px] font-black text-zinc-500 border border-zinc-500/30 px-2 py-1 rounded hover:text-white hover:border-white transition-all">
                                        СТАРТ
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Tasks Categories */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4 px-1">Постоянные цели</h2>
                    {SHU_METAL_TASKS.map((task, i) => {
                        const Icon = iconMap[task.icon] || IconLightning;
                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="group bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 hover:border-orange-500/20 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-orange-500 shrink-0 group-hover:border-orange-500/30 transition-colors">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[9px] text-orange-500/70 font-black uppercase tracking-widest">{task.category}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-black text-zinc-100">+{task.reward.toLocaleString()}</span>
                                                <div className="w-2 h-2 rounded-full bg-orange-500/30 animate-pulse" />
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-sm mb-1 text-zinc-200">{task.title}</h3>
                                        <p className="text-[11px] text-zinc-500 leading-tight pr-4">{task.description}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-center bg-black/20 rounded-lg p-2">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${task.type === 'action' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                        {task.type === 'action' ? 'Активность' : 'Достижение'}
                                    </span>
                                    <button className="bg-orange-500 hover:bg-orange-400 text-black text-[10px] font-black px-4 py-1.5 rounded uppercase tracking-wider transition-all">
                                        ОТКРЫТЬ
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default ShuMetalTasks;
