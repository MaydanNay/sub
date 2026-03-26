import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Banknote, ArrowDownCircle, ArrowUpCircle, History, Zap, Wallet, CreditCard } from 'lucide-react';

const WalletPage = ({ wallet, transactions }) => {
    return (
        <div className="space-y-8 pb-10">
            {/* Header section with page title */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
                    <Wallet size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight text-white">Digital Wallet</h2>
            </div>

            {/* Main Balance Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-indigo-600">
                    <CreditCard size={140} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Liquidity</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-8">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tighter text-white">
                            {Number(wallet.balance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </h1>
                        <span className="text-lg font-black text-indigo-500">{wallet.currency}</span>
                    </div>

                    <div className="flex gap-3">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 border-none cursor-pointer focus:outline-none"
                        >
                            <Plus size={18} className="text-white" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">Top Up</span>
                        </motion.button>
                        
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 bg-white border border-slate-100 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none"
                        >
                            <Minus size={18} className="text-slate-400" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">Withdraw</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Transaction History Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-slate-400" />
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Transaction History</h3>
                    </div>
                    <button className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">View All</button>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {transactions.length > 0 ? transactions.map((tx, ti) => (
                            <motion.div 
                                key={ti}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ti * 0.05 }}
                                className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100' : 'bg-rose-50 text-rose-500 group-hover:bg-rose-100'}`}>
                                    {tx.type === 'CREDIT' ? <ArrowDownCircle size={22} /> : <ArrowUpCircle size={22} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight text-white mb-0.5 truncate">{tx.description}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                <div className={`text-sm font-black text-white ${tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-slate-800'}`}>
                                    {tx.type === 'CREDIT' ? '+' : '-'}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                </div>
                            </motion.div>
                        )) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                className="text-center py-20 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200"
                            >
                                <Banknote size={40} className="mx-auto mb-4 text-slate-300" />
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No Transaction Flux</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Tips or Featured Section */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-[32px] border border-amber-100 flex items-center gap-5">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Zap size={22} className="text-white" />
                </div>
                <div className="flex-1">
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Fast Pay</div>
                    <p className="text-[10px] font-bold text-amber-700/70 leading-relaxed text-white">Scan member codes to instantly transfer Pulse liquidity.</p>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;

