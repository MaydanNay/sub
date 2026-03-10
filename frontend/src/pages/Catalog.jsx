import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IconLightning, IconChart, IconBrain,
    IconDice, IconWheel, IconTicket, IconTarget, IconSlotMachine, IconChest,
    IconCoffee, IconPuzzle, IconMap,
    IconQuestion, IconCards, IconZap, IconTrophy,
    IconDownload, IconSushi, IconJerboa, IconFlower, IconGift, IconStar
} from '../components/GameIcons';
import Header from '../components/Header';
import { cn } from '../utils/cn';
import { storage } from '../utils/storage';


// Asset Preloading
import shuBankIcon from './ShuBank/images/pers/0.PNG';
import shuBoomIcon from './ShuBoom/images/pers_1_v2.PNG';
import shuShiIcon from './ShuShi/images/dishes/1.PNG';

const Catalog = ({ openModal }) => {
    const [activeCategory, setActiveCategory] = useState(() => {
        return storage.get('catalog_active_category', 'startups');
    });

    const categories = [
        {
            id: 'startups',
            title: 'Стартапы',
            fullTitle: 'Стартап-проекты',
            description: 'Инновационные решения и новые игровые механики',
            icon: IconZap,
            color: 'from-emerald-400 to-teal-600',
            textColor: 'text-emerald-600',
            games: [
                { id: 'shurun', title: 'ShuRun', description: 'Виртуальные марафоны', icon: IconTrophy, color: 'from-emerald-500 to-teal-600', status: 'active', goal: 'Спорт' },
            ]
        },
        {
            id: 'corporate',
            title: 'Крупные',
            fullTitle: 'Крупные проекты',
            description: 'Специальные проекты для наших крупных партнеров',
            icon: IconStar,
            color: 'from-pink-400 to-rose-600',
            textColor: 'text-pink-600',
            games: [
                { id: 'shuboom', title: 'ShuBoom', description: 'Метавселенная SHU', icon: IconTarget, thumbnail: shuBoomIcon, color: 'from-red-500 to-pink-600', status: 'active', goal: 'Лояльность' },
                { id: 'shubank', title: 'ShuBank', description: 'Управляй капиталом', icon: IconChart, thumbnail: shuBankIcon, color: 'from-emerald-500 to-teal-700', status: 'active', goal: 'Продажи' },
                { id: 'shushi', title: 'ShuShi', description: 'Симулятор суши', icon: IconSushi, thumbnail: shuShiIcon, color: 'from-red-400 to-orange-500', status: 'active', goal: 'Фудтех' },
                { id: 'shudom', title: 'ShuDom', description: 'Твой виртуальный дом', icon: IconChest, color: 'from-amber-600 to-orange-700', status: 'active', goal: 'Активность' },
                { id: 'shumetal', title: 'ShuMetal', description: 'Металлургическая игра', icon: IconZap, color: 'from-gray-500 to-slate-700', status: 'active', goal: 'Промышленность' },
                { id: 'shubeauty', title: 'ShuBeauty', description: 'Мир красоты', icon: IconFlower, color: 'from-pink-300 to-rose-400', status: 'active', goal: 'Бьюти' },
                { id: 'shuqaz', title: 'ShuQaz', description: 'Изучай казахский', icon: IconJerboa, color: 'from-blue-400 to-cyan-600', status: 'active', goal: 'Образование' },
                { id: 'nauryz', title: 'Наурыз', description: 'Весенний праздник', icon: IconFlower, color: 'from-green-400 to-emerald-600', status: 'active', goal: 'Традиции' },
                { id: 'shalam', title: 'Shalam', description: 'Защити природу', icon: IconTarget, color: 'from-emerald-500 to-green-700', status: 'active', goal: 'Экология' },
                { id: 'shugnum', title: 'Olivier Doda', description: 'Новогодний квест', icon: IconGift, color: 'from-red-500 to-green-500', status: 'active', goal: 'Праздник' },
            ]
        },
        {
            id: 'instant',
            title: 'Мгновенные',
            fullTitle: 'Мгновенные выигрыши',
            description: 'Быстрые игры с моментальным результатом',
            icon: IconLightning,
            color: 'from-yellow-400 to-orange-500',
            textColor: 'text-yellow-600',
            games: [
                { id: 'scratch', title: 'Скретч-карта', description: 'Стирай и выигрывай', icon: IconTicket, color: 'from-purple-500 to-indigo-600', status: 'active', goal: 'Удержание' },
                { id: 'wheel', title: 'Колесо удачи', description: 'Крути за призами', icon: IconWheel, color: 'from-pink-500 to-rose-600', status: 'active', goal: 'Азарт' },
                { id: 'slots', title: 'Слоты', description: 'Классический азарт', icon: IconSlotMachine, color: 'from-amber-400 to-orange-600', status: 'active', goal: 'Драйв' },
                { id: 'dice', title: 'Кости', description: 'Испытай удачу', icon: IconDice, color: 'from-blue-500 to-indigo-700', status: 'active', goal: 'Риск' },
                { id: 'drop', title: 'Падающие призы', description: 'Лови бонусы', icon: IconGift, color: 'from-green-500 to-emerald-600', status: 'active', goal: 'Реакция' },
                { id: 'mystery', title: 'Mystery Box', description: 'Открой секрет', icon: IconChest, color: 'from-orange-500 to-red-600', status: 'active', goal: 'Сюрприз' },
                { id: 'treasure', title: 'Карта сокровищ', description: 'Найди клад', icon: IconMap, color: 'from-teal-500 to-cyan-600', status: 'active', goal: 'Поиск' },
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
                { id: 'puzzle', title: 'Пазл', description: 'Собери картинку', icon: IconPuzzle, color: 'from-blue-500 to-indigo-600', status: 'active', goal: 'Логика' },
                { id: 'quest', title: 'Квест', description: 'Пройди историю', icon: IconMap, color: 'from-emerald-500 to-teal-600', status: 'active', goal: 'Сюжет' },
            ]
        },
    ];

    const currentCategory = categories.find(c => c.id === activeCategory);

    return (
        <div className="min-h-screen bg-shu-bg text-white font-shubody selection:bg-shu-pink/30">
            <Header onCtaClick={openModal} />

            {/* Asset Preloading */}
            <div className="hidden">
                <img src={shuBankIcon} loading="lazy" alt="preload" />
                <img src={shuBoomIcon} loading="lazy" alt="preload" />
                <img src={shuShiIcon} loading="lazy" alt="preload" />
            </div>

            <main className="relative z-10 pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Hero section match Landing */}
                <header className="relative z-10 pt-4 pb-12 px-4 text-center">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto uppercase font-shubody tracking-widest leading-relaxed mb-7"
                    >
                        Все игровые механики SHU.STUDIO <br className="hidden md:block" /> в одном каталоге.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
                    >
                        <button
                            onClick={openModal}
                            className="font-shupixel text-[10px] md:text-xs uppercase tracking-widest px-10 py-5 bg-transparent text-shu-pink border-2 border-shu-pink hover:bg-shu-pink hover:text-black shadow-pixel-sm hover:shadow-pixel active:translate-x-1 active:translate-y-1 transition-all duration-200"
                        >
                            Оставить заявку
                        </button>
                    </motion.div>

                    {/* Category Navigation - Restored boxy look */}
                    <nav className="flex flex-nowrap overflow-x-auto scrollbar-hide justify-start md:flex-wrap md:justify-center gap-4 pb-1 -mx-4 px-4 md:mx-0 md:px-0" role="tablist">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setActiveCategory(category.id);
                                    storage.set('catalog_active_category', category.id);
                                }}
                                className={cn(
                                    "relative flex-shrink-0 px-6 py-4 font-shupixel text-[10px] md:text-xs uppercase transition-all duration-300",
                                    "border-2",
                                    activeCategory === category.id
                                        ? "bg-shu-pink border-shu-pink text-black shadow-pixel-sm translate-x-1 translate-y-1"
                                        : "bg-shu-card border-white text-white hover:border-shu-pink hover:text-shu-pink active:translate-y-1"
                                )}
                                role="tab"
                                aria-selected={activeCategory === category.id}
                            >
                                {category.title}
                            </button>
                        ))}
                    </nav>
                </header>

                {/* Games Grid - Premium Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="contents"
                        >
                            {currentCategory?.games.map((game, index) => (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="group relative bg-[#111] border-2 border-white/20 hover:border-shu-pink transition-all duration-500 overflow-hidden"
                                >
                                    {/* Scanline effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_0%,rgba(0,0,0,0.5)_50%,transparent_100%)] bg-[length:100%_4px] opacity-10" />

                                    {/* Card Pattern */}
                                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

                                    <div className="p-8 flex flex-col h-full relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-16 h-16 bg-shu-bg border border-white/10 group-hover:border-shu-pink/40 shadow-pixel-sm group-hover:shadow-pixel transition-all duration-300 transform group-hover:-rotate-3 flex items-center justify-center overflow-hidden">
                                                {game.thumbnail ? (
                                                    <img src={game.thumbnail} alt={game.title} className="w-full h-full object-contain" />
                                                ) : (
                                                    <game.icon className="w-10 h-10 text-white group-hover:text-shu-pink transition-colors" />
                                                )}
                                            </div>
                                            <span className="font-shupixel text-[9px] text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1">
                                                {game.goal}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-shupixel text-white mb-4 group-hover:text-shu-pink transition-colors uppercase tracking-tight">
                                            {game.title}
                                        </h3>

                                        <p className="text-gray-400 font-shubody mb-10 leading-relaxed text-sm flex-grow">
                                            {game.description}
                                        </p>

                                        <Link
                                            to={`/game/${game.id}`}
                                            className={cn(
                                                "mt-auto inline-flex items-center justify-center w-full py-5 font-shupixel text-xs uppercase transition-all duration-300",
                                                "bg-white text-black border-2 border-white hover:bg-shu-pink hover:border-shu-pink hover:shadow-pixel active:translate-y-1 active:translate-x-1"
                                            )}
                                        >
                                            Открыть демо
                                        </Link>
                                    </div>

                                    {/* Decorative pixel edge */}
                                    <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
                                        <div className="absolute bottom-1 right-1 w-2 h-2 bg-white/10 group-hover:bg-shu-pink/30" />
                                        <div className="absolute bottom-4 right-1 w-1 h-1 bg-white/10" />
                                        <div className="absolute bottom-1 right-4 w-1 h-1 bg-white/10" />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer sync with landing */}
            <footer className="py-20 border-t-2 border-white/5 text-center relative z-10">
                <div className="mb-8">
                    <span className="font-shupixel text-[18px] text-shu-pink selection:bg-white tracking-tighter">SHU STUDIO</span>
                </div>
                <p className="font-shupixel text-[10px] text-gray-600 uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} Creative Tech Solutions &bull; Almaty &bull; KZ
                </p>

                {/* Visual glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-shu-pink/20 to-transparent blur-sm" />
            </footer>

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-shu-pink/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-shu-blue/5 blur-[100px] rounded-full" />
            </div>
        </div>
    );
};

export default Catalog;

