import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Banknote, Star, ShieldCheck, X } from 'lucide-react';

const Header = ({ 
    wallet, 
    stats, 
    isLeaderMode, 
    setIsLeaderMode, 
    isNotifOpen, 
    setIsNotifOpen, 
    notifications, 
    setNotifications, 
    setIsWalletOpen,
    theme = 'dark'
}) => {
    const isLight = theme === 'light';
    
    return (
        <header className={`header-blur ${isLight ? 'border-b border-slate-100' : ''}`}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`profile-avatar min-w-[44px] h-[44px] rounded-2xl ${isLight ? 'bg-indigo-500 shadow-indigo-200' : ''}`}>S</div>
                    <div className="min-w-0">
                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-400' : 'text-crm-text-muted'}`}>Member Panel</div>
                        <h1 className={`text-xl font-black leading-tight tracking-tighter ${isLight ? 'text-slate-800' : 'text-white'}`}>ShuTeam</h1>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition-all ${isNotifOpen ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border border-white/5 text-crm-text-muted'}`}
                >
                    <Bell size={18} />
                    {notifications.length > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border border-[#121214]" />
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {isNotifOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="notif-dropdown"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white">System Alerts</h5>
                            <button onClick={() => setNotifications([])} className="text-[8px] font-bold text-crm-text-muted hover:text-white uppercase transition-colors">Clear All</button>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                            {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} className="notif-item !p-2 bg-white/[0.02] border border-white/[0.02] rounded-lg mb-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${n.type === 'PAYMENT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{n.type}</span>
                                        <span className="text-[7px] font-bold text-crm-text-muted">{n.time}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-white uppercase">{n.title}</div>
                                    <p className="text-[9px] text-crm-text-muted leading-tight mt-1">{n.desc}</p>
                                </div>
                            )) : (
                                <div className="text-center py-4 opacity-50">
                                    <span className="text-[8px] font-bold uppercase tracking-widest">No Active Alerts</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sub-header Balance & Status */}
            <div className="mt-5 pt-5 border-t border-white/5 flex items-end justify-between">
                <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsWalletOpen(true)}
                    className="flex flex-col gap-1 cursor-pointer"
                >
                    <div className="flex items-center gap-1.5">
                        <Banknote size={10} className="text-blue-400/50" />
                        <div className="text-[9px] font-bold text-crm-text-muted uppercase tracking-widest">Liquidity</div>
                    </div>
                    <div className="text-lg font-black text-white leading-none">
                        {Number(wallet.balance).toLocaleString('ru-RU', { minimumFractionDigits: 0 })} <span className="text-blue-500 font-bold ml-1">{wallet.currency}</span>
                    </div>
                </motion.div>

                <div className="flex items-center gap-2">
                    <div className="user-profile-badge !h-8 !border-white/10">
                        <Star size={12} className="text-yellow-500" />
                        <span className="text-white font-bold">LVL {stats.level}</span>
                    </div>
                    <button
                        onClick={() => setIsLeaderMode(!isLeaderMode)}
                        className={`flex items-center gap-1.5 px-3 h-8 rounded-xl border transition-all ${isLeaderMode ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/5 text-crm-text-muted'}`}
                    >
                        <ShieldCheck size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Leader</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
