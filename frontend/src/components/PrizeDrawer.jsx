import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconGift, IconSad } from './GameIcons';

const PrizeDrawer = ({ prizes = [], colorClass = "text-indigo-600", itemBgClass = "bg-indigo-50", className = "", closedHeight = "h-[35vh]" }) => {
    // States: 'minimized' | 'closed' | 'open'
    const [drawerState, setDrawerState] = useState('closed');

    const toggleDrawer = () => {
        if (drawerState === 'minimized') {
            setDrawerState('closed');
        } else if (drawerState === 'closed') {
            setDrawerState('open');
        } else {
            setDrawerState('closed');
        }
    };

    const minimizeDrawer = (e) => {
        e.stopPropagation();
        setDrawerState('minimized');
    };

    const getHeightClass = () => {
        if (drawerState === 'minimized') return 'h-14';
        if (drawerState === 'open') return 'h-[85vh]';
        return closedHeight;
    };

    return (
        <div
            className={`
                fixed bottom-0 left-0 right-0 z-40 bg-white md:static md:z-auto
                md:bg-white/80 md:backdrop-blur-md 
                rounded-t-[2rem] md:rounded-3xl p-5 
                shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] md:shadow-xl 
                flex flex-col 
                md:h-auto
                transition-all duration-500 ease-spring
                ${getHeightClass()}
                ${className}
            `}
        >
            {/* Handle for mobile visual cue - Clickable to toggle */}
            <div
                className="w-full flex justify-center pb-4 cursor-pointer md:hidden"
                onClick={toggleDrawer}
            >
                <div className={`w-12 h-1.5 rounded-full transition-colors ${drawerState === 'open' ? 'bg-indigo-300' : 'bg-gray-300'}`}></div>
            </div>

            <div className="flex items-center justify-between">
                <h3
                    className="font-bold text-gray-800 flex items-center gap-2 cursor-pointer md:cursor-default flex-1"
                    onClick={toggleDrawer}
                >
                    <IconGift className={`w-5 h-5 ${colorClass}`} />
                    Возможные призы
                    <span className="text-xs text-gray-400 font-normal ml-2 md:hidden bg-gray-100 px-2 py-1 rounded-full">
                        {drawerState === 'minimized' ? 'Показать' : drawerState === 'open' ? 'Свернуть' : 'Развернуть'}
                    </span>
                </h3>

                {/* Minimize button - only on mobile when not minimized */}
                {drawerState !== 'minimized' && (
                    <button
                        onClick={minimizeDrawer}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                        title="Скрыть"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Content - hidden when minimized */}
            <AnimatePresence>
                {drawerState !== 'minimized' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 flex-1 mt-3"
                    >
                        {prizes.length > 0 ? prizes.map((prize, idx) => {
                            const isLoss = prize.type === 'loss';
                            return (
                                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl shadow-sm border ${isLoss ? 'bg-red-50/50 border-red-100 opacity-80' : 'bg-gray-50 md:bg-white border-gray-100'}`}>
                                    <div className={`w-10 h-10 rounded-full p-1 flex-shrink-0 ${isLoss ? 'bg-red-100' : itemBgClass}`}>
                                        {isLoss ? (
                                            <IconSad className="w-full h-full text-red-400" />
                                        ) : prize.image_url ? (
                                            <img src={prize.image_url} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <IconGift className={`w-full h-full ${colorClass.replace('text-', 'text-opacity-60 text-')}`} />
                                        )}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm leading-tight ${isLoss ? 'text-red-800' : 'text-gray-800'}`}>{prize.title}</p>
                                        <p className={`text-[10px] line-clamp-1 ${isLoss ? 'text-red-600' : 'text-gray-500'}`}>{prize.description}</p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Загрузка призов...
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrizeDrawer;
