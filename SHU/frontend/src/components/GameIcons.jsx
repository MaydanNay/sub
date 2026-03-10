import React from 'react';

// --- COMMON ICONS ---
// Updated icons
export const IconCoin = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" className="fill-yellow-400" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="6" className="stroke-yellow-600" strokeWidth="1.5" strokeDasharray="2 2" />
        <path d="M10 8h4v8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="stroke-yellow-700" />
    </svg>
);

export const IconSad = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" className="fill-gray-200 stroke-gray-400" strokeWidth="2" />
        <path d="M8 9h2M14 9h2" className="stroke-gray-500" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 16c-1-2-2.5-3-4-3s-3 1-4 3" className="stroke-gray-500" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const IconSkull = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2c-4 0-7 3-7 7 0 2.5 1.5 4.5 3.5 5.5v3h7v-3c2-1 3.5-3 3.5-5.5 0-4-3-7-7-7z" className="fill-gray-300 stroke-gray-600" strokeWidth="2" />
        <circle cx="9" cy="8" r="1.5" className="fill-gray-800" />
        <circle cx="15" cy="8" r="1.5" className="fill-gray-800" />
        <path d="M10 14h4" className="stroke-gray-800" strokeWidth="2" />
        <path d="M12 17v3" className="stroke-gray-600" strokeWidth="2" />
    </svg>
);

export const IconDiamond = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9l6 11 6-11H6z" className="fill-blue-400 stroke-blue-600" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6 9l4.5-5h7L22 9" className="fill-blue-300 stroke-blue-600" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10.5 4L12 9 13.5 4" className="stroke-blue-600" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M22 9L12 20 2 9" className="stroke-blue-600" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);

export const IconGift = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M20 12v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9" className="fill-pink-400" stroke="currentColor" strokeWidth="2" />
        <path d="M12 12v10M12 12V7" stroke="currentColor" strokeWidth="2" className="stroke-red-600" />
        <path d="M12 7H7.5a2.5 2.5 0 010-5C10 2 12 5 12 7z" className="fill-red-400" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7h4.5a2.5 2.5 0 000-5C14 2 12 5 12 7z" className="fill-red-400" stroke="currentColor" strokeWidth="2" />
        <rect x="2" y="9" width="20" height="3" rx="1" className="fill-pink-500" stroke="currentColor" strokeWidth="2" />
    </svg>
);

export const IconStar = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" className="fill-yellow-400 stroke-yellow-600" strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

export const IconHeart = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" className="fill-pink-500 stroke-pink-700" strokeWidth="1.5" />
    </svg>
);

export const IconEye = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconShield = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// --- CATEGORY ICONS ---

export const IconLightning = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" className="fill-yellow-400 stroke-yellow-600" strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

export const IconChart = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3v18h18" className="stroke-emerald-600" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 17V9" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 17V5" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 17v-5" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const IconBrain = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4.5a2.5 2.5 0 00-4.96-.46 2.5 2.5 0 00-1.98 3 2.5 2.5 0 00-1.32 4.24 3 3 0 00.34 2.48 3.04 3.04 0 00-1.74 3.24l.32 1.62a1 1 0 00.98.8h11.96a1 1 0 00.98-.8l.32-1.62a3.04 3.04 0 00-1.74-3.24 3 3 0 00.34-2.48 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-1.98-3 2.5 2.5 0 00-4.96.46z" className="fill-pink-200 stroke-pink-500" strokeWidth="2" />
        <path d="M12 13v9" className="stroke-pink-400" strokeWidth="2" />
        <path d="M12 18h4" className="stroke-pink-400" strokeWidth="2" />
        <path d="M12 15h-3" className="stroke-pink-400" strokeWidth="2" />
    </svg>
);

export const IconUsers = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" className="fill-blue-100 stroke-blue-500" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" className="fill-blue-100 stroke-blue-500" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" className="stroke-blue-400" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 010 7.75" className="stroke-blue-400" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// --- GAME THUMBNAIL ICONS ---

export const IconDice = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" className="fill-white stroke-indigo-500" strokeWidth="2" />
        <circle cx="8" cy="8" r="2" className="fill-indigo-500" />
        <circle cx="16" cy="16" r="2" className="fill-indigo-500" />
        <circle cx="12" cy="12" r="2" className="fill-indigo-500" />
        <circle cx="16" cy="8" r="2" className="fill-indigo-500" />
        <circle cx="8" cy="16" r="2" className="fill-indigo-500" />
    </svg>
);

