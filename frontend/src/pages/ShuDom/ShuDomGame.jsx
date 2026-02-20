import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { TILE_TYPES, GAME_CONFIG } from './gameData';
import bgImage from './images/bg.png';
import { IconArrowLeft } from '../../components/GameIcons';

// Memoized tile — only re-renders when its own state changes
const GameTile = React.memo(({ tile, isSelected, onClick }) => {
    return (
        <motion.div
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: tile.matched ? [1, 1.25, 0] : 1,
                opacity: tile.matched ? [1, 1, 0] : 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
                layout: { type: 'spring', stiffness: 350, damping: 35 },
                duration: tile.matched ? 0.25 : 0.18,
            }}
            onClick={() => onClick(tile.r, tile.c)}
            className={[
                'relative aspect-square flex items-center justify-center',
                'text-xl sm:text-2xl rounded-xl cursor-pointer select-none',
                tile.matched
                    ? 'bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.55)] z-30'
                    : isSelected
                        ? 'bg-red-600 z-20 shadow-lg'
                        : 'bg-white/90 shadow-sm border border-red-500/5',
            ].join(' ')}
            whileTap={{ scale: 0.88 }}
        >
            {/* Selection pulse ring */}
            {isSelected && !tile.matched && (
                <motion.div
                    className="absolute inset-0 border-2 border-white rounded-xl"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                />
            )}

            <span
                className={`relative z-10 block pointer-events-none ${tile.matched || isSelected ? 'text-white' : ''}`}
            >
                {tile.type.icon}
            </span>
        </motion.div>
    );
});

