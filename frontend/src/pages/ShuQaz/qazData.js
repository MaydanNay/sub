export const INITIAL_USER_STATE = {
    baursaks: 50,
    xp: 0,
    level: 1,
    streak: 3,
    hunger: 60, // 0-100
    lastFed: Date.now(),
    inventory: ['Заморозка'],
    masteredCount: 12
};

export const DICTIONARY = [
    { id: 1, kz: 'Сәлем', ru: 'Привет', status: 'Master', level: 'A1' },
    { id: 2, kz: 'Рахмет', ru: 'Спасибо', status: 'Learning', level: 'A1' },
    { id: 3, kz: 'Жақсы', ru: 'Хорошо', status: 'New', level: 'A1' },
    { id: 4, kz: 'Нан', ru: 'Хлеб', status: 'Master', level: 'A1' },
    { id: 5, kz: 'Су', ru: 'Вода', status: 'Learning', level: 'A1' },
    { id: 6, kz: 'Кітап', ru: 'Книга', status: 'New', level: 'A1' },
    { id: 7, kz: 'Мектеп', ru: 'Школа', status: 'Learning', level: 'A1' },
    { id: 8, kz: 'Дос', ru: 'Друг', status: 'Master', level: 'A1' },
];

export const BARYS_PHASES = [
    { level: 1, name: 'Балапан', scale: 0.6, description: 'Маленький котенок' },
    { level: 5, name: 'Жас Барс', scale: 0.8, description: 'Подросток' },
    { level: 10, name: 'Көкжал', scale: 1.0, description: 'Взрослый барс' },
    { level: 20, name: 'Ата', scale: 1.2, description: 'Мудрый наставник' }
];
