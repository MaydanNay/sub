// ShuRun Game Data

export const MARATHONS = [
    {
        id: 'almaty-5k',
        title: 'Алматы Весенний 5K',
        subtitle: 'Открытый марафон',
        distance: 5,
        unit: 'км',
        status: 'active', // active | upcoming | finished
        daysLeft: 3,
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        prize: '🥇 Медаль + 5 000 ₸',
        sponsor: 'Kaspi Bank',
        sponsorColor: '#e11d48',
        participants: 1247,
        maxParticipants: 2000,
        color: 'from-emerald-500 to-teal-600',
        emoji: '🟢',
        description: 'Пробеги 5 км в любое удобное время и место. Получи физическую медаль!',
        topPrize: '50 000 ₸',
    },
    {
        id: 'astana-10k',
        title: 'Астана 10K',
        subtitle: 'Для опытных бегунов',
        distance: 10,
        unit: 'км',
        status: 'upcoming',
        daysLeft: 7,
        endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        prize: '🥇 Медаль + 15 000 ₸',
        sponsor: 'Halyk Bank',
        sponsorColor: '#0ea5e9',
        participants: 432,
        maxParticipants: 5000,
        color: 'from-blue-500 to-indigo-600',
        emoji: '🔵',
        description: 'Первый онлайн-марафон страны с партнёрством Halyk Bank.',
        topPrize: '100 000 ₸',
    },
    {
        id: 'shymkent-half',
        title: 'Шымкент Полумарафон',
        subtitle: '21.1 км — испытай себя',
        distance: 21.1,
        unit: 'км',
        status: 'upcoming',
        daysLeft: 21,
        endsAt: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
        prize: '🏆 Медаль + 50 000 ₸ + Мерч',
        sponsor: 'Forte Bank',
        sponsorColor: '#7c3aed',
        participants: 98,
        maxParticipants: 1000,
        color: 'from-violet-500 to-purple-700',
        emoji: '🟣',
        description: 'Самый престижный онлайн-полумарафон СНГ. Зарегистрируйся до старта.',
        topPrize: '500 000 ₸',
    },
];

export const RUNNER_LEVELS = [
    { level: 1, name: 'Новичок', emoji: '🐣', minKm: 0, maxKm: 50, color: '#6b7280' },
    { level: 2, name: 'Любитель', emoji: '🏃', minKm: 50, maxKm: 200, color: '#10b981' },
    { level: 3, name: 'Эксперт', emoji: '⚡', minKm: 200, maxKm: 500, color: '#3b82f6' },
    { level: 4, name: 'Мастер', emoji: '🔥', minKm: 500, maxKm: 1000, color: '#f59e0b' },
    { level: 5, name: 'Легенда', emoji: '👑', minKm: 1000, maxKm: Infinity, color: '#ef4444' },
];

export const getLevelByKm = (km) => {
    return RUNNER_LEVELS.find(l => km >= l.minKm && km < l.maxKm) || RUNNER_LEVELS[0];
};

export const LEADERBOARD_ALL_TIME = [
    { rank: 1, name: 'Айбек К.', city: 'Алматы', totalKm: 843, marathons: 12, emoji: '🏅', time: '3:42:11' },
    { rank: 2, name: 'Дана М.', city: 'Астана', totalKm: 712, marathons: 10, emoji: '🏅', time: '3:55:02' },
    { rank: 3, name: 'Серик Б.', city: 'Шымкент', totalKm: 634, marathons: 9, emoji: '🏅', time: '4:02:44' },
    { rank: 4, name: 'Алия Р.', city: 'Алматы', totalKm: 521, marathons: 8, emoji: '🎽', time: '4:10:19' },
    { rank: 5, name: 'Тимур Ж.', city: 'Астана', totalKm: 498, marathons: 7, emoji: '🎽', time: '4:18:33' },
    { rank: 6, name: 'Жансая О.', city: 'Алматы', totalKm: 412, marathons: 6, emoji: '🎽', time: '4:25:08' },
    { rank: 7, name: 'Ты', city: 'Алматы', totalKm: 47, marathons: 2, emoji: '👤', time: '—', isMe: true },
    { rank: 8, name: 'Нурлан С.', city: 'Актобе', totalKm: 311, marathons: 5, emoji: '🎽', time: '4:40:22' },
    { rank: 9, name: 'Гульмира А.', city: 'Тараз', totalKm: 278, marathons: 4, emoji: '🎽', time: '4:52:17' },
    { rank: 10, name: 'Бауыржан Е.', city: 'Алматы', totalKm: 245, marathons: 4, emoji: '🎽', time: '5:01:44' },
];

