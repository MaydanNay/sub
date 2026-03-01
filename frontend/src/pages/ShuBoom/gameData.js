/**
 * ShuBoom Game Progression Data
 * 7 Characters = 7 Levels, each with unique sub-levels
 */

import pers1 from './images/pers_1.PNG';
import pers2 from './images/pers_2.PNG';
import pers3 from './images/pers_3.PNG';
import pers4 from './images/pers_4.PNG';
import pers5 from './images/pers_5.PNG';
import pers6 from './images/pers_6.PNG';
import pers7 from './images/pers_7.PNG';

export const CHARACTERS = [
    {
        id: 1,
        key: "SEEKER",
        name: "Искатель",
        emoji: "🔍",
        avatar: pers1,
        color: "from-amber-400 to-orange-500",
        bgColor: "bg-amber-100",
        textColor: "text-amber-600",
        borderColor: "border-amber-400",
        description: "Начни свой путь! Исследуй мир вокруг себя.",
        sublevels: [
            { id: "s1_1", name: "Любознательность", task: "Сделай первый заказ", icon: "✨" },
            { id: "s1_2", name: "Открытость", task: "Попробуй новый напиток", icon: "☕" },
            { id: "s1_3", name: "Внимательность", task: "Посети 2 разных кофейни", icon: "👀" },
            { id: "s1_4", name: "Терпение", task: "Сделай 5 заказов", icon: "⏳" },
            { id: "s1_5", name: "Настойчивость", task: "Накопи 500 баллов", icon: "💪" },
        ]
    },
    {
        id: 2,
        key: "ROMANTIC",
        name: "Романтик",
        emoji: "💜",
        avatar: pers2,
        color: "from-pink-400 to-rose-500",
        bgColor: "bg-pink-100",
        textColor: "text-pink-600",
        borderColor: "border-pink-400",
        description: "Ты чувствуешь вкус жизни. Наслаждайся моментом.",
        sublevels: [
            { id: "s2_1", name: "Чувственность", task: "Попробуй десерт", icon: "🍰" },
            { id: "s2_2", name: "Нежность", task: "Сделай подарок другу", icon: "🎁" },
            { id: "s2_3", name: "Верность", task: "Посети одну кофейню 3 раза", icon: "❤️" },
            { id: "s2_4", name: "Страсть", task: "Накопи 1500 баллов", icon: "🔥" },
        ]
    },
    {
        id: 3,
        key: "CONNOISSEUR",
        name: "Ценитель",
        emoji: "🍷",
        avatar: pers3,
        color: "from-violet-400 to-purple-600",
        bgColor: "bg-violet-100",
        textColor: "text-violet-600",
        borderColor: "border-violet-400",
        description: "Ты знаешь толк в хороших вещах.",
        sublevels: [
            { id: "s3_1", name: "Осознанность", task: "Используй эко-стакан", icon: "🌿" },
            { id: "s3_2", name: "Вкус", task: "Попробуй 5 разных напитков", icon: "👅" },
            { id: "s3_3", name: "Мастерство", task: "Сделай 15 заказов", icon: "🏅" },
            { id: "s3_4", name: "Гармония", task: "Закажи завтрак + кофе", icon: "☯️" },
            { id: "s3_5", name: "Утончённость", task: "Накопи 3000 баллов", icon: "💎" },
        ]
    },
    {
        id: 4,
        key: "AESTHETE",
        name: "Эстет",
        emoji: "🎨",
        avatar: pers4,
        color: "from-cyan-400 to-blue-500",
        bgColor: "bg-cyan-100",
        textColor: "text-cyan-600",
        borderColor: "border-cyan-400",
        description: "Красота во всём. Ты видишь мир по-особенному.",
        sublevels: [
            { id: "s4_1", name: "Красота", task: "Сфоткай свой заказ", icon: "📸" },
            { id: "s4_2", name: "Стиль", task: "Попробуй сезонное меню", icon: "🌸" },
            { id: "s4_3", name: "Элегантность", task: "Сделай 25 заказов", icon: "✨" },
            { id: "s4_4", name: "Изящество", task: "Накопи 5000 баллов", icon: "🦋" },
        ]
    },
    {
        id: 5,
        key: "DREAMER",
        name: "Мечтатель",
        emoji: "🌙",
        avatar: pers5,
        color: "from-indigo-400 to-blue-600",
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-600",
        borderColor: "border-indigo-400",
        description: "Мечтай по-крупному. Твоя фантазия — твоя сила.",
        sublevels: [
            { id: "s5_1", name: "Фантазия", task: "Создай свой напиток", icon: "🧪" },
            { id: "s5_2", name: "Вдохновение", task: "Посети 5 разных кофеен", icon: "💡" },
            { id: "s5_3", name: "Креативность", task: "Закажи доставку 3 раза", icon: "🚀" },
            { id: "s5_4", name: "Дерзость", task: "Сделай 40 заказов", icon: "⚡" },
            { id: "s5_5", name: "Свобода", task: "Накопи 8000 баллов", icon: "🕊️" },
        ]
    },
    {
        id: 6,
        key: "PHILOSOPHER",
        name: "Философ",
        emoji: "📚",
        avatar: pers6,
        color: "from-emerald-400 to-teal-600",
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-600",
        borderColor: "border-emerald-400",
        description: "Глубина мысли и спокойствие духа.",
        sublevels: [
            { id: "s6_1", name: "Мудрость", task: "Приведи друга", icon: "🦉" },
            { id: "s6_2", name: "Глубина", task: "Попробуй 10 уникальных позиций", icon: "🌊" },
            { id: "s6_3", name: "Созерцание", task: "Сделай 60 заказов", icon: "🧘" },
            { id: "s6_4", name: "Просветление", task: "Накопи 12000 баллов", icon: "☀️" },
        ]
    },
    {
        id: 7,
        key: "FUTURIST",
        name: "Футурист",
        emoji: "🚀",
        avatar: pers7,
        color: "from-yellow-400 to-red-500",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        borderColor: "border-yellow-400",
        description: "Вершина эволюции. Ты — легенда.",
        sublevels: [
            { id: "s7_1", name: "Инновация", task: "Используй все функции приложения", icon: "⚙️" },
            { id: "s7_2", name: "Эволюция", task: "Сделай 100 заказов", icon: "🧬" },
            { id: "s7_3", name: "Бесконечность", task: "Накопи 20000 баллов", icon: "♾️" },
        ]
    },
];

/**
 * Get user's current character (level) based on their status key
 */
export const getCurrentCharacter = (statusKey) => {
    return CHARACTERS.find(c => c.key === statusKey) || CHARACTERS[0];
};

/**
 * Get character by its numeric ID
 */
export const getCharacterById = (id) => {
    return CHARACTERS.find(c => c.id === id) || null;
};

/**
 * Get the next character after the current one
 */
export const getNextCharacter = (statusKey) => {
    const currentIdx = CHARACTERS.findIndex(c => c.key === statusKey);
    if (currentIdx < CHARACTERS.length - 1) {
        return CHARACTERS[currentIdx + 1];
    }
    return null; // Already at max level
};

/**
 * Calculate overall progress percentage
 */
export const getOverallProgress = (statusKey, sublevel) => {
    const totalSublevels = CHARACTERS.reduce((sum, c) => sum + c.sublevels.length, 0);
    let completed = 0;
    for (const char of CHARACTERS) {
        if (char.key === statusKey) {
            completed += sublevel;
            break;
        }
        completed += char.sublevels.length;
    }
    return Math.round((completed / totalSublevels) * 100);
};
