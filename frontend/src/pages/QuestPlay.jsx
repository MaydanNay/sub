import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const QuestPlay = () => {
    const navigate = useNavigate();
    const QUESTS = [
        {
            id: 1,
            title: 'Активация',
            description: 'Нажми на кнопку 10 раз, чтобы запустить систему.',
            type: 'click',
            target: 10,
            icon: '⚡'
        },
        {
            id: 2,
            title: 'Медитация',
            description: 'Удерживай фокус в течение 15 секунд.',
            type: 'wait',
            target: 15,
            icon: '🧘'
        },
        {
            id: 3,
            title: 'Шифр',
            description: 'Загадка: Что всегда идет, но не имеет ног?',
            type: 'riddle',
            answer: 'время',
            icon: '🧠'
        },
        {
            id: 4,
            title: 'Реакция',
            description: 'Поймай 7 аномалий на экране.',
            type: 'reaction',
            target: 7,
            icon: '🎯'
        }
    ];

    const [currentStep, setCurrentStep] = useState(() => {
        const saved = localStorage.getItem('quest_step');
        return saved ? parseInt(saved) : 0;
    });

    const [progress, setProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
    const [isFinished, setIsFinished] = useState(false);
    const [gameState, setGameState] = useState('active');

    const currentQuest = QUESTS[currentStep] || null;

    useEffect(() => {
        if (currentStep >= QUESTS.length) {
            setIsFinished(true);
        } else {
            localStorage.setItem('quest_step', currentStep.toString());
        }
    }, [currentStep]);

    useEffect(() => {
        if (currentQuest?.type === 'wait' && gameState === 'active') {
            setTimeLeft(currentQuest.target);
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        completeStep();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [currentStep, currentQuest?.type, gameState]);

    const completeStep = () => {
        setGameState('completed');
        setTimeout(() => {
            setCurrentStep(prev => prev + 1);
            setProgress(0);
            setUserInput('');
            setGameState('active');
        }, 1500);
    };

    const handleAction = () => {
        if (gameState !== 'active') return;

        if (currentQuest.type === 'click') {
            const newProgress = progress + 1;
            setProgress(newProgress);
            if (newProgress >= currentQuest.target) {
                completeStep();
            }
        } else if (currentQuest.type === 'reaction') {
            const newProgress = progress + 1;
            setProgress(newProgress);
            if (newProgress >= currentQuest.target) {
                completeStep();
            } else {
                setTargetPos({
                    top: `${Math.random() * 60 + 20}%`,
                    left: `${Math.random() * 80 + 10}%`
                });
            }
        }
    };

    const handleRiddle = (e) => {
        e.preventDefault();
        if (userInput.toLowerCase().trim() === currentQuest.answer) {
            completeStep();
        } else {
            setUserInput('');
        }
    };

    const resetQuests = () => {
        setCurrentStep(0);
        setProgress(0);
        setIsFinished(false);
        localStorage.removeItem('quest_step');
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white overflow-hidden relative flex flex-col font-sans selection:bg-indigo-500/30">
            {/* Header - Standardized & Compact */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/game/quest')}
                    className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-white/20 transition-all border border-white/5 active:scale-95"
                >
                    ← Назад
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent uppercase"
                >
                    Quest
                </motion.div>

                <div className="bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Этап</span>
                    <span className="text-sm font-black tabular-nums">
                        {Math.min(currentStep + 1, QUESTS.length)}/{QUESTS.length}
                    </span>
                </div>
            </div>

            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 pt-24 pb-12 flex flex-col items-center px-6 overflow-y-auto w-full max-w-2xl mx-auto">

                {/* Compact Roadmap */}
                <div className="w-full max-w-xs mb-10 relative flex justify-between items-center px-2">
                    <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-white/5 -translate-y-1/2" />
                    <div
                        className="absolute top-1/2 left-0 h-[1.5px] bg-indigo-500 -translate-y-1/2 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                        style={{ width: `${(currentStep / (QUESTS.length - 1)) * 100}%` }}
                    />
                    {QUESTS.map((q, i) => (
                        <div key={q.id} className="relative z-10">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: i === currentStep ? 1.2 : 1,
                                    backgroundColor: i < currentStep ? '#6366f1' : i === currentStep ? '#1e293b' : '#0f172a',
                                    borderColor: i === currentStep ? '#6366f1' : 'rgba(255,255,255,0.05)'
                                }}
                                className="w-6 h-6 rounded-full flex items-center justify-center border text-[9px] font-black transition-all duration-500"
                            >
                                {i < currentStep ? '✓' : q.id}
                            </motion.div>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {!isFinished && currentQuest ? (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <div className="bg-[#16181d] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                                {gameState === 'completed' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm flex items-center justify-center z-50 text-2xl font-black italic tracking-tighter"
                                    >
                                        ГОТОВО!
                                    </motion.div>
                                )}

                                <div className="text-center mb-8">
                                    <div className="text-6xl mb-6">{currentQuest.icon}</div>
                                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{currentQuest.title}</h2>
                                    <p className="text-white/40 text-[11px] font-medium max-w-[220px] mx-auto leading-relaxed">
                                        {currentQuest.description}
                                    </p>
                                </div>

                                {/* Task Engine */}
                                <div className="flex flex-col items-center min-h-[180px] justify-center">
                                    {currentQuest.type === 'click' && (
                                        <div className="w-full max-w-xs space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end px-1 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                                    <span>Прогресс</span>
                                                    <span className="text-white/60 tabular-nums">{progress}/{currentQuest.target}</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                    <motion.div
                                                        animate={{ width: `${(progress / currentQuest.target) * 100}%` }}
                                                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                    />
                                                </div>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.96 }}
                                                onClick={handleAction}
                                                className="w-full py-6 rounded-2xl bg-indigo-600 font-black text-lg shadow-lg border border-indigo-400/20 uppercase tracking-widest active:bg-indigo-700 transition-colors"
                                            >
                                                Действие
                                            </motion.button>
                                        </div>
                                    )}

                                    {currentQuest.type === 'wait' && (
                                        <div className="flex flex-col items-center">
                                            <div className="relative w-32 h-32 flex items-center justify-center">
                                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                    <circle cx="64" cy="64" r="60" className="stroke-white/5 fill-none" strokeWidth="4" />
                                                    <motion.circle
                                                        cx="64" cy="64" r="60"
                                                        className="stroke-indigo-500 fill-none"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        strokeDasharray="377"
                                                        animate={{ strokeDashoffset: 377 - (377 * (timeLeft / currentQuest.target)) }}
                                                        transition={{ duration: 1, ease: "linear" }}
                                                    />
                                                </svg>
                                                <span className="text-4xl font-black tabular-nums">{timeLeft}</span>
                                            </div>
                                            <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.3em] text-indigo-400/60 animate-pulse">Ожидание...</p>
                                        </div>
                                    )}

                                    {currentQuest.type === 'riddle' && (
                                        <form onSubmit={handleRiddle} className="w-full max-w-xs space-y-4">
                                            <input
                                                type="text"
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                placeholder="Твой ответ..."
                                                className="w-full bg-black/40 border border-white/5 rounded-xl py-4 text-center text-lg font-bold placeholder:text-white/10 focus:border-indigo-500/50 outline-none transition-all"
                                            />
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full py-4 rounded-xl bg-white text-slate-900 font-black text-xs tracking-widest uppercase shadow-xl"
                                            >
                                                Отправить
                                            </motion.button>
                                        </form>
                                    )}

                                    {currentQuest.type === 'reaction' && (
                                        <div className="w-full h-44 bg-black/40 rounded-3xl relative overflow-hidden border border-white/5">
                                            <div className="absolute top-4 left-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                                Поймано: {progress}/{currentQuest.target}
                                            </div>
                                            <AnimatePresence>
                                                <motion.button
                                                    key={`target-${progress}`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={handleAction}
                                                    style={{
                                                        position: 'absolute',
                                                        top: targetPos.top,
                                                        left: targetPos.left,
                                                        transform: 'translate(-50%, -50%)'
                                                    }}
                                                    className="w-14 h-14 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center text-2xl border border-indigo-400/20"
                                                >
                                                    {currentQuest.icon}
                                                </motion.button>
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-sm text-center"
                        >
                            <div className="bg-[#16181d] rounded-[3rem] p-10 border border-emerald-500/10 shadow-2xl">
                                <div className="text-7xl mb-8">🏆</div>
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">Квест пройден</h2>
                                <p className="text-emerald-500 font-bold text-[9px] uppercase tracking-[0.4em] mb-10">Награда разблокирована</p>

                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 mb-10">
                                    <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mb-2">Награда недели:</p>
                                    <p className="text-3xl font-black text-emerald-400 tabular-nums">2000 БОНУСОВ 💎</p>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={resetQuests}
                                    className="w-full py-5 rounded-2xl bg-white text-slate-900 font-black text-sm tracking-widest uppercase shadow-xl"
                                >
                                    Заново 🔄
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="mt-12 text-white/10 text-[8px] font-bold text-center max-w-[200px] uppercase tracking-[0.4em] leading-relaxed">
                    Испытания обновляются еженедельно. Возвращайся в воскресенье!
                </p>
            </div>
        </div>
    );
};

export default QuestPlay;