// Dice Game Faces
export const IconDiceFace = ({ value, className }) => {
    const dots = {
        1: [{ cx: 12, cy: 12 }],
        2: [{ cx: 6, cy: 6 }, { cx: 18, cy: 18 }],
        3: [{ cx: 6, cy: 6 }, { cx: 12, cy: 12 }, { cx: 18, cy: 18 }],
        4: [{ cx: 6, cy: 6 }, { cx: 18, cy: 6 }, { cx: 6, cy: 18 }, { cx: 18, cy: 18 }],
        5: [{ cx: 6, cy: 6 }, { cx: 18, cy: 6 }, { cx: 12, cy: 12 }, { cx: 6, cy: 18 }, { cx: 18, cy: 18 }],
        6: [{ cx: 6, cy: 6 }, { cx: 18, cy: 6 }, { cx: 6, cy: 12 }, { cx: 18, cy: 12 }, { cx: 6, cy: 18 }, { cx: 18, cy: 18 }],
    };

    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="22" height="22" rx="4" className="fill-white stroke-gray-300" strokeWidth="2" />
            {dots[value]?.map((dot, i) => (
                <circle key={i} cx={dot.cx} cy={dot.cy} r="2.5" className="fill-gray-800" />
            ))}
        </svg>
    );
};

export const IconWheel = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" className="stroke-purple-500" strokeWidth="2" />
        <path d="M12 2v20M2 12h20" className="stroke-purple-300" strokeWidth="2" />
        <path d="M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" className="stroke-purple-300" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" className="fill-purple-500" />
    </svg>
);

export const IconPointer = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12l18-8v16L3 12z" className="fill-red-500 stroke-red-700" strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

export const IconTicket = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z" className="fill-orange-100 stroke-orange-500" strokeWidth="2" />
        <path d="M10 5v14" className="stroke-orange-300" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="16" cy="12" r="3" className="fill-orange-500" />
    </svg>
);

export const IconCoupon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M21 6H3a2 2 0 00-2 2v8a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2z" className="fill-green-100 stroke-green-500" strokeWidth="2" />
        <path d="M10 6v12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="stroke-green-400" />
        <circle cx="2" cy="12" r="2" className="fill-white" />
        <circle cx="22" cy="12" r="2" className="fill-white" />
    </svg>
);

export const IconTruck = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M1 3h15v13H1z" className="fill-blue-400 stroke-blue-600" strokeWidth="2" />
        <path d="M16 8h4l3 3v5h-7V8z" className="fill-blue-300 stroke-blue-600" strokeWidth="2" />
        <circle cx="5.5" cy="18.5" r="2.5" className="fill-gray-800" />
        <circle cx="18.5" cy="18.5" r="2.5" className="fill-gray-800" />
    </svg>
);

export const IconJackpot = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l2.5 7h7.5l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5z" className="fill-amber-400 stroke-amber-600" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" className="fill-amber-200 stroke-amber-500" strokeWidth="1" />
    </svg>
);

export const IconTarget = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" className="stroke-red-500" strokeWidth="2" />
        <circle cx="12" cy="12" r="6" className="stroke-red-500" strokeWidth="2" />
        <circle cx="12" cy="12" r="2" className="fill-red-500" />
    </svg>
);

export const IconBomb = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="13" r="8" className="fill-gray-800 stroke-black" strokeWidth="2" />
        <path d="M12 5V2M15 4l2-2M9 4l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="stroke-orange-500" />
        <path d="M14 11l2-2" stroke="currentColor" strokeWidth="2" className="stroke-gray-500" />
    </svg>
);

export const IconBasket = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8l2 12a2 2 0 002 2h10a2 2 0 002-2l2-12H3z" className="fill-amber-700 stroke-amber-900" strokeWidth="2" />
        <path d="M8 8V4a2 2 0 012-2h4a2 2 0 012 2v4" className="stroke-amber-900" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const IconClover = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c0-3.5 2.5-6 6-6s6 2.5 6 6-2.5 6-6 6c-3.5 0-6-2.5-6-6zm0 0c0 3.5-2.5 6-6 6s-6-2.5-6-6 2.5-6 6-6c3.5 0 6 2.5 6 6zm0 0c-3.5 0-6-2.5-6-6s2.5-6 6-6 6 2.5 6 6-2.5 6-6 6zm0 0c3.5 0 6 2.5 6 6s-2.5 6-6 6-6-2.5-6-6 2.5-6 6-6z" className="fill-green-500 stroke-green-700" strokeWidth="1" />
    </svg>
);

export const IconChest = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12v7a2 2 0 002 2h16a2 2 0 002-2v-7H2z" className="fill-amber-700 stroke-amber-900" strokeWidth="2" />
        <path d="M22 12V8a2 2 0 00-2-2H4a2 2 0 00-2 2v4h20z" className="fill-amber-600 stroke-amber-900" strokeWidth="2" />
        <path d="M10 12h4v3a2 2 0 01-4 0v-3z" className="fill-yellow-400 stroke-amber-900" strokeWidth="2" />
        <path d="M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" className="stroke-amber-900" />
    </svg>
);