export const LEADERBOARD_MARATHON = [
    { rank: 1, name: 'Айбек К.', city: 'Алматы', totalKm: 5.0, marathons: 1, emoji: '🏅', time: '22:14', pace: '4:26/км' },
    { rank: 2, name: 'Серик Б.', city: 'Шымкент', totalKm: 5.0, marathons: 1, emoji: '🏅', time: '24:32', pace: '4:54/км' },
    { rank: 3, name: 'Тимур Ж.', city: 'Астана', totalKm: 5.0, marathons: 1, emoji: '🏅', time: '25:18', pace: '5:03/км' },
    { rank: 4, name: 'Дана М.', city: 'Астана', totalKm: 5.0, marathons: 1, emoji: '🎽', time: '27:04', pace: '5:24/км' },
    { rank: 5, name: 'Ты', city: 'Алматы', totalKm: 0, marathons: 0, emoji: '👤', time: '—', pace: '—', isMe: true },
    { rank: 6, name: 'Алия Р.', city: 'Алматы', totalKm: 5.0, marathons: 1, emoji: '🎽', time: '29:11', pace: '5:50/км' },
    { rank: 7, name: 'Нурлан С.', city: 'Актобе', totalKm: 5.0, marathons: 1, emoji: '🎽', time: '31:22', pace: '6:16/км' },
    { rank: 8, name: 'Жансая О.', city: 'Алматы', totalKm: 5.0, marathons: 1, emoji: '🎽', time: '33:05', pace: '6:37/км' },
    { rank: 9, name: 'Гульмира А.', city: 'Тараз', totalKm: 5.0, marathons: 1, emoji: '🎽', time: '35:44', pace: '7:08/км' },
    { rank: 10, name: 'Бауыржан Е.', city: 'Алматы', totalKm: 5.0, marathons: 1, emoji: '🎽', time: '38:02', pace: '7:36/км' },
];

export const ACHIEVEMENTS = [
    { id: 'first_run', emoji: '🎯', title: 'Первая пробежка', desc: 'Сделай первый шаг' },
    { id: 'km10', emoji: '📍', title: '10 км пройдено', desc: 'Суммарно 10 км' },
    { id: 'marathon', emoji: '🏅', title: 'Финишёр', desc: 'Завершить любой марафон' },
    { id: 'week_streak', emoji: '🔥', title: '7 дней подряд', desc: 'Бегай неделю подряд' },
    { id: 'fast_5k', emoji: '⚡', title: 'Быстрый 5К', desc: '5 км быстрее 25 минут' },
    { id: 'territory', emoji: '🗺️', title: 'Завоеватель', desc: 'Захвати 5 районов' },
    { id: 'gps_art', emoji: '🎨', title: 'GPS-Художник', desc: 'Создай маршрут-рисунок' },
    { id: 'steps_100k', emoji: '👟', title: '100K шагов', desc: 'Пройди 100 000 шагов' },
];

export const MY_MEDALS = [
    { emoji: '🥈', title: 'Весенний 5K 2025', date: 'март 2025' },
    { emoji: '🎽', title: 'Старт сезона', date: 'апрель 2025' },
];

export const MY_STATS = {
    totalKm: 47,
    marathonsFinished: 2,
    medalsCount: 2,
    bestPace: '5:12/км',
    joinedDate: 'Февраль 2026',
    name: 'Ты',
    city: 'Алматы',
};