const ShuDomGame = () => {
    const navigate = useNavigate();
    const [grid, setGrid] = useState([]);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(GAME_CONFIG.movesPerLevel);
    const [selectedTile, setSelectedTile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    // Use refs to track current values inside async callbacks (avoids stale closures)
    const movesRef = useRef(GAME_CONFIG.movesPerLevel);
    const processingRef = useRef(false);

    const setMovesSync = (val) => {
        movesRef.current = val;
        setMoves(val);
    };

    const buildGrid = () => {
        const newGrid = [];
        for (let r = 0; r < GAME_CONFIG.gridSize; r++) {
            const row = [];
            for (let c = 0; c < GAME_CONFIG.gridSize; c++) {
                const randomType = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
                row.push({ id: `${r}-${c}-${Date.now()}-${Math.random()}`, type: randomType, r, c, matched: false });
            }
            newGrid.push(row);
        }
        return newGrid;
    };

    const initializeGrid = useCallback(() => {
        const m = GAME_CONFIG.movesPerLevel;
        movesRef.current = m;
        setGrid(buildGrid());
        setScore(0);
        setMoves(m);
        setGameOver(false);
        setSelectedTile(null);
        processingRef.current = false;
        setIsProcessing(false);
    }, []);

    useEffect(() => {
        initializeGrid();
    }, [initializeGrid]);

    const checkMatches = (g) => {
        const found = new Set();
        const size = GAME_CONFIG.gridSize;

        // Horizontal
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size - 2; c++) {
                const t = g[r][c].type.id;
                if (t === g[r][c + 1].type.id && t === g[r][c + 2].type.id) {
                    found.add(`${r},${c}`);
                    found.add(`${r},${c + 1}`);
                    found.add(`${r},${c + 2}`);
                }
            }
        }
        // Vertical
        for (let c = 0; c < size; c++) {
            for (let r = 0; r < size - 2; r++) {
                const t = g[r][c].type.id;
                if (t === g[r + 1][c].type.id && t === g[r + 2][c].type.id) {
                    found.add(`${r},${c}`);
                    found.add(`${r + 1},${c}`);
                    found.add(`${r + 2},${c}`);
                }
            }
        }
        return Array.from(found).map(s => s.split(',').map(Number));
    };

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    const processMatches = async (startGrid) => {
        let g = startGrid.map(row => row.map(t => ({ ...t })));
        const size = GAME_CONFIG.gridSize;

        let matches = checkMatches(g);
        while (matches.length > 0) {
            // 1. Mark matched
            matches.forEach(([r, c]) => { g[r][c] = { ...g[r][c], matched: true }; });
            setGrid(g.map(row => [...row]));
            setScore(prev => prev + matches.length * 10);

            await sleep(280);

            // 2. Drop remaining tiles down, fill top with new ones
            const removalSet = new Set(matches.map(([r, c]) => `${r},${c}`));
            for (let c = 0; c < size; c++) {
                let writeIdx = size - 1;
                for (let r = size - 1; r >= 0; r--) {
                    if (!removalSet.has(`${r},${c}`)) {
                        g[writeIdx][c] = { ...g[r][c], r: writeIdx, c, matched: false };
                        writeIdx--;
                    }
                }
                while (writeIdx >= 0) {
                    const randomType = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
                    g[writeIdx][c] = {
                        id: `new-${writeIdx}-${c}-${Date.now()}-${Math.random()}`,
                        type: randomType,
                        r: writeIdx,
                        c,
                        matched: false,
                    };
                    writeIdx--;
                }
            }
            setGrid(g.map(row => [...row]));

            await sleep(420);
            matches = checkMatches(g);
        }

        processingRef.current = false;
        setIsProcessing(false);

        if (movesRef.current <= 0) {
            setGameOver(true);
        }
    };

    const handleTileClick = useCallback(async (r, c) => {
        if (processingRef.current || gameOver) return;

        if (!selectedTile) {
            setSelectedTile({ r, c });
            return;
        }

        const dr = Math.abs(selectedTile.r - r);
        const dc = Math.abs(selectedTile.c - c);

        if (dr === 0 && dc === 0) {
            // Clicked same tile — deselect
            setSelectedTile(null);
            return;
        }

        if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
            // Adjacent — attempt swap
            processingRef.current = true;
            setIsProcessing(true);
            setSelectedTile(null);

            // Snapshot current grid
            const snapshot = grid.map(row => row.map(t => ({ ...t })));

            // Build swapped grid
            const swapped = grid.map(row => row.map(t => ({ ...t })));
            const temp = { ...swapped[r][c] };
            swapped[r][c] = { ...swapped[selectedTile.r][selectedTile.c], r, c };
            swapped[selectedTile.r][selectedTile.c] = { ...temp, r: selectedTile.r, c: selectedTile.c };

            setGrid(swapped);

            const matches = checkMatches(swapped);
            if (matches.length > 0) {
                // Valid move
                setMovesSync(movesRef.current - 1);
                await processMatches(swapped);
            } else {
                // No match — revert after short delay
                await sleep(300);
                setGrid(snapshot);
                processingRef.current = false;
                setIsProcessing(false);
            }
        } else {
            // Non-adjacent — change selection
            setSelectedTile({ r, c });
        }
    }, [selectedTile, grid, gameOver]);

    const flatGrid = React.useMemo(() => grid.flat(), [grid]);

    return (
        <div className="relative min-h-screen bg-white text-neutral-900 font-sans overflow-hidden flex flex-col pb-24">
            <div
                className="fixed inset-0 bg-cover bg-center opacity-20 pointer-events-none"
                style={{ backgroundImage: `url(${bgImage})` }}
            />

            {/* HUD Header */}
            <div className="relative z-10 px-6 pt-10 flex gap-4 items-center bg-white/60 backdrop-blur-md border-b border-red-500/10 pb-4">
                <button
                    onClick={() => navigate('/game/shudom')}
                    className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-red-600 shrink-0 shadow-sm"
                >
                    <IconArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex flex-col flex-1 pl-2">
                    <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">Techno Score</span>
                    <motion.span
                        key={score}
                        initial={{ scale: 1.3, color: '#ef4444' }}
                        animate={{ scale: 1, color: '#171717' }}
                        transition={{ duration: 0.25 }}
                        className="text-2xl font-black"
                    >
                        {score.toLocaleString()}
                    </motion.span>
                </div>

                <motion.div
                    key={moves}
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center shrink-0"
                >
                    <span className="block text-[8px] font-black uppercase text-red-600">Ходов</span>
                    <span className="text-xl font-black text-red-700">{moves}</span>
                </motion.div>
            </div>

            {/* Game Grid */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-4">
                <div
                    className="grid gap-1 bg-red-50/30 p-2 rounded-2xl border border-red-500/10 shadow-xl backdrop-blur-sm"
                    style={{
                        gridTemplateColumns: `repeat(${GAME_CONFIG.gridSize}, 1fr)`,
                        width: 'min(90vw, 400px)',
                        aspectRatio: '1/1',
                    }}
                >
                    <AnimatePresence initial={false}>
                        {flatGrid.map((tile) => (
                            <GameTile
                                key={tile.id}
                                tile={tile}
                                isSelected={selectedTile?.r === tile.r && selectedTile?.c === tile.c}
                                onClick={handleTileClick}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Game Over Modal */}
            <AnimatePresence>
                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex items-center justify-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white border border-red-500/20 w-full max-w-sm rounded-[40px] p-8 text-center shadow-2xl"
                        >
                            <h2 className="text-4xl font-black italic text-red-600 uppercase mb-2">Смена окончена!</h2>
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-8">Марафон Magnum продолжается</p>

                            <div className="bg-red-50 rounded-3xl p-6 mb-8 border border-red-100">
                                <span className="block text-xs font-bold text-red-400 uppercase mb-1">Финальный счет</span>
                                <span className="text-5xl font-black text-red-600">{score.toLocaleString()}</span>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={initializeGrid}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl uppercase tracking-wider shadow-lg shadow-red-500/20"
                                >
                                    Играть снова
                                </button>
                                <button
                                    onClick={() => navigate('/game/shudom/rooms')}
                                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-black py-4 rounded-2xl uppercase tracking-wider transition-colors"
                                >
                                    В комнаты
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
};

export default ShuDomGame;
