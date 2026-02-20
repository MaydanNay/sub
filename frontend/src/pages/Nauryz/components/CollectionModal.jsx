import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconLock } from '../../../components/GameIcons';
import { ITEMS, CHAINS } from '../constants';

const CollectionModal = ({ isOpen, onClose, discoveredItems = [] }) => {
    if (!isOpen) return null;

    // Group items by chain
    const groupedItems = Object.entries(CHAINS).map(([chainName, itemIds]) => ({
        name: chainName,
        items: itemIds.map(id => {
            const fullItem = Object.values(ITEMS).find(i => i.id === id);
            return fullItem;
        })
    }));

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-lg h-[80vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col pointer-events-auto"
                >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                        <h2 className="text-xl font-bold text-gray-800">Книга Рецептов</h2>
                        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-8">
                        {groupedItems.map((group) => (
                            <div key={group.name}>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                    {group.name === 'baursak' ? 'Баурсаки' : group.name === 'ayran' ? 'Напитки' : 'Чайная церемония'}
                                </h3>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                    {group.items.map((item) => {
                                        const isDiscovered = discoveredItems.includes(item.id);

                                        return (
                                            <div key={item.id} className="flex flex-col items-center gap-1">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border
                                                    ${isDiscovered
                                                        ? 'bg-white border-gray-200'
                                                        : 'bg-gray-50 border-gray-100 grayscale opacity-50'
                                                    }
                                                `}>
                                                    {isDiscovered ? item.icon : <IconLock className="w-6 h-6 text-gray-300" />}
                                                </div>
                                                <span className={`text-[10px] text-center font-medium leading-tight
                                                    ${isDiscovered ? 'text-gray-600' : 'text-gray-300'}
                                                `}>
                                                    {isDiscovered ? item.name : '???'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CollectionModal;
