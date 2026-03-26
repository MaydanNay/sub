import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, MapPin, QrCode, Star, Heart, Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ stats, isLeaderMode, setIsScannerOpen }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Header / Welcome Area */}
            <div className="mb-8">
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Overview</h3>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Your ShuTeam <span className="text-blue-600">Pulse</span></h2>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.button
                    whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/venues')}
                    className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex flex-col gap-4 text-left group transition-all"
                >
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <MapPin size={24} />
                    </div>
                    <span className="font-black text-[11px] uppercase tracking-widest text-slate-400 group-hover:text-slate-600">Venues</span>
                </motion.button>

                <motion.button
                    whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => isLeaderMode ? setIsScannerOpen(true) : navigate('/history')}
                    className={`p-5 rounded-[28px] border flex flex-col gap-4 text-left group transition-all ${isLeaderMode ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isLeaderMode ? 'bg-blue-500 text-white group-hover:bg-blue-600' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'}`}>
                        {isLeaderMode ? <QrCode size={24} /> : <Star size={24} />}
                    </div>
                    <span className={`font-black text-[11px] uppercase tracking-widest group-hover:text-slate-600 ${isLeaderMode ? 'text-blue-400' : 'text-slate-400'}`}>
                        {isLeaderMode ? 'Scanner' : 'History'}
                    </span>
                </motion.button>
            </div>

            {/* Efficiency Card */}
            <div className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-blue-600">
                    <Activity size={120} />
                </div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
                            <Target size={20} />
                        </div>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategic Core</h4>
                    </div>
                    {isLeaderMode && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"
                        >
                            <Plus size={18} />
                        </motion.button>
                    )}
                </div>

                <div className="space-y-6 relative z-10">
                    {stats.goals.map(goal => (
                        <div key={goal.id} className="w-full">
                            <div className="flex justify-between items-end mb-2.5">
                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{goal.title}</span>
                                <span className="text-[11px] font-black text-blue-600">{goal.progress} / {goal.target}</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(goal.progress / goal.target) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 shadow-[0_2px_8px_rgba(59,130,246,0.2)]"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-8 border-t border-slate-50 grid grid-cols-2 gap-6 relative z-10">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <Heart size={10} className="text-rose-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Pulse</span>
                        </div>
                        <div className="text-3xl font-black text-slate-800 tracking-tighter">{stats.visits}</div>
                    </div>
                    <div className="border-l border-slate-50 pl-6 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <Star size={10} className="text-amber-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Goals</span>
                        </div>
                        <div className="text-3xl font-black text-slate-800 tracking-tighter">{stats.goals.length}</div>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 mb-6 flex flex-col items-center gap-4 text-center">
                <div className="h-1 w-12 bg-slate-100 rounded-full" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] max-w-[200px] leading-relaxed">
                    Growth is a composite of <span className="text-slate-600">consistent strategic actions</span>
                </p>
            </div>
        </div>
    );
};

export default Dashboard;

