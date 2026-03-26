import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Banknote, ShieldCheck, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = ({ isLeaderMode, theme = 'dark' }) => {
    const isLight = theme === 'light';
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'dashboard', icon: <Home size={20} />, label: 'Home', path: '/' },
        { id: 'events', icon: <Calendar size={20} />, label: 'Pulse', path: '/events' },
        { id: 'wallet', icon: <Banknote size={20} />, label: 'Wallet', path: '/wallet' },
        { id: 'profile', icon: <User size={20} />, label: 'Profile', path: '/profile' },
    ];

    if (isLeaderMode) {
        navItems.push({ id: 'leader', icon: <ShieldCheck size={20} />, label: 'Leader', path: '/leader' });
    }

    return (
        <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] backdrop-blur-xl border-t px-6 py-3 pb-8 z-50 flex justify-between items-center rounded-t-3xl transition-all ${isLight ? 'bg-white/90 border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]' : 'bg-[#121214]/80 border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'}`}>
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-blue-500' : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-crm-text-muted hover:text-white')}`}
                    >
                        <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-500/10 shadow-lg shadow-blue-500/20' : ''}`}>
                            {item.icon}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                        {isActive && (
                            <motion.div 
                                layoutId="nav-pill"
                                className="w-1 h-1 bg-blue-500 rounded-full mt-0.5"
                            />
                        )}
                    </motion.button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
