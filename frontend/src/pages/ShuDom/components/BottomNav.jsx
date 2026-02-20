import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IconTarget,
    IconHome,
    IconShoppingBag,
    IconLightning
} from '../../../components/GameIcons';

const BottomNav = () => {
    const navItems = [
        { path: '/game/shudom/house', icon: IconHome, label: 'Дом' },
        { path: '/game/shudom/play', icon: IconLightning, label: 'Играть' },
        { path: '/game/shudom/rooms', icon: IconShoppingBag, label: 'Магазин' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pointer-events-none text-neutral-900">
            <div className="max-w-md mx-auto pointer-events-auto">
                <div className="bg-white/80 backdrop-blur-2xl border border-neutral-100 rounded-[32px] p-2 flex justify-around items-center shadow-2xl">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 flex-1
                                ${isActive ? 'text-red-600' : 'text-neutral-400 hover:text-neutral-600'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavShuDom"
                                            className="absolute inset-0 bg-red-50 rounded-2xl border border-red-500/10"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={`w-6 h-6 relative z-10 ${isActive ? 'drop-shadow-[0_0_8px_rgba(220,38,38,0.2)]' : ''}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest relative z-10">{item.label}</span>
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
