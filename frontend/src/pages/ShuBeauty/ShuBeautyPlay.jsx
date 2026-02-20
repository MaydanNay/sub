import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    IconTrophy, IconList, IconGift, IconCoin, IconArrowLeft,
    IconZap, IconTarget, IconUsers
} from '../../components/GameIcons';

import bgPng from './images/bg.png';
import pandaPng from './images/panda.png';
import iceBlockPng from './images/ice_block.png';
import giftPng from './images/gift.png';
import lipstickPng from './images/lipstick.png';
import mascaraPng from './images/mascara.png';
import creamPng from './images/cream.png';
import perfumePng from './images/perfume.png';

const BOARD_SIZE = 30;

const ITEMS = [
    { id: 'lipstick', name: 'Помада', icon: lipstickPng, partner: 'Lamoda' },
    { id: 'mascara', name: 'Тушь', icon: mascaraPng, partner: 'Reward' },
    { id: 'cream', name: 'Крем', icon: creamPng, partner: 'BKS' },
    { id: 'perfume', name: 'Духи', icon: perfumePng, partner: 'Sokolov' }
];

const COUPONS = [
    { id: 'lamoda_20', partner: 'Lamoda', discount: '20%', code: 'SHUBEAUTY20', icon: '🎫' },
    { id: 'sokolov_15', partner: 'Sokolov', discount: '15%', code: 'SAKURA15', icon: '💎' },
    { id: 'bks_gift', partner: 'БКС Инвестиции', discount: 'Фрибет', code: 'INVESTGIFT', icon: '📈' },
    { id: 'master_30', partner: 'ShuBeauty', discount: '30%', code: 'MASTERBOX30', icon: '🏆' }
];

// --- CSS for 3D Dice ---
const diceStyles = `
  .die-container { perspective: 1000px; width: 64px; height: 64px; }
  .die {
    width: 100%; height: 100%;
    position: relative; transform-style: preserve-3d;
    transition: transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .die-face {
    position: absolute; width: 100%; height: 100%;
    background: white; border: 4px solid #f1f5f9;
    border-radius: 12px; display: flex; align-items: center;
    justify-content: center; font-size: 38px; font-weight: 900; box-shadow: inset 0 0 15px rgba(0,0,0,0.05);
  }
  .face-1 { transform: rotateY(0deg) translateZ(32px); }
  .face-2 { transform: rotateY(90deg) translateZ(32px); }
  .face-3 { transform: rotateY(180deg) translateZ(32px); }
  .face-4 { transform: rotateY(-90deg) translateZ(32px); }
  .face-5 { transform: rotateX(90deg) translateZ(32px); }
  .face-6 { transform: rotateX(-90deg) translateZ(32px); }
  
  @keyframes dice-shake {
    0% { transform: rotateX(0deg) rotateY(0deg); }
    25% { transform: rotateX(180deg) rotateY(90deg); }
    50% { transform: rotateX(360deg) rotateY(180deg); }
    75% { transform: rotateX(540deg) rotateY(270deg); }
    100% { transform: rotateX(720deg) rotateY(360deg); }
  }
  .die.rolling { animation: dice-shake 0.5s linear infinite; }

  @keyframes collect-flare {
    0% { transform: scale(0) rotate(0deg); opacity: 0; }
    50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
    100% { transform: scale(2) rotate(360deg); opacity: 0; }
  }
  .flare-effect {
    position: absolute; pointer-events: none;
    background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251,113,133,0) 70%);
    border-radius: 50%; width: 100px; height: 100px;
    animation: collect-flare 0.8s ease-out forwards;
  }
`;

