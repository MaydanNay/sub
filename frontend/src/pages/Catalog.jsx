import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeCustomizer from '../components/ThemeCustomizer';
import {
    IconLightning, IconChart, IconBrain, IconUsers,
    IconDice, IconWheel, IconTicket, IconTarget, IconSlotMachine, IconChest,
    IconSheep, IconCoffee, IconPuzzle, IconMap,
    IconQuestion, IconCards, IconZap,
    IconTrophy, IconHandshake, IconVote, IconDownload
} from '../components/GameIcons';
import InstallPWA from '../components/InstallPWA';

const Catalog = () => {
    const [activeCategory, setActiveCategory] = useState(() => {
        return localStorage.getItem('catalog_active_category') || 'instant';
    });

    const handleResetDemo = () => {
        if (window.confirm('Сбросить весь демо-прогресс (монеты, квесты, уровни)?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const categories = [
        {
            id: 'instant',
            title: 'Мгновенные',
            fullTitle: 'Мгновенные игры',
            description: 'Быстрые игры с мгновенным результатом',
            icon: IconLightning,
            color: 'from-amber-400 to-orange-500',
            textColor: 'text-amber-600',
            games: [
                { id: 'dice', title: 'Брось кубик', description: 'Классическая механика шанса', icon: IconDice, color: 'from-blue-500 to-indigo-600', status: 'active', goal: 'Удержание' },
                { id: 'wheel', title: 'Колесо', description: 'Раздача бонусов и призов', icon: IconWheel, color: 'from-purple-500 to-fuchsia-600', status: 'active', goal: 'Конверсия' },
                { id: 'scratch', title: 'Скретч-карта', description: 'Сотри и выиграй приз', icon: IconTicket, color: 'from-green-400 to-emerald-600', status: 'active', goal: 'Лояльность' },
                { id: 'drop', title: 'Призопад', description: 'Лови призы в корзину', icon: IconTarget, color: 'from-red-400 to-pink-600', status: 'active', goal: 'Вовлечение' },
                { id: 'slots', title: 'Слоты', description: 'Испытай свою удачу', icon: IconSlotMachine, color: 'from-yellow-400 to-amber-600', status: 'active', goal: 'Азарт' },
                { id: 'mystery', title: 'Мистери бокс', description: 'Открой и получи приз', icon: IconChest, color: 'from-amber-500 to-orange-700', status: 'active', goal: 'Ажиотаж' },
            ]
        },
        {
            id: 'progressive',
            title: 'Прогресс',
            fullTitle: 'Прогрессивные игры',
            description: 'Развивайся и накапливай награды',
            icon: IconChart,
            color: 'from-emerald-400 to-teal-600',
            textColor: 'text-emerald-600',
            games: [
                { id: 'sheep', title: 'Тамагочи', description: 'Вырасти питомца', icon: IconSheep, color: 'from-green-400 to-emerald-600', status: 'active', goal: 'LTV' },
                { id: 'coffee', title: 'Кофе Магнат', description: 'Управляй кофейней', icon: IconCoffee, color: 'from-amber-500 to-orange-700', status: 'active', goal: 'Вовлечение' },
                { id: 'puzzle', title: 'Пазлы', description: 'Собери коллекцию', icon: IconPuzzle, color: 'from-violet-400 to-purple-600', status: 'active', goal: 'Повторные чеки' },
                { id: 'treasure', title: 'Карта сокровищ', description: 'Пройди путь к призу', icon: IconMap, color: 'from-yellow-500 to-amber-700', status: 'active', goal: 'LTV' },
                { id: 'quest', title: 'Квест', description: 'Пройди путь героя', icon: IconMap, color: 'from-cyan-400 to-blue-600', status: 'active', goal: 'Онбординг' },
            ]
        },
        {
            id: 'skill',
            title: 'Скилл',
            fullTitle: 'Скилл-игры',
            description: 'Проверь свои навыки и знания',
            icon: IconBrain,
            color: 'from-indigo-400 to-purple-600',
            textColor: 'text-indigo-600',
            games: [
                { id: 'barista', title: 'Бариста', description: 'Стань мастером кофе', icon: IconCoffee, color: 'from-amber-600 to-stone-700', status: 'active', goal: 'Обучение' },
                { id: 'quiz', title: 'Викторина', description: 'Ответь на вопросы', icon: IconQuestion, color: 'from-teal-400 to-cyan-600', status: 'active', goal: 'Знания' },
                { id: 'memory', title: 'Память', description: 'Найди пары карт', icon: IconCards, color: 'from-blue-400 to-indigo-600', status: 'active', goal: 'Внимание' },
                { id: 'reaction', title: 'Реакция', description: 'Жми как можно быстрее', icon: IconZap, color: 'from-yellow-400 to-orange-500', status: 'active', goal: 'Скорость' },
            ]
        },
        {
            id: 'social',
            title: 'Социальные',
            fullTitle: 'Социальные игры',
            description: 'Соревнуйся с друзьями',
            icon: IconUsers,
            color: 'from-blue-400 to-cyan-600',
            textColor: 'text-blue-600',
            games: [
                { id: 'leaderboard', title: 'Топ игроков', description: 'Стань лучшим', icon: IconTrophy, color: 'from-yellow-400 to-amber-600', status: 'active', goal: 'Соревнование' },
                { id: 'referral', title: 'Пригласи', description: 'Зови друзей', icon: IconHandshake, color: 'from-indigo-400 to-purple-600', status: 'active', goal: 'Виральность' },
                { id: 'vote', title: 'Голосования', description: 'Твой голос важен', icon: IconVote, color: 'from-green-400 to-emerald-600', status: 'active', goal: 'Фидбек' },
            ]
        },
    ];

    const currentCategory = categories.find(c => c.id === activeCategory);

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 font-sans selection:bg-purple-100">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 pt-16 pb-8 px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4 tracking-tight"
                >
                    Игровой Центр
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 text-lg max-w-2xl mx-auto"
                >
                    Вовлекайте клиентов через геймификацию. Выберите механику для ваших бизнес-целей.
                </motion.p>

                {/* PWA Install Button */}
                <InstallPWA variant="header" />
            </header>

            {/* Navigation Tabs */}
            <div className="relative z-20 sticky top-4 mb-10 px-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl rounded-full p-2 max-w-2xl mx-auto flex justify-between gap-1 overflow-x-auto scrollbar-hide">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    localStorage.setItem('catalog_active_category', cat.id);
                                }}
                                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-500 hover:bg-gray-100/50'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${cat.color} shadow-lg`}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    {cat.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <main className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Category Description */}
                        <div className="text-center mb-10">
                            <h2 className={`text-2xl font-bold mb-1 ${currentCategory.textColor}`}>
                                {currentCategory.fullTitle}
                            </h2>
                            <p className="text-gray-400">{currentCategory.description}</p>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {currentCategory.games.map((game, index) => {
                                const GameIcon = game.icon;
                                return (
                                    <Link to={`/game/${game.id}`} key={game.id} className="group cursor-pointer">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ y: -10 }}
                                            className="h-full bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-purple-500/20 transition-all duration-300"
                                        >
                                            {/* Card Background Gradient Blob */}
                                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.color} opacity-10 rounded-bl-[100px] transition-transform group-hover:scale-150 duration-500`}></div>

                                            <div className="relative z-10">
                                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${game.color} p-4 text-white shadow-lg mb-6 group-hover:rotate-6 transition-transform duration-300`}>
                                                    <GameIcon className="w-full h-full drop-shadow-md" />
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                                                    {game.title}
                                                </h3>

                                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                                    {game.description}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-wide">
                                                        {game.goal}
                                                    </span>
                                                    {game.status === 'active' && (
                                                        <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full flex items-center gap-1">
                                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                            Live
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Hover Button */}
                                            <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-lg">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Actions */}
            <div className="text-center pb-12 relative z-10">
                <button
                    onClick={handleResetDemo}
                    className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors backdrop-blur-sm px-4 py-2 rounded-lg"
                >
                    Сбросить демо-данные
                </button>
            </div>

            {/* B2B Tools */}
            <ThemeCustomizer />
        </div>
    );
};

export default Catalog;
