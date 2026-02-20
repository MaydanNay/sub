import React from 'react';
import { motion } from 'framer-motion';
import { ITEMS } from '../constants';

const Item = ({ item, isDragging, onDragStart, onDragEnd }) => {
    if (!item) return null;

    const itemData = Object.values(ITEMS).find(i => i.id === item.id);
    if (!itemData) return null;

    return (
        <motion.div
            layoutId={`item-${item.uid}`}
            className={`w-full h-full rounded-lg shadow-sm flex items-center justify-center text-3xl cursor-grab active:cursor-grabbing select-none relative
                ${isDragging ? 'z-50 scale-110 shadow-xl' : 'z-10'}
                ${itemData.chain === 'baursak' ? 'bg-orange-100 border border-orange-200' : ''}
                ${itemData.chain === 'ayran' ? 'bg-blue-50 border border-blue-200' : ''}
                ${itemData.chain === 'tea' ? 'bg-amber-100 border border-amber-200' : ''}
            `}
            drag
            dragSnapToOrigin
            dragElastic={0.1}
            dragMomentum={false}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <span className="drop-shadow-sm filter">{itemData.icon}</span>
            {/* Level Indicator */}
            <div className="absolute bottom-0 right-0 bg-black/10 text-[8px] font-bold px-1 rounded-tl-md text-amber-900/50">
                {itemData.tier}
            </div>
        </motion.div>
    );
};

export default Item;
