import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IconJerboa, IconCoin, IconChart, IconUsers } from '../../components/GameIcons';
import charPng from './images/pers/0.PNG';

const ShuBankIntro = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: IconCoin,
            title: 'Энергия (Расходы)',
            desc: 'ShuBank питается транзакциями. Плати картой, чтобы он был сыт и весел.',
            color: 'text-amber-500'
        },
        {
            icon: IconChart,
            title: 'Спокойствие (Накопления)',
            desc: 'Твой баланс — это его безопасность. Чем больше на депозите, тем спокойнее ShuBank.',
            color: 'text-emerald-500'
        },
        {
            icon: IconUsers,
            title: 'Прайды (Социум)',
            desc: 'Объединяйся с семьей или друзьями, чтобы вместе копить на общие цели.',
            color: 'text-blue-500'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 overflow-x-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>

            <main className="relative z-10 max-w-lg mx-auto px-6 pt-20 pb-24">
                <header className="text-center mb-12">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/')}
                        className="absolute top-0 left-0 p-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        ← Назад
                    </motion.button>

                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-2 mx-auto mb-8 shadow-2xl shadow-orange-500/20"
                    >
                        <img src={charPng} alt="ShuBank" className="w-full h-full object-contain drop-shadow-lg" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tight mb-4"
                    >
                        ShuBank <span className="text-orange-500 text-5xl">Together</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg leading-relaxed"
                    >
                        Твой персональный финансовый тамагочи прямиком из казахстанских степей.
                    </motion.p>
                </header>

                <div className="space-y-6 mb-12">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex gap-5"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-slate-50 p-3 flex-shrink-0 ${f.color}`}>
                                <f.icon className="w-full h-full" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-orange-50 rounded-3xl p-6 border border-orange-100 mb-12"
                >
                    <p className="text-orange-800 text-sm font-medium leading-relaxed">
                        <span className="font-bold block mb-1">💡 Интересный факт:</span>
                        ShuBank (Jerboa) — символ скорости и запасливости. Его настроение напрямую зависит от твоей финансовой дисциплины!
                    </p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/game/shubank/play')}
                    className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-500/30 tracking-tight"
                >
                    Завести ShuBank
                </motion.button>
            </main>
        </div>
    );
};

export default ShuBankIntro;
