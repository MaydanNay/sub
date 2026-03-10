import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowLeft, IconSettings, IconLightning, IconShoppingBag, IconBook, IconPlus } from '../../components/GameIcons';
import Board from './components/Board';
import ScanReceiptModal from './components/ScanReceiptModal';
import QuestModal from './components/QuestModal';
import CollectionModal from './components/CollectionModal';
import ShopModal from './components/ShopModal';
import WinModal from './components/WinModal';
import { ITEMS, CHAINS, INITIAL_BOARD_SIZE, GENERATOR_COOLDOWN } from './constants';
// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const NauryzGame = () => {
    const navigate = useNavigate();

    // State
    const [board, setBoard] = useState(() => {
        const saved = storage.get('nauryz_board');
        return saved ? JSON.parse(saved) : Array(INITIAL_BOARD_SIZE).fill(null);
    });

    // Discovered Items State
    const [discoveredItems, setDiscoveredItems] = useState(() => {
        const saved = storage.get('nauryz_discovered');
        return saved ? JSON.parse(saved) : ['flour', 'milk', 'water']; // Default discovered
    });

    const [energy, setEnergy] = useState(() => {
        const saved = parseInt(storage.get('nauryz_energy') || '10', 10);
        return Math.min(10, saved); // Enforce max 10
    });

    const [coins, setCoins] = useState(() => {
        return parseInt(storage.get('nauryz_coins') || '500', 10);
    });

    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);
    const [isWinModalOpen, setIsWinModalOpen] = useState(false);

    // Timer for energy regeneration (1 per 5 min)
    useEffect(() => {
        const timer = setInterval(() => {
            setEnergy(prev => {
                if (prev < 10) {
                    return prev + 1;
                }
                return prev;
            });
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(timer);
    }, []);

    // FOMO: Prize Counter
    const [prizesLeft, setPrizesLeft] = useState(47);
    useEffect(() => {
        // Fake decrease of prizes for FOMO effect
        const timer = setInterval(() => {
            setPrizesLeft(prev => Math.max(0, prev - 1));
        }, 30000 + Math.random() * 60000); // Decrease every 30-90 seconds

        return () => clearInterval(timer);
    }, []);

    // Persistence
    useEffect(() => {
        storage.set('nauryz_board', JSON.stringify(board));
        storage.set('nauryz_energy', energy.toString());
        storage.set('nauryz_coins', coins.toString());
        storage.set('nauryz_discovered', JSON.stringify(discoveredItems));
    }, [board, energy, coins, discoveredItems]);

    // Helpers
    const unlockItem = useCallback((itemId) => {
        setDiscoveredItems(prev => {
            if (!prev.includes(itemId)) {
                // New Discovery!
                const newDiscovered = [...prev, itemId];

                // Check Win Condition (If we discovered all items)
                const totalItems = Object.keys(ITEMS).length;
                if (newDiscovered.length === totalItems) {
                    setTimeout(() => setIsWinModalOpen(true), 1000); // Delay for effect
                }

                return newDiscovered;
            }
            return prev;
        });
    }, []);

    const spawnItem = (itemId) => {
        // Find empty slot
        const emptyIndices = board.map((item, index) => item === null ? index : null).filter(i => i !== null);
        if (emptyIndices.length === 0) {
            alert("Нет места на столе!");
            return false;
        }

        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const newItem = {
            uid: generateId(),
            id: itemId,
            ...ITEMS[itemId.toUpperCase()] // Merge item data
        };

        const newBoard = [...board];
        newBoard[randomIndex] = newItem;
        setBoard(newBoard);
        unlockItem(itemId);
        return true;
    };

    const handleSpawnClick = () => {
        // Updated Logic: Spend 1 energy
        const COST = 1;

        if (energy < COST) {
            setIsScanModalOpen(true);
            return;
        }

        const starters = ['flour', 'milk', 'water'];
        const randomStarter = starters[Math.floor(Math.random() * starters.length)];

        if (spawnItem(randomStarter)) {
            setEnergy(prev => Math.max(0, prev - COST));
        }
    };

    const handleMove = (fromIndex, toIndex) => {
        const newBoard = [...board];
        const sourceItem = newBoard[fromIndex];
        const targetItem = newBoard[toIndex];

        // 1. Empty Target -> Move
        if (!targetItem) {
            newBoard[toIndex] = sourceItem;
            newBoard[fromIndex] = null;
            setBoard(newBoard);
            return;
        }

        // 2. Same Item -> Merge
        if (sourceItem.id === targetItem.id) {
            // Find next tier
            const chainName = ITEMS[sourceItem.id.toUpperCase()]?.chain;
            const chain = CHAINS[chainName];
            const currentTierIndex = chain.indexOf(sourceItem.id);

            if (currentTierIndex >= 0 && currentTierIndex < chain.length - 1) {
                const nextItemId = chain[currentTierIndex + 1];

                // create new merged item
                const newItem = {
                    uid: generateId(),
                    id: nextItemId,
                };

                newBoard[toIndex] = newItem;
                newBoard[fromIndex] = null;

                setBoard(newBoard);
                // Merging is free now!

                // Optional: Add XP or Coins for merge
                setCoins(prev => prev + 1); // Reward for merge
                unlockItem(nextItemId);
            }
        }
    };

    // Shop Handlers
    const handleBuyEnergy = (cost, amount) => {
        if (coins >= cost) {
            setCoins(prev => prev - cost);
            setEnergy(prev => Math.min(10, prev + amount));
            // Trigger toast success?
        }
    };

    const handleBuyItem = (cost) => {
        if (coins >= cost) {
            const starters = ['flour', 'milk', 'water'];
            const randomStarter = starters[Math.floor(Math.random() * starters.length)];

            if (spawnItem(randomStarter)) {
                setCoins(prev => prev - cost);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden max-w-md mx-auto shadow-2xl relative">
            <ScanReceiptModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onScanComplete={() => setEnergy(10)} // Refill to max
            />

            <QuestModal
                isOpen={isQuestModalOpen}
                onClose={() => setIsQuestModalOpen(false)}
                onClaim={() => { }}
            />

            <CollectionModal
                isOpen={isCollectionModalOpen}
                onClose={() => setIsCollectionModalOpen(false)}
                discoveredItems={discoveredItems}
            />

            <ShopModal
                isOpen={isShopModalOpen}
                onClose={() => setIsShopModalOpen(false)}
                coins={coins}
                onBuyEnergy={handleBuyEnergy}
                onBuyItem={handleBuyItem}
                onOpenScan={() => setIsScanModalOpen(true)}
            />

            <WinModal
                isOpen={isWinModalOpen}
                onClose={() => setIsWinModalOpen(false)}
            />

            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md px-4 py-3 flex flex-col shadow-sm z-20 sticky top-0 border-b border-amber-100">
                <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                            <IconArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="font-bold text-amber-900 leading-tight">Пекарня Shu</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Energy Widget */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsScanModalOpen(true)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border shadow-sm transition-colors ${energy === 0 ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-blue-50 border-blue-100'}`}
                        >
                            <IconLightning className={`w-4 h-4 ${energy === 0 ? 'text-red-500' : 'text-blue-500'} fill-current`} />
                            <span className={`font-bold text-sm ${energy === 0 ? 'text-red-700' : 'text-blue-700'}`}>{energy}/10</span>
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-1">
                                <IconPlus className="w-3 h-3 text-white" />
                            </div>
                        </motion.button>
                    </div>
                </div>

                {/* FOMO Ticker */}
                <div className="w-full bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 flex items-center justify-between animate-pulse">
                    <span className="text-xs text-red-600 font-medium">🔥 Розыгрыш "Ханский гостинец"</span>
                    <span className="text-xs text-red-700 font-bold">Осталось: {prizesLeft} шт.</span>
                </div>
            </header>

            {/* Main Game Area (Board) */}
            <main className="flex-1 bg-amber-50/50 p-4 overflow-auto scrollbar-hide relative flex flex-col items-center justify-center">
                {/* Generator Button (Mock) */}
                {/* Generator Button (Mock) */}
                <div className="w-full flex justify-center mb-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSpawnClick}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg shadow-amber-500/30 font-bold flex items-center gap-2 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10">📦 Взять ингредиент</span>
                        <span className="relative z-10 bg-black/20 px-2 py-0.5 rounded text-xs ml-1 flex items-center">
                            -1 <IconLightning className="w-3 h-3 ml-0.5 inline" />
                        </span>
                    </motion.button>
                </div>

                {/* The Board */}
                <Board board={board} onMove={handleMove} />
            </main>

            {/* Bottom Navigation / Controls */}
            <nav className="bg-white px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 flex justify-between items-end pb-8">
                <button
                    onClick={() => setIsShopModalOpen(true)}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-orange-500 transition-colors"
                >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1 group-hover:bg-orange-50 transition-colors">
                        <IconShoppingBag className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold">Магазин</span>
                </button>

                <button
                    onClick={() => setIsQuestModalOpen(true)}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-orange-500 transition-colors -mt-8"
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/40 text-white mb-1 transform hover:scale-105 active:scale-95 transition-all">
                        <span className="text-2xl font-bold">GO</span>
                    </div>
                    <span className="text-xs font-semibold text-orange-600">Квесты</span>
                </button>

                <button
                    onClick={() => setIsCollectionModalOpen(true)}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-orange-500 transition-colors"
                >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1 group-hover:bg-orange-50 transition-colors">
                        <IconBook className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold">Рецепты</span>
                </button>
            </nav>
        </div>
    );
};

export default NauryzGame;