const ShuBeautyPlay = () => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('shubeauty_stats');
        const defaultStats = {
            position: 0,
            rolls: 50,
            coins: 1250,
            bonuses: [],
            tasks_completed: [],
            inventory: [],
            coupons: [],
            last_roll_at: Date.now(),
            hasFinished: false,
            isBusiness: true // Business status active by default for this update
        };
        if (!saved) return defaultStats;
        return { ...defaultStats, ...JSON.parse(saved) };
    });

    const [diceValue, setDiceValue] = useState(1);
    const [isRolling, setIsRolling] = useState(false);
    const [moving, setMoving] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [speedBoost, setSpeedBoost] = useState(0);
    const [particleBursts, setParticleBursts] = useState([]);
    const [showVictory, setShowVictory] = useState(false);
    const [petalIntensity, setPetalIntensity] = useState(1);

    useEffect(() => {
        localStorage.setItem('shubeauty_stats', JSON.stringify(stats));

        // Asset Preloading
        const assets = [bgPng, pandaPng, iceBlockPng, giftPng, lipstickPng, mascaraPng, creamPng, perfumePng];
        assets.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        // Auto-scroll to player - optimized to avoid jumps and freezes
        if (scrollRef.current && !isRolling) {
            const pos = getCellPos(stats.position);
            const containerHeight = scrollRef.current.offsetHeight;
            const currentScroll = scrollRef.current.scrollTop;
            const targetScroll = pos.y - (containerHeight / 2) + 40;

            // Only scroll if there's a significant difference to avoid micro-adjustments
            if (Math.abs(currentScroll - targetScroll) > 20) {
                scrollRef.current.scrollTo({
                    top: targetScroll,
                    behavior: moving ? 'auto' : 'smooth'
                });
            }
        }
    }, [stats.position, isRolling, moving]);

    const cells = Array.from({ length: BOARD_SIZE }).map((_, i) => {
        if (i === 0) return { type: 'start', label: 'Start' };
        if (i === BOARD_SIZE - 1) return { type: 'finish', label: 'Finish' };
        if (i === 10 || i === 22) return { type: 'lounge', label: 'Business Lounge' };
        if (i === 7 || i === 15 || i === 26) return { type: 'promo', label: 'Promo Code' };
        if (i === 4 || i === 18) return { type: 'speed', label: '+1' };
        if (i === 12 || i === 25) return { type: 'freeze', label: '❄️' };
        if (i % 7 === 0) return { type: 'ladder', target: Math.min(i + 5, BOARD_SIZE - 1) };
        if (i % 5 === 0) {
            const brands = ['Lamoda', 'BKS', 'Sokolov', '585 Gold'];
            const brand = brands[Math.floor(i / 5) % 4];
            let item = null;
            if (brand === 'Lamoda') item = 'lipstick';
            if (brand === 'BKS') item = 'cream';
            if (brand === 'Sokolov') item = 'perfume';
            return { type: 'brand', brand, item };
        }
        if (i % 3 === 0) return { type: 'reward', reward: 'mascara' };
        return { type: 'normal' };
    });

    const showMessageFn = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleRoll = () => {
        if (isRolling || moving || stats.rolls <= 0 || stats.hasFinished) return;

        setIsRolling(true);
        setPetalIntensity(2.5); // Boost petals during roll
        const roll = Math.floor(Math.random() * 6) + 1;
        const totalSteps = roll + speedBoost;
        setSpeedBoost(0);

        setTimeout(() => {
            setDiceValue(roll);
            setIsRolling(false);
            setMoving(true);
            movePlayer(totalSteps);
            setTimeout(() => setPetalIntensity(1), 2000); // Reset intensity
        }, 1000);
    };

    const movePlayer = async (steps) => {
        let currentPos = stats.position;
        for (let i = 0; i < steps; i++) {
            if (currentPos >= BOARD_SIZE - 1) break;
            currentPos = currentPos + 1;
            setStats(prev => ({ ...prev, position: currentPos }));
            await new Promise(r => setTimeout(r, 350)); // Gentle glide speed
        }

        const landedCell = cells[currentPos];
        handleLanding(landedCell);
        setMoving(false);
        setStats(prev => ({ ...prev, rolls: prev.rolls - 1 }));
    };

    const collectItem = (itemId) => {
        if (stats.inventory.includes(itemId)) {
            // Still show burst even if already collected for "feel"
            triggerBurst();
            return;
        }
        setStats(prev => ({
            ...prev,
            inventory: [...prev.inventory, itemId]
        }));

        triggerBurst();
        const item = ITEMS.find(it => it.id === itemId);
        showMessageFn(`Получен предмет: ${item.name}! 💄`);
    };

    const triggerBurst = () => {
        const id = Date.now();
        setParticleBursts(prev => [...prev, id]);
        setTimeout(() => {
            setParticleBursts(prev => prev.filter(b => b !== id));
        }, 1000);
    };

    const handleLanding = (cell) => {
        if (cell.type === 'reward') {
            collectItem('mascara');
            setStats(prev => ({ ...prev, coins: prev.coins + 100 }));
        } else if (cell.type === 'ladder') {
            setTimeout(() => {
                setStats(prev => ({ ...prev, position: cell.target }));
                showMessageFn("Лестница! Вверх! 🧗");
            }, 600);
        } else if (cell.type === 'brand') {
            if (cell.item) collectItem(cell.item);
            const rewardAmt = stats.isBusiness ? 240 : 200;
            showMessageFn(`Партнер: ${cell.brand}! +${rewardAmt} 🪙`);
            setStats(prev => ({ ...prev, coins: prev.coins + rewardAmt }));
        } else if (cell.type === 'lounge') {
            triggerBurst();
            setStats(prev => ({
                ...prev,
                coins: prev.coins + 500,
                rolls: prev.rolls + 5
            }));
            showMessageFn("Бизнес Лаунж! +500 🪙 +5 Ходов 💎");
        } else if (cell.type === 'speed') {
            setSpeedBoost(1);
            showMessageFn("Ускорение! Сл. ход +1 ⚡");
        } else if (cell.type === 'freeze') {
            setStats(prev => ({ ...prev, rolls: Math.max(0, prev.rolls - 1) }));
            showMessageFn("Заморозка! -1 ход ❄️");
        } else if (cell.type === 'promo') {
            triggerBurst();
            const uncollectedCodes = COUPONS.filter(c => c.id !== 'master_30' && !stats.coupons.includes(c.id));
            if (uncollectedCodes.length > 0) {
                const randomCoupon = uncollectedCodes[Math.floor(Math.random() * uncollectedCodes.length)];
                setStats(prev => ({
                    ...prev,
                    coupons: [...prev.coupons, randomCoupon.id],
                    bonuses: [...prev.bonuses, randomCoupon.id] // Keep old bonuses for compatibility
                }));
                showMessageFn(`Купон найден: ${randomCoupon.partner}! 🎟️`);
            } else {
                setStats(prev => ({ ...prev, coins: prev.coins + 300 }));
                showMessageFn("Все купоны собраны! +300 🪙");
            }
        } else if (cell.type === 'finish') {
            const hasMaster = stats.coupons.includes('master_30');
            setStats(prev => ({
                ...prev,
                hasFinished: true,
                coins: prev.coins + 1000,
                coupons: hasMaster ? prev.coupons : [...prev.coupons, 'master_30']
            }));
            setTimeout(() => setShowVictory(true), 1000);
        }
    };

    const handleClaimTask = (taskId, reward) => {
        if (stats.tasks_completed.includes(taskId)) return;
        setStats(prev => ({
            ...prev,
            rolls: prev.rolls + reward,
            tasks_completed: [...prev.tasks_completed, taskId]
        }));
        showMessageFn(`Принято! +${reward} Ходов! 🎯`);
    };

    const getCellPos = (index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = row % 2 === 0 ? col * 70 : (2 - col) * 70;
        const y = (BOARD_SIZE - 1 - index) * 80; // Tighter vertical spacing
        return { x, y };
    };

    const getDiceRotation = (val) => {
        switch (val) {
            case 1: return 'rotateY(0deg) rotateX(0deg)';
            case 2: return 'rotateY(-90deg) rotateX(0deg)';
            case 3: return 'rotateY(-180deg) rotateX(0deg)';
            case 4: return 'rotateY(90deg) rotateX(0deg)';
            case 5: return 'rotateY(0deg) rotateX(-90deg)';
            case 6: return 'rotateY(0deg) rotateX(90deg)';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-cover bg-center flex justify-center overflow-hidden" style={{ backgroundImage: `url(${bgPng})` }}>
            <style>{diceStyles}</style>
            <div className="relative w-full max-w-md h-screen shadow-2xl overflow-hidden flex flex-col backdrop-blur-[2px]">

                {/* Floating Petals */}
                <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: ['-10%', '110%'],
                                x: [Math.random() * 100 + '%', (Math.random() * 100 - 10) + '%'],
                                rotate: [0, 360]
                            }}
                            transition={{
                                duration: (5 + Math.random() * 5) / petalIntensity,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                            className="absolute text-pink-300 text-lg"
                            style={{ left: Math.random() * 100 + '%' }}
                        >
                            🌸
                        </motion.div>
                    ))}
                </div>

                {/* Header */}
                <header className="absolute top-0 left-0 right-0 z-50 p-6 flex flex-col gap-4 pointer-events-auto">
                    {/* Row 1: Navigation & Main Stats */}
                    <div className="flex justify-between items-center">
                        <button onClick={() => navigate('/game/shubeauty')} className="w-12 h-12 rounded-full bg-rose-400/80 backdrop-blur-xl border-2 border-white/50 flex items-center justify-center shadow-xl text-white">
                            <IconArrowLeft className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-2">
                            {stats.isBusiness && (
                                <div className="flex items-center gap-1 bg-slate-900 border border-amber-400 px-3 py-1.5 rounded-full shadow-lg">
                                    <IconTarget className="w-3 h-3 text-amber-400" />
                                    <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">BUSINESS</span>
                                </div>
                            )}
                            <CircularBtn label={stats.coins} icon={<IconCoin />} color="bg-rose-400" />
                        </div>
                    </div>

                    {/* Row 2: Interaction Hub */}
                    <div className="flex justify-center gap-3">
                        <CircularBtn icon={<IconTrophy />} color="bg-yellow-400" />
                        <CircularBtn icon={<IconList />} color="bg-orange-400" onClick={() => setActiveTab('tasks')} />
                        <CircularBtn
                            label={`${stats.inventory.length}/4`}
                            icon={<IconGift />}
                            color="bg-pink-400"
                            onClick={() => setActiveTab('box')}
                        />
                        <CircularBtn
                            label={stats.coupons.length}
                            icon={<IconZap className="text-amber-400" />}
                            color="bg-slate-800"
                            onClick={() => setActiveTab('bonuses')}
                        />
                    </div>
                </header>

                {/* Path Area */}
                <div className="flex-1 relative overflow-y-auto scrollbar-hide pt-[25vh] pb-[60vh] pointer-events-auto" ref={scrollRef}>
                    <div className="relative w-full flex justify-center" style={{ height: BOARD_SIZE * 80 }}>
                        {cells.map((cell, i) => {
                            const pos = getCellPos(i);
                            const itemData = cell.item ? ITEMS.find(it => it.id === cell.item) : (cell.type === 'reward' ? ITEMS.find(it => it.id === 'mascara') : null);

                            return (
                                <div key={i} className="absolute transition-all duration-700" style={{ transform: `translate(${pos.x - 70}px, ${pos.y}px)`, zIndex: BOARD_SIZE - i }}>
                                    <div className="relative w-24 h-24">
                                        <img src={iceBlockPng} className="w-full h-full object-contain drop-shadow-md" alt="block" />

                                        {/* Cell Decorations */}
                                        {itemData && i > stats.position && (
                                            <motion.img
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                src={itemData.icon}
                                                className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 object-contain z-10"
                                            />
                                        )}
                                        {cell.type === 'brand' && i > stats.position && !cell.item && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full border-2 border-rose-200 flex items-center justify-center shadow-md z-10 text-[7px] font-black text-rose-600 text-center px-1 uppercase leading-tight">
                                                {cell.brand}
                                            </div>
                                        )}
                                        {cell.type === 'speed' && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shadow-lg z-10">⚡</div>
                                        )}
                                        {cell.type === 'freeze' && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-100 text-indigo-500 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg z-10">💤</div>
                                        )}
                                        {cell.type === 'promo' && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                                                <div className="bg-gradient-to-br from-amber-400 to-orange-500 w-12 h-14 rounded-xl border-2 border-white shadow-2xl flex items-center justify-center text-xl animate-bounce">🎟️</div>
                                                <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-orange-100 text-[6px] font-black text-orange-600 mt-1 shadow-sm">BONUS</div>
                                            </div>
                                        )}
                                        {cell.type === 'ladder' && (
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-3xl z-0 opacity-50">🪜</div>
                                        )}
                                        {cell.type === 'lounge' && (
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border-2 border-amber-400 text-amber-400 w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-xl z-20">
                                                <IconUsers className="w-5 h-5 mb-0.5" />
                                                <span className="text-[5px] font-black uppercase">LOUNGE</span>
                                            </div>
                                        )}
                                        {cell.type === 'finish' && (
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-4xl z-10">🏁</div>
                                        )}

                                    </div>
                                </div>
                            );
                        })}

                        {/* Player Character - MOVED OUT for perfect Z-INDEX and scrolling */}
                        <motion.div
                            layoutId="player"
                            animate={{
                                x: getCellPos(stats.position).x - 70,
                                y: getCellPos(stats.position).y - 45 // Gentle hover height
                            }}
                            transition={{
                                x: { duration: 0.5, ease: "easeInOut" },
                                y: { duration: 0.5, ease: "easeInOut" }
                            }}
                            className="absolute left-1/2 -translate-x-1/2 z-[100] w-20 h-20 pointer-events-none"
                            style={{ transformOrigin: 'bottom center' }}
                        >
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            >
                                <img src={pandaPng} className="w-full h-full object-contain drop-shadow-2xl" alt="panda" />

                                {particleBursts.map(id => (
                                    <React.Fragment key={id}>
                                        <div className="flare-effect left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                                animate={{
                                                    x: (Math.random() - 0.5) * 150,
                                                    y: (Math.random() - 0.5) * 150,
                                                    opacity: 0,
                                                    scale: 0.5,
                                                    rotate: Math.random() * 360
                                                }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                className="absolute left-1/2 top-1/2 text-xl pointer-events-none"
                                            >
                                                🌸
                                            </motion.div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{
                                    opacity: moving ? 0.3 : 0.4,
                                    scale: moving ? 1.1 : 1.25
                                }}
                                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/20 blur-md rounded-full"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-10 left-0 right-0 p-6 flex justify-center z-[200]">
                    <button
                        onClick={handleRoll}
                        disabled={isRolling || moving || stats.hasFinished}
                        className={`group relative flex items-center gap-6 px-10 py-6 rounded-[2.5rem] transition-all duration-500 shadow-2xl ${isRolling || moving || stats.hasFinished
                            ? 'bg-slate-100 grayscale opacity-50'
                            : 'bg-white hover:scale-105 active:scale-95'
                            }`}
                    >
                        {/* Glow effect for button */}
                        {!isRolling && !moving && !stats.hasFinished && (
                            <div className="absolute inset-0 bg-rose-400/20 blur-2xl rounded-[2.5rem] animate-pulse" />
                        )}

                        <div className="relative text-left flex-1 min-w-[120px]">
                            <p className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em] mb-1">
                                {moving ? 'Движение...' : 'Бросить кубик'}
                            </p>
                            <h3 className="text-2xl font-black text-rose-950 uppercase italic leading-none">
                                {stats.rolls} <span className="text-sm not-italic opacity-40 ml-1">ХОДОВ</span>
                            </h3>
                        </div>

                        {/* 3D Dice Component */}
                        <div className="die-container relative z-10">
                            <div className={`die ${isRolling ? 'rolling' : ''}`} style={{ transform: isRolling ? '' : getDiceRotation(diceValue) }}>
                                <div className="die-face face-1">1</div>
                                <div className="die-face face-2">2</div>
                                <div className="die-face face-3">3</div>
                                <div className="die-face face-4">4</div>
                                <div className="die-face face-5">5</div>
                                <div className="die-face face-6">6</div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Finish/Victory Modal */}
                <AnimatePresence>
                    {showVictory && (
                        <div className="absolute inset-0 z-[1000] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-rose-950/80 backdrop-blur-xl"
                            />

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                className="relative bg-white rounded-[3rem] p-8 w-full max-w-sm text-center shadow-3xl overflow-hidden"
                            >
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-100 rounded-full blur-3xl opacity-50" />
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-100 rounded-full blur-3xl opacity-50" />

                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    className="relative mb-8 pt-4"
                                >
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/10 blur-3xl rounded-full" />
                                    <img src={giftPng} className="w-40 h-40 mx-auto drop-shadow-2xl relative z-10" alt="Victory Box" />

                                    {/* Item Reveal Loop */}
                                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                        {ITEMS.map((item, idx) => (
                                            <motion.img
                                                key={item.id}
                                                src={item.icon}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{
                                                    scale: stats.inventory.includes(item.id) ? [0, 1.2, 1] : 0,
                                                    opacity: stats.inventory.includes(item.id) ? 1 : 0,
                                                    x: [0, (idx - 1.5) * 45],
                                                    y: [0, 60]
                                                }}
                                                transition={{ delay: 0.5 + idx * 0.2, duration: 0.6, type: "spring" }}
                                                className="absolute w-12 h-12 object-contain bg-white rounded-2xl p-2 shadow-lg border-2 border-rose-50"
                                            />
                                        ))}
                                    </div>
                                </motion.div>

                                <h2 className="text-3xl font-black text-rose-950 uppercase italic tracking-tighter mb-2">
                                    {stats.inventory.length === 4 ? (stats.isBusiness ? 'БИЗНЕС-БОКС!' : 'ИДЕАЛЬНЫЙ БОКС!') : 'ПУТЬ ПРОЙДЕН!'}
                                </h2>
                                <p className="text-rose-600/60 text-[10px] font-black uppercase tracking-widest mb-6 px-4">
                                    {stats.isBusiness
                                        ? 'Вы получили подарок премиального уровня для вашего бизнеса'
                                        : stats.inventory.length === 4
                                            ? 'Вы собрали все основные продукты для весеннего преображения!'
                                            : `Вы собрали ${stats.inventory.length} из 4 предметов. Версия для партнеров.`}
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setStats(prev => ({ ...prev, position: 0, hasFinished: false, inventory: [] }));
                                            setShowVictory(false);
                                            navigate('/game/shubeauty');
                                        }}
                                        className="w-full py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black rounded-2xl text-lg uppercase tracking-widest shadow-xl active:scale-95 transition-all border-b-4 border-rose-700"
                                    >
                                        Отлично!
                                    </button>
                                    <button
                                        onClick={() => setShowVictory(false)}
                                        className="w-full py-4 text-rose-300 font-bold text-xs uppercase tracking-widest hover:text-rose-500 transition-colors"
                                    >
                                        Вернуться на поле
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Message Overlay - Centered "Pop" */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, x: '-50%', y: '-50%' }}
                            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                            exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="absolute top-1/2 left-1/2 z-[1000] bg-gradient-to-br from-orange-400 to-rose-500 text-white px-10 py-6 rounded-[2.5rem] shadow-[0_25px_60px_rgba(244,63,94,0.4)] border-4 border-white font-black text-sm uppercase italic tracking-widest text-center whitespace-normal max-w-[280px] leading-tight"
                        >
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Panels */}
                <AnimatePresence>
                    {activeTab === 'tasks' && (
                        <OverlayPanel title="Задания Партнеров" onClose={() => setActiveTab(null)}>
                            <div className="space-y-4">
                                <QuestRow
                                    title="Визит в Lamoda"
                                    desc="Посмотри новую коллекцию"
                                    reward={5}
                                    type="rolls"
                                    completed={stats.tasks_completed.includes('lamoda')}
                                    onClaim={() => handleClaimTask('lamoda', 5)}
                                />
                                <QuestRow
                                    title="Инвестиции с БКС"
                                    desc="Узнай о тарифах для новичков"
                                    reward={10}
                                    type="rolls"
                                    completed={stats.tasks_completed.includes('bks')}
                                    onClaim={() => handleClaimTask('bks', 10)}
                                />
                                <QuestRow
                                    title="Сияние Sokolov"
                                    desc="Найди идеальное украшение"
                                    reward={5}
                                    type="rolls"
                                    completed={stats.tasks_completed.includes('sokolov')}
                                    onClaim={() => handleClaimTask('sokolov', 5)}
                                />
                                {stats.isBusiness && (
                                    <>
                                        <div className="pt-4 pb-2">
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-4">Business Quests</span>
                                        </div>
                                        <QuestRow
                                            title="Бизнес-Премиум"
                                            desc="Активируй статус для компании"
                                            reward={20}
                                            type="rolls"
                                            completed={stats.tasks_completed.includes('biz_premium')}
                                            onClaim={() => handleClaimTask('biz_premium', 20)}
                                            isBiz
                                        />
                                        <QuestRow
                                            title="Корпоративный Заказ"
                                            desc="Оформи подарок для коллег"
                                            reward={15}
                                            type="rolls"
                                            completed={stats.tasks_completed.includes('biz_order')}
                                            onClaim={() => handleClaimTask('biz_order', 15)}
                                            isBiz
                                        />
                                    </>
                                )}
                            </div>
                        </OverlayPanel>
                    )}
                    {activeTab === 'box' && (
                        <OverlayPanel title="Идеальный Бокс" onClose={() => setActiveTab(null)}>
                            <div className="grid grid-cols-2 gap-4">
                                {ITEMS.map(item => {
                                    const collected = stats.inventory.includes(item.id);
                                    return (
                                        <div key={item.id} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center ${collected ? 'bg-white border-rose-400 shadow-xl scale-105' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                                            <div className="relative mb-4">
                                                <img src={item.icon} className={`w-20 h-20 object-contain ${collected ? '' : 'grayscale'}`} alt={item.name} />
                                                {!collected && <div className="absolute inset-0 flex items-center justify-center text-3xl">🔒</div>}
                                            </div>
                                            <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-tighter mb-1">{item.name}</h4>
                                            <p className="text-[8px] text-rose-500 font-black uppercase tracking-widest">{item.partner}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-8 p-6 bg-rose-50 rounded-3xl border border-rose-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-rose-700 uppercase">Прогресс бокса</span>
                                    <span className="text-[10px] font-black text-rose-700">{stats.inventory.length}/4</span>
                                </div>
                                <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-rose-200">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats.inventory.length / 4) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
                                    />
                                </div>
                            </div>
                        </OverlayPanel>
                    )}
                    {activeTab === 'bonuses' && (
                        <OverlayPanel title="Ваши Скидки" onClose={() => setActiveTab(null)}>
                            <div className="space-y-4 pb-10">
                                {stats.coupons.length > 0 ? (
                                    stats.coupons.map(couponId => {
                                        const coupon = COUPONS.find(c => c.id === couponId);
                                        return (
                                            <div key={couponId} className="relative bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-[2.5rem] border-2 border-slate-700 shadow-2xl overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-5xl">{coupon.icon}</div>
                                                <div className="flex justify-between items-start mb-4 relative z-10">
                                                    <div>
                                                        <h4 className="text-amber-400 font-black text-sm uppercase tracking-widest mb-1">{coupon.partner}</h4>
                                                        <p className="text-white text-3xl font-black italic tracking-tighter">СКИДКА {coupon.discount}</p>
                                                    </div>
                                                    <div className="bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase">ACTIVE</div>
                                                </div>
                                                <div className="flex gap-2 items-center bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 relative z-10">
                                                    <code className="flex-1 font-mono text-white font-bold tracking-widest text-lg">{coupon.code}</code>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(coupon.code);
                                                            showMessageFn("Код скопирован! 📋");
                                                        }}
                                                        className="bg-amber-400 text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                                                    >
                                                        Копировать
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-20 px-8">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎟️</div>
                                        <h3 className="text-slate-800 font-black text-xl mb-2">КУПОНОВ ПОКА НЕТ</h3>
                                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Ищите специальные клетки с билетами на игровом поле, чтобы получить скидки от партнеров!</p>
                                    </div>
                                )}
                            </div>
                        </OverlayPanel>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const CircularBtn = ({ icon, label, color, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 p-1.5 rounded-full ${color} border-2 border-white/50 shadow-lg text-white transition-transform active:scale-90`}>
        <div className="w-7 h-7 flex items-center justify-center">{icon}</div>
        {label !== undefined && <span className="pr-3 font-black text-sm tabular-nums">{label}</span>}
    </button>
);

const OverlayPanel = ({ title, children, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-0 top-0 z-[100] bg-black/40 flex flex-col justify-end">
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="bg-white rounded-t-[3rem] p-8 shadow-2xl max-h-[75vh] overflow-y-auto scrollbar-hide border-t-8 border-sky-400">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic text-sky-600">{title}</h3>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">✕</button>
            </div>
            {children}
        </motion.div>
    </motion.div>
);

const QuestRow = ({ title, desc, reward, type, completed, onClaim, isBiz }) => (
    <div className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all ${completed ? 'bg-slate-50 border-slate-100 opacity-60' : isBiz ? 'bg-slate-900 border-amber-900 shadow-xl' : 'bg-white border-slate-100 hover:border-sky-300 shadow-sm'}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${isBiz ? 'bg-amber-100' : 'bg-sky-100'}`}>{isBiz ? '💎' : '🎯'}</div>
        <div className="flex-1">
            <h4 className={`font-bold text-sm tracking-tight ${isBiz ? 'text-amber-50' : 'text-slate-800'}`}>{title}</h4>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isBiz ? 'text-amber-500/70' : 'text-slate-500'}`}>{desc}</p>
        </div>
        {!completed ? (
            <button
                onClick={onClaim}
                className={`${isBiz ? 'bg-amber-500 shadow-amber-900' : 'bg-sky-500 shadow-sky-200'} text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95`}
            >
                +{reward}
            </button>
        ) : (
            <div className={`${isBiz ? 'text-amber-400' : 'text-green-500'} font-black text-xs uppercase tracking-widest`}>Готово</div>
        )}
    </div>
);

export default ShuBeautyPlay;