export const IconSlotMachine = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="20" height="14" rx="2" className="fill-indigo-900 stroke-indigo-500" strokeWidth="2" />
        <path d="M6 10h12v6H6z" className="fill-white" />
        <path d="M10 10v6M14 10v6" className="stroke-gray-300" strokeWidth="1" />
        <circle cx="18" cy="4" r="2" className="fill-red-500" />
        <path d="M18 6v4" className="stroke-gray-400" strokeWidth="2" />
    </svg>
);

export const IconCherry = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c-2-4-2-8 3-10M12 12c2-4 2-8-3-10" className="stroke-green-700" strokeWidth="2" strokeLinecap="round" />
        <circle cx="7" cy="17" r="4" className="fill-red-600 stroke-red-800" strokeWidth="1.5" />
        <circle cx="17" cy="17" r="4" className="fill-red-600 stroke-red-800" strokeWidth="1.5" />
        <path d="M12 12l-2 2M12 12l2 2" className="stroke-green-700" strokeWidth="2" />
    </svg>
);

export const IconLemon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M20 12c0 5-4 9-8 9s-8-4-8-9 4-9 8-9 8 4 8 9z" className="fill-yellow-300 stroke-yellow-500" strokeWidth="2" />
        <path d="M22 12h-2M4 12H2" className="stroke-yellow-600" strokeWidth="2" />
    </svg>
);

export const IconOrange = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" className="fill-orange-400 stroke-orange-600" strokeWidth="2" />
        <circle cx="12" cy="12" r="1.5" className="fill-orange-600" />
        <path d="M12 12l3-5M12 12l-3-5M12 12l5 3M12 12l-5 3" className="stroke-orange-600" strokeWidth="1.5" />
    </svg>
);

export const IconGrape = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2v4" className="stroke-green-700" strokeWidth="2" />
        <circle cx="12" cy="7" r="3" className="fill-purple-500 stroke-purple-700" />
        <circle cx="9" cy="12" r="3" className="fill-purple-500 stroke-purple-700" />
        <circle cx="15" cy="12" r="3" className="fill-purple-500 stroke-purple-700" />
        <circle cx="12" cy="17" r="3" className="fill-purple-500 stroke-purple-700" />
        <circle cx="9" cy="18" r="2.5" className="fill-purple-500 stroke-purple-700" />
        <circle cx="15" cy="18" r="2.5" className="fill-purple-500 stroke-purple-700" />
        <circle cx="12" cy="21" r="2.5" className="fill-purple-500 stroke-purple-700" />
    </svg>
);

export const IconWatermelon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10H2z" className="fill-red-500 stroke-green-700" strokeWidth="3" />
        <path d="M2 12h20" className="stroke-white" strokeWidth="1.5" />
        <circle cx="8" cy="16" r="1" className="fill-black" />
        <circle cx="12" cy="18" r="1" className="fill-black" />
        <circle cx="16" cy="16" r="1" className="fill-black" />
    </svg>
);

export const IconSeven = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <text x="12" y="20" fontSize="22" fontWeight="900" textAnchor="middle" fill="url(#grad7)" stroke="#b91c1c" strokeWidth="1">7</text>
        <defs>
            <linearGradient id="grad7" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#f87171", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#dc2626", stopOpacity: 1 }} />
            </linearGradient>
        </defs>
    </svg>
);

export const IconSheep = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="8" width="12" height="10" rx="4" className="fill-white stroke-gray-800" strokeWidth="2" />
        <circle cx="12" cy="13" r="8" className="stroke-gray-800" strokeWidth="2" strokeDasharray="2 4" />
        <circle cx="8" cy="11" r="1" className="fill-black" />
        <circle cx="16" cy="11" r="1" className="fill-black" />
        <path d="M8 18v3M16 18v3" className="stroke-gray-800" strokeWidth="2" />
    </svg>
);

export const IconCoffee = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8h1a4 4 0 010 8h-1" className="stroke-amber-700" strokeWidth="2" />
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" className="fill-amber-100 stroke-amber-700" strokeWidth="2" />
        <path d="M6 1v3M10 1v3M14 1v3" className="stroke-amber-400" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const IconPuzzle = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3.5a2.5 2.5 0 00-5 0v2A2.5 2.5 0 002.5 8h-2a2.5 2.5 0 000 5h2a2.5 2.5 0 002.5 2.5v2a2.5 2.5 0 005 0v-2a2.5 2.5 0 002.5-2.5h2a2.5 2.5 0 000-5h-2A2.5 2.5 0 0010 5.5v-2z" className="fill-violet-400 stroke-violet-600" strokeWidth="2" />
    </svg>
);

export const IconMap = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" className="fill-emerald-100 stroke-emerald-600" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 3v15M15 6v15" className="stroke-emerald-600" strokeWidth="1.5" />
    </svg>
);

