export const SHUDOM_ROOMS = [
    {
        id: 'living_room',
        name: 'Гостиная Мания',
        levels: 25,
        unlocks: [
            { level: 5, name: 'Samsung QLED 8K', type: 'electronics', price: '999 990 ₸', link: 'https://www.technodom.kz/p/led-televizor-samsung-65-qe65q800tauxce-223402' },
            { level: 10, name: 'Домашний кинотеатр Sony', type: 'electronics', price: '450 000 ₸', link: '#' },
            { level: 15, name: 'PlayStation 5 Pro', type: 'gaming', price: '380 000 ₸', link: '#' },
            { level: 20, name: 'Умный свет Philips Hue', type: 'comfort', price: '120 000 ₸', link: '#' },
            { level: 25, name: 'Робот-пылесос Roborock', type: 'comfort', price: '299 000 ₸', link: '#' },
        ]
    },
    {
        id: 'kitchen',
        name: 'Кухня Будущего',
        levels: 25,
        unlocks: [
            { level: 5, name: 'Холодильник LG ThinQ', type: 'electronics', price: '850 000 ₸', link: '#' },
            { level: 10, name: 'Кофемашина DeLonghi', type: 'comfort', price: '320 000 ₸', link: '#' },
            { level: 15, name: 'Духовой шкаф Bosch', type: 'electronics', price: '280 000 ₸', link: '#' },
            { level: 20, name: 'Смарт-чайник Xiaomi', type: 'gadgets', price: '25 000 ₸', link: '#' },
            { level: 25, name: 'Посудомойка Whirlpool', type: 'electronics', price: '210 000 ₸', link: '#' },
        ]
    },
    { id: 'bedroom', name: 'Смарт-Спальня', levels: 25, unlocks: [] },
    { id: 'bathroom', name: 'High-Tech Ванная', levels: 25, unlocks: [] },
    { id: 'gaming', name: 'Гейминг Зона', levels: 25, unlocks: [] },
    { id: 'terrace', name: 'Умная Терраса', levels: 25, unlocks: [] },
    { id: 'office', name: 'Техно-Офис', levels: 25, unlocks: [] },
    { id: 'garage', name: 'Гараж 2.0', levels: 25, unlocks: [] },
    { id: 'gym', name: 'Смарт-Спортзал', levels: 25, unlocks: [] },
    { id: 'garden', name: 'Кибер-Сад', levels: 25, unlocks: [] }
];

export const TILE_TYPES = [
    { id: 'phone', name: 'Смартфон', icon: '📱', color: '#3b82f6' },
    { id: 'laptop', name: 'Ноутбук', icon: '💻', color: '#8b5cf6' },
    { id: 'tv', name: 'ТВ', icon: '📺', color: '#f59e0b' },
    { id: 'fridge', name: 'Холодильник', icon: '❄️', color: '#10b981' },
    { id: 'watch', name: 'Часы', icon: '⌚', color: '#ef4444' },
    { id: 'headphones', name: 'Наушники', icon: '🎧', color: '#f472b6' },
];

export const GAME_CONFIG = {
    gridSize: 8,
    movesPerLevel: 25, // TЗ: 20-30 на уровень
    energyRecoverMinutes: 30, // TЗ: 30 минут
    maxEnergy: 5, // TЗ: 5 слотов
    grandPrizePool: '200 млн ₸'
};
