import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, User } from 'lucide-react';

const NAV_ITEMS = [
    { to: '/game/shurun/home', icon: Home, label: 'Главная' },
    { to: '/game/shurun/board', icon: Trophy, label: 'Рейтинг' },
    { to: '/game/shurun/me', icon: User, label: 'Профиль' },
];

const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4 py-3 pb-5">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-all duration-200 ${isActive
                            ? 'text-emerald-400 scale-110'
                            : 'text-slate-500 hover:text-slate-300'
                        }`
                    }
                >
                    <Icon className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                        {label}
                    </span>
                </NavLink>
            ))}
        </div>
    </div>
);

export default BottomNav;
