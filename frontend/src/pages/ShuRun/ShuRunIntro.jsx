import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Timer, Medal, Trophy, ChevronRight, Zap } from 'lucide-react';
import ShuRunAuth from './ShuRunAuth';
import useShuRunStore from './useShuRunStore';

const FEATURES = [
    {
        icon: Timer,
        title: 'Беги где хочешь',
        desc: 'Парк, улица, беговая дорожка — любое место в любое время',
        color: 'text-emerald-400 bg-emerald-400/10',
    },
    {
        icon: Medal,
        title: 'Физические медали',
        desc: 'Получай настоящие медали финишёра по почте',
        color: 'text-amber-400 bg-amber-400/10',
    },
    {
        icon: Trophy,
        title: 'Рейтинги и призы',
        desc: 'Соревнуйся с бегунами Казахстана и побеждай',
        color: 'text-blue-400 bg-blue-400/10',
    },
];

const ShuRunIntro = () => {
    const navigate = useNavigate();
    const user = useShuRunStore(s => s.user);
    const [isAuthOpen, setIsAuthOpen] = React.useState(false);

    const handleStartClick = () => {
        if (user?.isAuthenticated) {
            navigate('/game/shurun/home');
        } else {
            setIsAuthOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-6 pb-10 relative overflow-hidden font-montserrat">

            {/* Animated BG blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-emerald-500 blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                    className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-500 blur-3xl"
                />
                {/* Running path lines */}
                <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 400 800">
                    <motion.path
                        d="M 50 400 Q 200 200 350 400 Q 250 600 50 600"
                        stroke="#10b981" strokeWidth="2" fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.path
                        d="M 0 300 Q 150 100 300 300 Q 200 500 0 500"
                        stroke="#3b82f6" strokeWidth="2" fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: 1 }}
                    />
                </svg>
            </div>

            {/* Logo area */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 text-center mt-12"
            >
                {/* Icon */}
                <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-7xl mb-4"
                >
                    🏃
                </motion.div>

                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-[2px] bg-emerald-400" />
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em]">SHU.STUDIO</span>
                    <div className="w-8 h-[2px] bg-emerald-400" />
                </div>

                <h1 className="text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 drop-shadow-lg font-montserrat">
                    ShuRun
                </h1>
                <p className="text-slate-400 font-bold mt-2 text-sm tracking-wide">
                    Виртуальные марафоны Казахстана
                </p>
            </motion.div>

            {/* Features */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="z-10 w-full max-w-sm space-y-3"
            >
                {FEATURES.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.15 }}
                        className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4"
                    >
                        <div className={`p-3 rounded-xl ${f.color} shrink-0`}>
                            <f.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">{f.title}</div>
                            <div className="text-xs text-slate-400 leading-tight mt-0.5">{f.desc}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="z-10 w-full max-w-sm"
            >
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartClick}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all"
                >
                    <Zap className="w-5 h-5" />
                    Начать бегать
                    <ChevronRight className="w-5 h-5" />
                </motion.button>
                <p className="text-center text-xs text-slate-600 mt-3 font-medium">
                    Бесплатно · Без ограничений по городу
                </p>
            </motion.div>

            <ShuRunAuth
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onShowCatalog={() => window.location.href = 'https://app.shustudio.kz'}
            />
        </div>
    );
};

export default ShuRunIntro;
