import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Send, Layout, Users, Rocket, Target, Zap, Star, Smartphone, Calendar } from 'lucide-react';
import { IconTarget as GameIconTarget, IconZap as GameIconZap, IconStar as GameIconStar, IconUsers as GameIconUsers } from './GameIcons';
import RequestForm from './RequestForm';

const LandingSurvey = ({ onFinish, onOpenCatalog }) => {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({});

    const steps = [
        {
            id: 1,
            title: 'ВЫБОР ГЕРОЯ',
            question: 'Кто ты в этой истории?',
            options: [
                { id: 'personal', title: 'Физическое лицо', desc: 'Хочу игру для себя, своего проекта или мероприятия.', icon: Users },
                { id: 'business', title: 'Бизнес / Компания', desc: 'Хочу геймификацию для клиентов или команды.', icon: Rocket },
            ]
        },
        {
            id: 2,
            title: 'СФЕРА',
            question: 'Какая у тебя сфера?',
            options: [
                { id: 'education', title: 'Образование', desc: 'Школы, курсы, обучение', icon: Star },
                { id: 'horeca', title: 'HoReCa', desc: 'Кофейни, рестораны, фудкорты', icon: Star },
                { id: 'hr', title: 'Корпоратив / HR', desc: 'Команды, офисы, культура', icon: Users },
                { id: 'retail', title: 'Ритейл / E-commerce', desc: 'Магазины, маркетплейсы', icon: Smartphone },
                { id: 'events', title: 'Ивенты', desc: 'Мероприятия, выставки', icon: Calendar },
                { id: 'other', title: 'Другое', desc: 'Расскажу сам(а)', icon: Target },
            ]
        },
        {
            id: 3,
            title: 'ЗАДАЧА',
            question: 'Какую задачу хочешь решить?',
            options: [
                { id: 'clients', title: 'Привлечь клиентов', desc: 'Охваты, лиды, виральность', icon: Zap },
                { id: 'retention', title: 'Удержать клиентов', desc: 'Лояльность, возвраты', icon: Target },
                { id: 'staff', title: 'Мотивировать сотрудников', desc: 'Вовлечённость, KPI', icon: Users },
                { id: 'promo', title: 'Разовая акция', desc: 'Запуск, праздник', icon: Calendar },
                { id: 'culture', title: 'Корп. культура', desc: 'Ценности, онбординг', icon: Star },
            ]
        },
        {
            id: 4,
            title: 'УРОВЕНЬ ПОНЯТНОСТИ',
            question: 'Как ты относишься к геймификации?',
            options: [
                { id: 'ready', title: 'Уже знаю и хочу внедрить', desc: 'Ищу исполнителя', icon: Rocket },
                { id: 'curious', title: 'Слышал(а), но не до конца понимаю', desc: 'Хочу разобраться', icon: Star },
                { id: 'newbie', title: 'Первый раз слышу', desc: 'Объясните с нуля', icon: Target },
            ]
        },
        {
            id: 5,
            title: 'ПРИОРИТЕТ ПРОЕКТА',
            question: 'Что для тебя важнее всего?',
            options: [
                { id: 'speed', title: 'Скорость', desc: 'Хочу запустить быстро', icon: Zap },
                { id: 'budget', title: 'Бюджет', desc: 'Важна разумная цена', icon: Star },
                { id: 'unique', title: 'Уникальность', desc: 'Хочу то, чего нет у других', icon: Layout },
            ]
        }
    ];

    const handleSelect = (optionId) => {
        setAnswers(prev => ({ ...prev, [step]: optionId }));
        if (step < 5) {
            setStep(step + 1);
        } else {
            setStep(6); // Final form
        }
    };

    const currentStepData = steps.find(s => s.id === step);

    return (
        <div className="landing-survey-container font-shubody">
            <AnimatePresence mode="wait">
                {step <= 5 ? (
                    <motion.div
                        key={`step-${step}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-shu-pink font-shupixel text-[10px] tracking-widest uppercase">Шаг {step} / 5</span>
                            <span className="text-gray-500 font-shupixel text-[9px] uppercase tracking-widest">{currentStepData?.title}</span>
                        </div>

                        <h2 className="text-2xl font-shupixel text-white mb-8 tracking-tight uppercase leading-relaxed md:leading-tight">
                            {currentStepData?.question}
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            {currentStepData?.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelect(option.id)}
                                    className="group relative flex items-center gap-5 p-5 bg-[#111] border-2 border-white/10 hover:border-shu-pink transition-all text-left overflow-hidden"
                                >
                                    <div className="w-12 h-12 bg-white/5 border border-white/10 group-hover:border-shu-pink/40 flex items-center justify-center transition-all duration-300">
                                        <option.icon className="w-6 h-6 text-white group-hover:text-shu-pink transition-colors" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-shupixel text-white group-hover:text-shu-pink transition-colors uppercase">
                                            {option.title}
                                        </h3>
                                        <p className="text-[10px] text-gray-500 font-shubody group-hover:text-gray-400">
                                            {option.desc}
                                        </p>
                                    </div>
                                    <ChevronRight className="ml-auto w-5 h-5 text-gray-700 group-hover:text-shu-pink transition-colors" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="final"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                    >
                        <div className="w-20 h-20 bg-shu-pink/10 border-2 border-shu-pink flex items-center justify-center mx-auto mb-6 shadow-pixel">
                            <Send className="w-10 h-10 text-shu-pink" />
                        </div>
                        <h2 className="text-3xl font-shupixel text-white mb-4 tracking-tight uppercase leading-relaxed">Отлично!</h2>
                        <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto leading-relaxed">
                            Мы уже знаем, какая геймификация подойдёт именно тебе. Оставь контакт — и мы пришлём персональный вариант + каталог игр.
                        </p>

                        <div className="bg-shu-card p-6 border-2 border-white/5 mb-8">
                            <RequestForm
                                onSuccess={onFinish}
                                btnBg="var(--primary-pink)"
                                initialTask={(() => {
                                    const summary = Object.entries(answers)
                                        .map(([stepId, optionId]) => {
                                            const stepData = steps.find(s => s.id === parseInt(stepId));
                                            const option = stepData?.options.find(o => o.id === optionId);
                                            return `${stepData?.title}: ${option?.title}`;
                                        })
                                        .join('\n');
                                    return `РЕЗУЛЬТАТЫ ОПРОСА:\n${summary}`;
                                })()}
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={onOpenCatalog}
                                className="w-full py-5 font-shupixel text-[10px] uppercase border-2 border-white text-white hover:bg-white hover:text-black transition-all shadow-pixel-sm hover:shadow-pixel"
                            >
                                Каталог игр
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingSurvey;
