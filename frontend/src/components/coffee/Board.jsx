import React, { useState } from 'react';
import useGameStore from './store';
import useMatch3Logic from './useMatch3Logic';
import { useDrag, useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';

const ItemType = 'GAME_ITEM';

const DraggableItem = ({ item, r, c, swapItems, selected, setSelected }) => {
    const isSelected = selected && selected[0] === r && selected[1] === c;

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemType,
        item: { r, c },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [r, c]);

    const [, drop] = useDrop(() => ({
        accept: ItemType,
        drop: (draggedItem) => {
            const dr = Math.abs(draggedItem.r - r);
            const dc = Math.abs(draggedItem.c - c);
            if (dr + dc === 1) {
                swapItems(draggedItem.r, draggedItem.c, r, c);
                setSelected(null);
            }
        },
    }), [r, c, swapItems, setSelected]);

    const handleClick = (e) => {
        e.stopPropagation();
        if (selected) {
            const [selR, selC] = selected;
            const dr = Math.abs(selR - r);
            const dc = Math.abs(selC - c);

            if (dr + dc === 1) {
                // If adjacent, swap
                swapItems(selR, selC, r, c);
                setSelected(null);
            } else if (selR === r && selC === c) {
                // If same, deselect
                setSelected(null);
            } else {
                // Otherwise select new
                setSelected([r, c]);
            }
        } else {
            setSelected([r, c]);
        }
    };

    return (
        <motion.div
            ref={(node) => drag(drop(node))}
            onClick={handleClick}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: isDragging ? 1.2 : 1,
                opacity: 1,
                rotate: isSelected ? [0, -4, 4, 0] : 0,
                y: isSelected ? -5 : 0
            }}
            transition={{
                rotate: { repeat: isSelected ? Infinity : 0, duration: 0.3 }
            }}
            className={`
                w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl sm:text-3xl cursor-pointer select-none 
                rounded-xl transition-all duration-200 shadow-sm
                ${isDragging ? 'z-50' : 'z-10'}
                ${isSelected
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 ring-4 ring-white/50 shadow-[0_0_20px_rgba(251,191,36,0.8)]'
                    : 'bg-white/10 hover:bg-white/20 border border-white/5'}
            `}
        >
            <span className="drop-shadow-lg">{item}</span>
        </motion.div>
    );
};

const Board = () => {
    const { grid } = useGameStore();
    const { swapItems } = useMatch3Logic();
    const [selected, setSelected] = useState(null);

    // Deselect on click outside
    const handleBoardClick = () => setSelected(null);

    if (!grid || grid.length === 0) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="text-5xl"
                >
                    ☕
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative group p-4 rounded-[2.5rem] bg-amber-950/40 backdrop-blur-md border-4 border-amber-900/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            {/* Board Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '20px 20px' }} />

            <div className="grid grid-cols-8 gap-1.5 sm:gap-2 relative z-10">
                <AnimatePresence>
                    {grid.map((row, r) => (
                        row.map((item, c) => (
                            <div key={`${r}-${c}`} className="aspect-square bg-black/20 rounded-xl flex items-center justify-center overflow-hidden">
                                <DraggableItem
                                    item={item}
                                    r={r}
                                    c={c}
                                    swapItems={swapItems}
                                    selected={selected}
                                    setSelected={setSelected}
                                />
                            </div>
                        ))
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Board;
