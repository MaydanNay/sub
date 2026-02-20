import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IconLightning,
    IconChart,
    IconTrophy,
    IconChest,
    IconUsers,
    IconTarget
} from '../../../components/GameIcons';

const BottomNav = () => {
    const navItems = [
        { path: '/game/shumetal/play', icon: IconTrophy, label: 'Главная' },
        { path: '/game/shumetal/tasks', icon: IconLightning, label: 'Задания' },
        { path: '/game/shumetal/shop', icon: IconChest, label: 'Магазин' },
        { path: '/game/shumetal/social', icon: IconUsers, label: 'Цехов' },
        { path: '/game/shumetal/mood', icon: IconTarget, label: 'Индекс' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-2 flex justify-around items-center shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300
                                ${isActive ? 'text-orange-500' : 'text-slate-400 hover:text-slate-200'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-orange-500/10 rounded-2xl border border-orange-500/20"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={`w-6 h-6 relative z-10 ${isActive ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : ''}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider relative z-10">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BottomNav;
