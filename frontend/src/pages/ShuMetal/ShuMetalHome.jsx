import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import bgImage from './images/bg.png';
import persImage from './images/pers.png';
import coinImage from './images/alucoin.png';
import { SHU_METAL_RANKS } from './gameData';

const ShuMetalHome = () => {
    const [balance] = useState(1250);
    const [stats] = useState({
        rank: SHU_METAL_RANKS[1], // Рабочий
        exp: 1250,
        safetyPoints: 12,
        ideasCount: 2
    });

    const nextRank = SHU_METAL_RANKS[2];
    const progress = ((stats.exp - stats.rank.minExp) / (stats.rank.maxExp - stats.rank.minExp)) * 100;

    // HUD Scan animation state
    const [scanActive, setScanActive] = useState(true);

    return (
        <div className="relative min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden pb-24">
            {/* Background */}
            <div
                className="fixed inset-0 bg-cover bg-center opacity-30 grayscale saturate-0"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />

            {/* HUD Vignette */}
            <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-40" />
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />

            {/* Top HUD Area */}
            <div className="relative z-[50] px-4 pt-6 flex justify-between items-start pointer-events-none">
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-black/60 backdrop-blur-xl border-l-2 border-orange-500 p-3 flex items-center gap-3 shadow-2xl pointer-events-auto"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-4px] border border-orange-500/40 rounded-full border-dashed"
                        />
                        <img src={coinImage} alt="Coin" className="w-8 h-8 object-contain relative z-10 shrink-0" />
                    </div>
                    <div>
                        <div className="text-[8px] uppercase font-black text-orange-500/70 tracking-tighter leading-none mb-1">CREDITS: AluCoins</div>
                        <div className="text-lg font-black text-white tracking-widest leading-none">{balance.toLocaleString()}</div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col items-end gap-1 pointer-events-auto"
                >
                    <div className="bg-orange-500 text-black text-[9px] font-black px-2 py-0.5 rounded shadow-[0_0_15px_rgba(249,115,22,0.5)] rotate-1">
                        STATUS: {stats.rank.name.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-zinc-300 tracking-widest uppercase italic">Link Established</span>
                    </div>
                </motion.div>
            </div>

            {/* Center HUD Vizualizer */}
            <div className="relative z-[45] flex flex-col items-center justify-center mt-12 mb-6 pointer-events-none">
                <div className="relative h-72">
                    {/* Character */}
                    <motion.img
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1 }}
                        src={persImage}
                        alt="Iron Master"
                        className="h-full object-contain relative z-20 drop-shadow-[0_0_35px_rgba(249,115,22,0.5)] saturate-[1.2]"
                    />

                    {/* Scanning Line */}
                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-[-20%] right-[-20%] h-[1px] bg-orange-500/60 shadow-[0_0_10px_rgba(249,115,22,0.8)] z-30"
                    />

                    {/* HUD Technical Details */}
                    <div className="absolute top-10 left-[-70px] z-30 flex flex-col items-end gap-3 rotate-[-5deg]">
                        <div className="text-right border-r border-orange-500/50 pr-2">
                            <div className="text-[7px] text-zinc-500 font-bold uppercase">System Integrity</div>
                            <div className="text-[10px] font-black text-orange-400">98.4%</div>
                        </div>
                        <div className="text-right border-r border-orange-500/50 pr-2">
                            <div className="text-[7px] text-zinc-500 font-bold uppercase">Thermal Load</div>
                            <div className="text-[10px] font-black text-rose-500">OPTIMAL</div>
                        </div>
                    </div>

                    <div className="absolute bottom-12 right-[-80px] z-30 flex flex-col items-start gap-3 rotate-[5deg]">
                        <div className="text-left border-l border-orange-500/50 pl-2">
                            <div className="text-[7px] text-zinc-500 font-bold uppercase">Atmosphere</div>
                            <div className="text-[10px] font-black text-orange-400 font-mono italic">NORM_AL</div>
                        </div>
                        <div className="text-left border-l border-orange-500/50 pl-2">
                            <div className="text-[7px] text-zinc-500 font-bold uppercase">HSE_Compliance</div>
                            <div className="text-[10px] font-black text-green-500 tracking-tighter">CERTIFIED</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rank HUD Bar */}
            <div className="relative z-[50] px-8 mb-10">
                <div className="flex justify-between items-end mb-1.5 px-0.5">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-3 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                        <span className="text-[10px] text-white font-black tracking-widest uppercase italic">Progress Toward {nextRank.name.toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] font-black text-orange-500 font-mono transition-all">{Math.round(progress)}%</span>
                </div>
                <div className="h-2.5 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden p-[1px]">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-rose-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                    />
                </div>
                <div className="mt-2 flex justify-between text-[7px] text-zinc-600 font-black tracking-[0.2em] uppercase">
                    <span>{stats.exp} UNIT_XP</span>
                    <span>TARGET: {nextRank.minExp}</span>
                </div>
            </div>

            {/* Core Stats HUD */}
            <div className="relative z-[50] px-6 grid grid-cols-2 gap-4 h-24">
                <div className="relative bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-900 rounded-xl p-3 flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-orange-500/5 rotate-45 transform translate-x-4 translate-y-[-4px]" />
                    <div className="text-[8px] text-zinc-500 font-black uppercase tracking-widest border-b border-zinc-800 pb-1 mb-2">Safety_Protocol</div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-white leading-none pr-1 italic">{stats.safetyPoints}</span>
                        <span className="text-[8px] text-orange-500 font-bold uppercase mb-1">LOGS</span>
                    </div>
                    <div className="w-full h-[1px] bg-gradient-to-r from-orange-500/40 to-transparent mt-1" />
                </div>

                <div className="relative bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-900 rounded-xl p-3 flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/5 rotate-45 transform translate-x-4 translate-y-[-4px]" />
                    <div className="text-[8px] text-zinc-500 font-black uppercase tracking-widest border-b border-zinc-800 pb-1 mb-2">Inno_Input</div>
                    <div className="flex items-end gap-2 text-blue-400">
                        <span className="text-3xl font-black text-white leading-none pr-1 italic">{stats.ideasCount}</span>
                        <span className="text-[8px] font-bold uppercase mb-1">IDEAS</span>
                    </div>
                    <div className="w-full h-[1px] bg-gradient-to-r from-blue-500/40 to-transparent mt-1" />
                </div>
            </div>

            {/* Background Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[100] mix-blend-overlay opacity-30 select-none grayscale contrast-200"
                style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/carbon-fibre.png)' }} />

            <BottomNav />
        </div>
    );
};

export default ShuMetalHome;