export const IconQuestion = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" className="stroke-teal-500" strokeWidth="2" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" className="stroke-teal-600" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" className="fill-teal-600" />
    </svg>
);

export const IconCards = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="2" width="12" height="16" rx="2" className="fill-white stroke-gray-400" strokeWidth="2" />
        <path d="M8 8l2 3 2-3M8 12h4" className="stroke-red-500" strokeWidth="2" />
        <rect x="9" y="6" width="12" height="16" rx="2" className="fill-indigo-100 stroke-indigo-500" strokeWidth="2" />
    </svg>
);

export const IconZap = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" className="fill-yellow-300 stroke-yellow-500" strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

export const IconTrophy = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M8 21h8M12 17v4M7 4h10c0 8-3.5 13-5 13S7 12 7 4z" className="fill-yellow-200 stroke-yellow-600" strokeWidth="2" />
        <path d="M17 4v5c0 3 2 5 2 5s2-2 2-5V4h-4zM7 4v5c0 3-2 5-2 5s-2-2-2-5V4h4z" className="stroke-yellow-600" strokeWidth="2" />
    </svg>
);

export const IconHandshake = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 11h8a2 2 0 012 2v2a2 2 0 01-2 2h-3l-2 3-2-6-3-2-2-2 2-2 2 3z" className="fill-blue-100 stroke-blue-500" strokeWidth="2" />
    </svg>
);

export const IconVote = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" className="fill-green-100 stroke-green-500" strokeWidth="2" />
    </svg>
);
export const IconDownload = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15V3m0 12l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// --- UTILITY ICONS ---

export const IconPlus = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconX = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconCheck = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconSettings = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
);

export const IconArrowLeft = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconArrowRight = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconCamera = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
);

export const IconLock = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" />
    </svg>
);

export const IconShoppingBag = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconChefHat = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 011.05-1.54 5 5 0 017.08 0A5.11 5.11 0 0116.59 6 4 4 0 0118 13.87V21H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="6" y1="17" x2="18" y2="17" stroke="currentColor" strokeWidth="2" />
    </svg>
);

export const IconBook = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
export const IconSushi = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12h20M2 12l2 3h16l2-3M2 12l2-3h16l2 3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="stroke-red-600" />
        <path d="M12 5v2m0 10v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" className="fill-white stroke-red-500" strokeWidth="2" />
        <path d="M7 12h10" stroke="currentColor" strokeWidth="2" className="stroke-red-500" strokeDasharray="1 2" />
    </svg>
);
export const IconFish = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M22 10c-2-4-7-6-12-6-5 0-9 4-9 9s4 9 9 9c5 0 10-2 12-6-2-2-2-4 0-6z" className="fill-orange-300 stroke-orange-500" strokeWidth="2" />
        <circle cx="16" cy="10" r="1.5" className="fill-black" />
        <path d="M5 13l2-2m-2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const IconJerboa = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="14" r="7" className="fill-amber-200 stroke-amber-600" strokeWidth="1.5" />
        <path d="M9 8c0-3 1-5 3-5s3 2 3 5" className="stroke-amber-600" strokeWidth="1.5" fill="none" />
        <path d="M7 6c0-2.5 1-4 2.5-4" className="stroke-amber-600" strokeWidth="1.5" fill="none" />
        <path d="M17 6c0-2.5-1-4-2.5-4" className="stroke-amber-600" strokeWidth="1.5" fill="none" />
        <circle cx="9" cy="13" r="1" className="fill-black" />
        <circle cx="15" cy="13" r="1" className="fill-black" />
        <path d="M11 16c1 1 2 0 2-1" className="stroke-amber-800" strokeWidth="1" fill="none" />
        <path d="M10 21l-2-2M14 21l2-2" className="stroke-amber-800" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const IconFlower = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C14 5 17 7 20 7C17 7 14 10 12 12C10 10 7 7 4 7C7 7 10 5 12 2Z" className="fill-pink-300 stroke-pink-500" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 12C14 15 17 17 20 17C17 17 14 20 12 22C10 20 7 17 4 17C7 17 10 15 12 12Z" className="fill-pink-300 stroke-pink-500" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" className="fill-yellow-300 stroke-yellow-500" strokeWidth="2" />
    </svg>
);

export const IconLipstick = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M10 14h4v8h-4z" className="fill-gray-200 stroke-gray-400" strokeWidth="2" />
        <path d="M7 14h10" className="stroke-gray-400" strokeWidth="2" />
        <path d="M10 6h4v8h-4z" className="fill-red-500 stroke-red-600" strokeWidth="2" />
        <path d="M10 6l2-4 2 4" className="fill-red-400 stroke-red-600" strokeWidth="2" />
    </svg>
);

export const IconClock = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const IconRotateCw = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

export const IconList = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconHome = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9.5L12 3l9 6.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2V9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
