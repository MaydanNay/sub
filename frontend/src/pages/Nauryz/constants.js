export const ITEMS = {
    // Baursak Chain
    FLOUR: { id: 'flour', name: 'Мука', tier: 1, chain: 'baursak', icon: '🌾' },
    DOUGH: { id: 'dough', name: 'Тесто', tier: 2, chain: 'baursak', icon: '☁️' },
    BAURSAK_RAW: { id: 'baursak_raw', name: 'Сырой баурсак', tier: 3, chain: 'baursak', icon: '⭕' },
    BAURSAK_FRIED: { id: 'baursak_fried', name: 'Баурсак', tier: 4, chain: 'baursak', icon: '🥯' },
    BAURSAK_PLATE: { id: 'baursak_plate', name: 'Тарелка баурсаков', tier: 5, chain: 'baursak', icon: '🥘' },

    // Ayran Chain
    MILK: { id: 'milk', name: 'Молоко', tier: 1, chain: 'ayran', icon: '🥛' },
    LEAVEN: { id: 'leaven', name: 'Закваска', tier: 2, chain: 'ayran', icon: '🥣' },
    AYRAN: { id: 'ayran', name: 'Айран', tier: 3, chain: 'ayran', icon: '🥤' },
    KURT: { id: 'kurt', name: 'Курт', tier: 4, chain: 'ayran', icon: '⚪' },

    // Tea Chain (High Level)
    WATER: { id: 'water', name: 'Вода', tier: 1, chain: 'tea', icon: '💧' },
    TEA_LEAVES: { id: 'tea_leaves', name: 'Заварка', tier: 2, chain: 'tea', icon: '🍂' },
    TEA_POT: { id: 'tea_pot', name: 'Чайник', tier: 3, chain: 'tea', icon: '🫖' },
    TEA_CUP: { id: 'tea_cup', name: 'Кесе чая', tier: 4, chain: 'tea', icon: '🍵' },
};

export const CHAINS = {
    baursak: ['flour', 'dough', 'baursak_raw', 'baursak_fried', 'baursak_plate'],
    ayran: ['milk', 'leaven', 'ayran', 'kurt'],
    tea: ['water', 'tea_leaves', 'tea_pot', 'tea_cup']
};

export const INITIAL_BOARD_SIZE = 36; // 6x6 grid

export const GENERATOR_COOLDOWN = 2000; // ms
