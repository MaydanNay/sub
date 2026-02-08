import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GameHeader = ({ title, description, icon, color = "purple" }) => {
    // Determine if icon is a React component or a string (emoji)
    const isComponent = typeof icon === 'function';

    return (
        <header className="relative z-10 pt-4 pb-2 px-4 flex items-center justify-between">
            <Link to="/" className="p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors">
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </Link>

            <div className="text-center flex-1 pr-10"> {/* pr-10 balances the back button width */}
                <h1 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    {icon && (
                        isComponent
                            ? React.createElement(icon, { className: `w-6 h-6 text-${color}-600` })
                            : <span>{icon}</span>
                    )}
                    {title}
                </h1>
                {description && <p className="text-xs text-gray-500">{description}</p>}
            </div>
        </header>
    );
};

export default GameHeader;
