import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Send, List } from 'lucide-react';
import * as GameIcons from './GameIcons';
import RequestForm from './RequestForm';

const LandingSurvey = ({ onFinish, onOpenCatalog }) => {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({});

    const steps = [
        {
            id: 1,
            title: 'ВЫБОР ГЕРОЯ',
            question: 'КТО ТЫ В ЭТОЙ ИСТОРИИ?',
            options: [
                { id: 'personal', title: 'ФИЗИЧЕСКОЕ ЛИЦО', desc: 'Хочу игру для себя, своего проекта или мероприятия.', icon: GameIcons.IconUsers, color: '#E86D84' },
                { id: 'business', title: 'БИЗНЕС / КОМПАНИЯ', desc: 'Хочу геймификацию для клиентов или команды.', icon: GameIcons.IconChart, color: '#9FD2FF' },
            ]
        },
        {
            id: 2,
            title: 'СФЕРА',
            question: 'КАКАЯ У ТЕБЯ СФЕРА?',
            options: [
                { id: 'education', title: 'ОБРАЗОВАНИЕ', desc: 'Школы, курсы, онлайн-обучение.', icon: GameIcons.IconBrain, color: '#CFF25F' },
                { id: 'horeca', title: 'HORECA', desc: 'Кофейни, рестораны, фудкорты.', icon: GameIcons.IconCoffee, color: '#FFD700' },
                { id: 'hr', title: 'КОРПОРАТИВ / HR', desc: 'Команды, офисы, корпоративная культура.', icon: GameIcons.IconUsers, color: '#9FD2FF' },
                { id: 'retail', title: 'РИТЕЙЛ / E-COMMERCE', desc: 'Магазины, маркетплейсы, онлайн-продажи.', icon: GameIcons.IconShoppingBag, color: '#E86D84' },
                { id: 'events', title: 'ИВЕНТЫ', desc: 'Мероприятия, выставки, форумы.', icon: GameIcons.IconTicket, color: '#6CFFFF' },
                { id: 'other', title: 'ДРУГОЕ', desc: 'Расскажу сам(а).', icon: GameIcons.IconTarget, color: '#ffffff' },
            ]
        },
        {
            id: 3,
            title: 'ЗАДАЧА (ЧТО НУЖНО)',
            question: 'КАКУЮ ЗАДАЧУ ХОЧЕШЬ РЕШИТЬ?',
            options: [
                { id: 'clients', title: 'ПРИВЛЕЧЬ НОВЫХ КЛИЕНТОВ', desc: 'Охваты, лиды, виральность.', icon: GameIcons.IconZap, color: '#E86D84' },
                { id: 'retention', title: 'УДЕРЖАТЬ И ВЕРНУТЬ КЛИЕНТОВ', desc: 'Лояльность, повторные визиты.', icon: GameIcons.IconTarget, color: '#CFF25F' },
                { id: 'staff', title: 'МОТИВИРОВАТЬ СОТРУДНИКОВ', desc: 'Вовлечённость, KPI, командный дух.', icon: GameIcons.IconUsers, color: '#9FD2FF' },
                { id: 'promo', title: 'ПРОВЕСТИ РАЗОВУЮ АКЦИЮ', desc: 'Запуск, праздник, кампания.', icon: GameIcons.IconGift, color: '#FFD700' },
                { id: 'culture', title: 'УКРЕПИТЬ КОРП. КУЛЬТУРУ', desc: 'Ценности, онбординг, вовлечённость.', icon: GameIcons.IconStar, color: '#6CFFFF' },
            ]
        },
        {
            id: 4,
            title: 'УРОВЕНЬ ПОНЯТНОСТИ',
            question: 'КАК ТЫ ОТНОСИШЬСЯ К ГЕЙМИФИКАЦИИ?',
            options: [
                { id: 'ready', title: 'УЖЕ ЗНАЮ И ХОЧУ ВНЕДРИТЬ', desc: 'Понимаю, что это, ищу исполнителя.', icon: GameIcons.IconZap, color: '#CFF25F' },
                { id: 'curious', title: 'СЛЫШАЛ(А), НО НЕ ПОНИМАЮ', desc: 'Хочу разобраться.', icon: GameIcons.IconQuestion, color: '#9FD2FF' },
                { id: 'newbie', title: 'ПЕРВЫЙ РАЗ СЛЫШУ', desc: 'Объясните с нуля.', icon: GameIcons.IconEye, color: '#E86D84' },
            ]
        },
        {
            id: 5,
            title: 'ПРИОРИТЕТ ПРОЕКТА',
            question: 'ЧТО ДЛЯ ТЕБЯ ВАЖНЕЕ ВСЕГО В ПРОЕКТЕ?',
            options: [
                { id: 'speed', title: 'СКОРОСТЬ', desc: 'Хочу запустить быстро.', icon: GameIcons.IconZap, color: '#E86D84' },
                { id: 'budget', title: 'БЮДЖЕТ', desc: 'Важна разумная цена.', icon: GameIcons.IconCoin, color: '#CFF25F' },
                { id: 'unique', title: 'УНИКАЛЬНОСТЬ', desc: 'Хочу то, чего нет у других.', icon: GameIcons.IconDiamond, color: '#9FD2FF' },
            ]
        }
    ];

    const handleSelect = (optionId) => {
        const currentStep = steps.find(s => s.id === step);
        const newAnswers = { ...answers, [currentStep.id]: optionId };
        setAnswers(newAnswers);

        if (step < steps.length) {
            setStep(step + 1);
        } else {
            setStep('final');
        }
    };

    const currentStepData = steps.find(s => s.id === step);

    return (
        <div
            style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--text-color)',
                width: '100%',
                maxWidth: '540px',
                margin: '0 auto'
            }}
        >
            <AnimatePresence mode="wait">
                {step !== 'final' ? (
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column' }}
                    >
                        <div className="survey-step-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                    className="survey-step-badge"
                                    style={{
                                        backgroundColor: 'var(--primary-pink)',
                                        color: '#000',
                                        fontFamily: 'var(--font-pixel)',
                                        fontSize: '10px',
                                        padding: '4px 8px',
                                        border: '2px solid #000',
                                        boxShadow: '2px 2px 0px #000',
                                        lineHeight: '1.2'
                                    }}
                                >
                                    ШАГ {step}
                                </span>
                                <span 
                                    className="survey-step-title"
                                    style={{ 
                                        fontFamily: 'var(--font-pixel)', 
                                        fontSize: '8px', 
                                        color: '#888', 
                                        textTransform: 'uppercase',
                                        lineHeight: '1.4'
                                    }}
                                >
                                    {currentStepData?.title}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div
                                        key={s}
                                        style={{
                                            width: '16px',
                                            height: '6px',
                                            backgroundColor: s <= step ? 'var(--primary-pink)' : '#333',
                                            border: '1px solid #000'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <h2
                            className="survey-question"
                            style={{
                                fontFamily: 'var(--font-pixel)',
                                fontSize: '16px',
                                lineHeight: '1.6',
                                marginBottom: '24px',
                                color: '#fff',
                                textTransform: 'uppercase'
                            }}
                        >
                            {currentStepData?.question}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                            {currentStepData?.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelect(option.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        backgroundColor: '#1a1a1a',
                                        border: '3px solid #fff',
                                        boxShadow: '6px 6px 0px rgba(255, 255, 255, 0.1)',
                                        padding: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.1s',
                                        textAlign: 'left'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary-pink)';
                                        e.currentTarget.style.boxShadow = '6px 6px 0px var(--primary-pink)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = '#fff';
                                        e.currentTarget.style.boxShadow = '6px 6px 0px rgba(255, 255, 255, 0.1)';
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: option.color || '#333',
                                            border: '2px solid #000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        <option.icon className="w-6 h-6 text-black" />
                                    </div>
                                    <div style={{ flexGrow: 1 }}>
                                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: '#fff', marginBottom: '2px' }}>
                                            {option.title}
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#888' }}>
                                            {option.desc}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-700" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="final"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                backgroundColor: 'rgba(230, 109, 122, 0.1)',
                                border: '3px solid var(--primary-pink)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px auto',
                                boxShadow: '4px 4px 0px var(--primary-pink)'
                            }}
                        >
                            <Send className="w-8 h-8" style={{ color: 'var(--primary-pink)' }} />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', lineHeight: '1.6', color: '#fff', marginBottom: '12px', textTransform: 'uppercase' }}>Отлично!</h2>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#aaa', marginBottom: '24px', lineHeight: '1.6' }}>
                            Мы уже знаем, какая геймификация подойдёт именно тебе. Оставь контакт — и мы пришлём персональный вариант + каталог игр.
                        </p>

                        <div
                            style={{
                                backgroundColor: '#111',
                                border: '3px solid #fff',
                                padding: '20px',
                                textAlign: 'left',
                                boxShadow: '4px 4px 0px rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <RequestForm
                                inputBg="#1a1a1a"
                                inputTextColor="#ffffff"
                                labelColor="#888888"
                                btnBg="var(--primary-pink)"
                                isModal={true}
                                onSuccess={onFinish}
                                onClose={onOpenCatalog}
                                submitText="Отправить"
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

                        <button
                            onClick={() => window.open('https://app.shustudio.kz', '_blank', 'noopener,noreferrer')}
                            style={{
                                marginTop: '24px',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                backgroundColor: '#1a1a1a',
                                border: '3px solid #fff',
                                boxShadow: '4px 4px 0px rgba(255, 255, 255, 0.1)',
                                padding: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.1s',
                                fontFamily: 'var(--font-pixel)',
                                color: '#fff',
                                fontSize: '11px',
                                textTransform: 'uppercase'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--secondary-blue)';
                                e.currentTarget.style.boxShadow = '6px 6px 0px var(--secondary-blue)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = '#fff';
                                e.currentTarget.style.boxShadow = '4px 4px 0px rgba(255, 255, 255, 0.1)';
                            }}
                        >
                            <List className="w-4 h-4" />
                            КАТАЛОГ ИГР
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingSurvey;
