export const SHU_METAL_RANKS = [
    { id: 1, name: 'Новичок', minExp: 0, maxExp: 1000, discount: 0, perks: 'Базовый доступ' },
    { id: 2, name: 'Рабочий', minExp: 1000, maxExp: 5000, discount: 5, perks: 'Скидка +5% в магазине' },
    { id: 3, name: 'Мастер', minExp: 5000, maxExp: 15000, discount: 10, perks: 'Скидка +10%, Наставничество' },
    { id: 4, name: 'Эксперт', minExp: 15000, maxExp: 30000, discount: 10, perks: 'Приоритет на обучение' },
    { id: 5, name: 'Легенда', minExp: 30000, maxExp: 50000, discount: 10, perks: 'Доступ в VIP-зону столовой' },
    { id: 6, name: 'Титан', minExp: 50000, maxExp: Infinity, discount: 10, perks: 'Личная встреча с CEO ERG' },
];

export const SHU_METAL_TASKS = [
    // Категория 1: Безопасность
    {
        id: 'safety_1',
        category: 'Safety First',
        title: 'Зоркий глаз',
        description: 'Заметил опасность (торчащий кабель) → сфоткал в приложение.',
        reward: 50,
        icon: 'Eye',
        type: 'action'
    },
    {
        id: 'safety_2',
        category: 'Safety First',
        title: 'Месяц без травм',
        description: 'Личный вклад в безопасность смены.',
        reward: 200,
        icon: 'Shield',
        type: 'achievement'
    },
    {
        id: 'safety_3',
        category: 'Safety First',
        title: 'Чистая смена цеха',
        description: 'Отсутствие травм у всего цеха в течение месяца.',
        reward: 1000,
        icon: 'Users',
        type: 'achievement'
    },
    // Категория 2: Рационализаторство
    {
        id: 'kaizen_1',
        category: 'Рационализаторство',
        title: 'Подача рацпредложения',
        description: 'Предложи идею по улучшению процесса.',
        reward: 500,
        icon: 'Lightbulb',
        type: 'action'
    },
    {
        id: 'kaizen_2',
        category: 'Рационализаторство',
        title: 'Одобрение идеи',
        description: 'Ваша идея прошла первичную проверку.',
        reward: 2000,
        icon: 'CheckCircle',
        type: 'milestone'
    },
    {
        id: 'kaizen_3',
        category: 'Рационализаторство',
        title: 'Внедрение идеи',
        description: 'Проект успешно внедрен в производство.',
        reward: 5000,
        icon: 'Zap',
        type: 'milestone'
    },
    // Категория 3: Наставничество
    {
        id: 'mentor_1',
        category: 'Наставничество',
        title: 'Взял стажера',
        description: 'Передача опыта молодому поколению.',
        reward: 300,
        icon: 'Users',
        type: 'action'
    },
    {
        id: 'mentor_2',
        category: 'Наставничество',
        title: 'Стажер прошел срок',
        description: 'Успешная адаптация вашего подопечного.',
        reward: 1000,
        icon: 'Trophy',
        type: 'achievement'
    },
    // Категория 4: ЗОЖ
    {
        id: 'health_1',
        category: 'ЗОЖ',
        title: 'Тренировка в зале',
        description: 'Посещение заводского спортзала.',
        reward: 100,
        icon: 'Heart',
        type: 'action'
    },
    {
        id: 'health_2',
        category: 'ЗОЖ',
        title: 'Сдача ГТО',
        description: 'Успешное выполнение нормативов.',
        reward: 800,
        icon: 'Trophy',
        type: 'achievement'
    },
    // Категория 5: Дисциплина
    {
        id: 'discipline_1',
        category: 'Дисциплина',
        title: 'Месяц без опозданий',
        description: 'Идеальная посещаемость.',
        reward: 200,
        icon: 'Clock',
        type: 'achievement'
    },
    {
        id: 'discipline_2',
        category: 'Дисциплина',
        title: 'Год без больничных',
        description: 'Крепкое здоровье и дисциплина.',
        reward: 2000,
        icon: 'Shield',
        type: 'achievement'
    }
];

export const SHU_METAL_DAILY_QUESTS = [
    { id: 'daily_1', title: 'Найди 3 нарушения ТБ', reward: 300, icon: 'Eye' },
    { id: 'daily_2', title: 'Помоги коллеге', reward: 200, icon: 'Users' },
    { id: 'daily_3', title: 'Пройди тест по ТБ', reward: 150, icon: 'Brain' },
];

export const SHU_METAL_SHOP = [
    // Мерч и Статус
    { id: 'sh_1', name: 'Худи «Man of Steel»', price: 3000, category: 'Мерч', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
    { id: 'sh_2', name: 'Рюкзак Caterpillar', price: 2500, category: 'Мерч', image: 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?w=400' },
    { id: 'sh_3', name: 'Термос Stanley', price: 1500, category: 'Мерч', image: 'https://images.unsplash.com/photo-1627916607164-fa952b769211?w=400' },
    { id: 'sh_4', name: 'Кепка «ERG Legend»', price: 1000, category: 'Мерч', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400' },

    // Комфорт
    { id: 'sh_5', name: 'Оплачиваемый отгул', price: 10000, category: 'Комфорт', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400' },
    { id: 'sh_6', name: 'Приоритетная парковка', price: 4000, category: 'Комфорт', image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400' },
    { id: 'sh_7', name: 'Массаж', price: 2500, category: 'Комфорт', image: 'https://images.unsplash.com/photo-1544161515-4af6b1d462c2?w=400' },
    { id: 'sh_8', name: 'VIP-обед со стейком', price: 1500, category: 'Комфорт', image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=400' },

    // Гаджеты
    { id: 'sh_9', name: 'Наушники JBL', price: 5000, category: 'Гаджеты', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    { id: 'sh_10', name: 'Умные часы Xiaomi', price: 4500, category: 'Гаджеты', image: 'https://images.unsplash.com/photo-1544117518-30df578096a4?w=400' },
    { id: 'sh_11', name: 'Powerbank', price: 2000, category: 'Гаджеты', image: 'https://images.unsplash.com/photo-1609091839697-5c1cfeb62241?w=400' },

    // Эмоции
    { id: 'sh_12', name: 'Ужин с директором', price: 15000, category: 'Эмоции', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
    { id: 'sh_13', name: 'VIP-ложа на матч «Барыса»', price: 6000, category: 'Эмоции', image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400' },
    { id: 'sh_14', name: 'Экскурсия на другой завод', price: 8000, category: 'Эмоции', image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400' },

    // Семья
    { id: 'sh_15', name: 'Путевка в детский лагерь', price: 20000, category: 'Семья', image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=400' },
    { id: 'sh_16', name: 'Билеты в цирк', price: 4000, category: 'Семья', image: 'https://images.unsplash.com/photo-1473163928189-3f4b232f912e?w=400' },
];

export const SHU_METAL_WORKSHOPS = [
    { id: 'electro', name: 'Электролизный цех', stats: { coworkers: 1500, score: 3200000 } },
    { id: 'casting', name: 'Литейный цех', stats: { coworkers: 800, score: 1800000 } },
    { id: 'anode', name: 'Анодный цех', stats: { coworkers: 600, score: 1400000 } },
    { id: 'repair', name: 'Ремонтный цех', stats: { coworkers: 400, score: 1100000 } },
    { id: 'energy', name: 'Энергоцех', stats: { coworkers: 300, score: 950000 } },
    { id: 'transport', name: 'Транспортный цех', stats: { coworkers: 200, score: 580000 } },
];
