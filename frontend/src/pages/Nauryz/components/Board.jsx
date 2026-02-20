import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Item from './Item';

const Board = ({ board, onMerge, onMove }) => {
    // board is array of 36 items (or nulls)

    const handleDragEnd = (fromIndex, info) => {
        const point = info.point;

        // Simple collision detection based on element coordinates
        // In a real app, we might use more robust dnd library, but here we'll calculate
        // based on the grid layout.

        // Find which slot we dropped over
        const slots = document.elementsFromPoint(point.x, point.y);
        const dropSlot = slots.find(el => el.dataset.slotIndex !== undefined);

        if (dropSlot) {
            const toIndex = parseInt(dropSlot.dataset.slotIndex, 10);
            if (fromIndex !== toIndex) {
                // Notify parent to attempt move/merge
                onMove(fromIndex, toIndex);
            }
        }
    };

    return (
        <div className="grid grid-cols-6 gap-2 aspect-square bg-amber-100/50 rounded-xl p-2 border-4 border-amber-200 shadow-inner select-none touch-none">
            {board.map((item, index) => (
                <div
                    key={index}
                    data-slot-index={index}
                    className="bg-amber-50/80 rounded-lg shadow-sm border border-amber-100/50 relative w-full h-full flex items-center justify-center overflow-visible"
                >
                    {item && (
                        <Item
                            item={item}
                            onDragEnd={(e, info) => handleDragEnd(index, info)}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default Board;
