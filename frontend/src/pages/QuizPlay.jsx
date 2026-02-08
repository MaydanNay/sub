import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const QuizPlay = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('playing'); // playing, result, finished
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [timer, setTimer] = useState(15);
    const [streak, setStreak] = useState(0);

    const QUESTIONS = [
        {
            question: 'Какая планета ближе всего к Солнцу?',
            options: ['Венера', 'Меркурий', 'Марс', 'Земля'],
            correct: 1,
            category: '🌍 География'
        },
        {
            question: 'Сколько цветов в радуге?',
            options: ['5', '6', '7', '8'],
            correct: 2,
            category: '🔬 Наука'
        },
        {
            question: 'Какой элемент обозначается символом "Au"?',
            options: ['Серебро', 'Алюминий', 'Золото', 'Аргон'],
            correct: 2,
            category: '⚗️ Химия'
        },
        {
            question: 'В каком году человек впервые полетел в космос?',
            options: ['1957', '1961', '1969', '1975'],
            correct: 1,
            category: '🚀 История'
        },
        {
            question: 'Какое животное самое быстрое на суше?',
            options: ['Лев', 'Гепард', 'Антилопа', 'Тигр'],
            correct: 1,
            category: '🦁 Природа'
        },
        {
            question: 'Столица Австралии?',
            options: ['Сидней', 'Мельбурн', 'Канберра', 'Брисбен'],
            correct: 2,
            category: '🌍 География'
        },
        {
            question: 'Сколько струн у стандартной гитары?',
            options: ['4', '5', '6', '7'],
            correct: 2,
            category: '🎵 Музыка'
        },
        {
            question: 'Какой газ составляет большую часть атмосферы Земли?',
            options: ['Кислород', 'Азот', 'Углекислый газ', 'Водород'],
            correct: 1,
            category: '🔬 Наука'
        }
    ];

    const REWARDS = [
        { minScore: 8, title: 'Гений!', emoji: '🧠', prize: 'Скидка 25%' },
        { minScore: 6, title: 'Эрудит!', emoji: '📚', prize: 'Скидка 20%' },
        { minScore: 4, title: 'Молодец!', emoji: '⭐', prize: 'Скидка 10%' },
        { minScore: 2, title: 'Неплохо!', emoji: '👍', prize: 'Скидка 5%' },
        { minScore: 0, title: 'Учись!', emoji: '📖', prize: null }
    ];

    useEffect(() => {
        if (gameState !== 'playing' || showResult) return;

        if (timer <= 0) {
            handleAnswer(-1);
            return;
        }

        const interval = setInterval(() => {
            setTimer(t => t - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer, gameState, showResult]);

    const startGame = () => {
        setGameState('playing');
        setCurrentQuestion(0);
        setScore(0);
        setStreak(0);
        setTimer(15);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    const handleAnswer = (index) => {
        if (showResult) return;

        setSelectedAnswer(index);
        setShowResult(true);

        const isCorrect = index === QUESTIONS[currentQuestion].correct;

        if (isCorrect) {
            const bonus = streak >= 2 ? 2 : 1;
            setScore(s => s + bonus);
            setStreak(s => s + 1);
        } else {
            setStreak(0);
        }

        setTimeout(() => {
            if (currentQuestion + 1 >= QUESTIONS.length) {
                setGameState('finished');
            } else {
                setCurrentQuestion(q => q + 1);
                setSelectedAnswer(null);
                setShowResult(false);
                setTimer(15);
            }
        }, 1500);
    };

    const getReward = () => {
        return REWARDS.find(r => score >= r.minScore) || REWARDS[REWARDS.length - 1];
    };

    const question = QUESTIONS[currentQuestion];

    return (
        <div className="min-h-screen bg-[#0f1115] text-white overflow-x-hidden relative flex flex-col">
            {/* Standard Game Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-[2px]">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/game/quiz')}
                    className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10 active:scale-95"
                >
                    ← Выйти
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent italic uppercase"
                >
                    QUIZ
                </motion.div>

                <div className="flex items-center gap-3 bg-emerald-500/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-emerald-500/20 shadow-xl">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Очки:</span>
                    <span className="text-xl font-black italic tracking-tighter tabular-nums">
                        {score}
                    </span>
                </div>
            </div>

            <div className="pt-24 pb-8 px-4 flex-1 flex flex-col items-center max-w-lg mx-auto w-full">
                {/* Playing Screen */}
                {gameState === 'playing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col w-full"
                    >
                        {/* Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-2">
                                <span>{question.category}</span>
                                <span>Вопрос {currentQuestion + 1}/{QUESTIONS.length}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                                />
                            </div>
                        </div>

                        {/* Timer */}
                        <div className="flex justify-center mb-10">
                            <motion.div
                                animate={{ scale: timer <= 5 ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 0.5, repeat: timer <= 5 ? Infinity : 0 }}
                                className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black border-2 transition-colors ${timer <= 5 ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10'
                                    }`}
                            >
                                {timer}
                            </motion.div>
                        </div>

                        {/* Question */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1"
                            >
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 mb-8 shadow-2xl">
                                    <h3 className="text-2xl font-black text-center leading-tight tracking-tight">{question.question}</h3>
                                </div>

                                {/* Options */}
                                <div className="grid gap-4">
                                    {question.options.map((option, index) => {
                                        let buttonStyle = 'bg-white/5 hover:bg-white/10 border-white/5';

                                        if (showResult) {
                                            if (index === question.correct) {
                                                buttonStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
                                            } else if (index === selectedAnswer && index !== question.correct) {
                                                buttonStyle = 'bg-red-500/20 border-red-500 text-red-500';
                                            } else {
                                                buttonStyle = 'bg-white/5 opacity-50 border-white/5';
                                            }
                                        }

                                        return (
                                            <motion.button
                                                key={index}
                                                whileHover={!showResult ? { scale: 1.02, x: 5 } : {}}
                                                whileTap={!showResult ? { scale: 0.98 } : {}}
                                                onClick={() => handleAnswer(index)}
                                                disabled={showResult}
                                                className={`w-full p-5 rounded-2xl text-left font-bold transition-all border-2 flex items-center gap-4 ${buttonStyle}`}
                                            >
                                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors ${showResult && index === question.correct ? 'bg-emerald-500 text-white' : 'bg-white/10'
                                                    }`}>
                                                    {String.fromCharCode(64 + index + 1)}
                                                </span>
                                                {option}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Finished Screen */}
                {gameState === 'finished' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center w-full"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: 2 }}
                            className="text-9xl mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            {getReward().emoji}
                        </motion.div>

                        <h2 className="text-4xl font-black mb-2 tracking-tighter italic uppercase bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            {getReward().title}
                        </h2>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 mb-8 w-full shadow-2xl">
                            <p className="text-6xl font-black text-white mb-2 tabular-nums">{score}</p>
                            <p className="text-emerald-500/60 font-black uppercase text-[10px] tracking-[0.3em]">очков из {QUESTIONS.length * 2}</p>
                            <div className="h-px bg-white/10 my-6" />
                            <p className="text-sm font-bold text-white/40">
                                Правильных ответов: {Math.min(score, QUESTIONS.length)}
                            </p>
                        </div>

                        {getReward().prize && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-gradient-to-r from-yellow-400 to-amber-600 text-white rounded-2xl px-8 py-4 mb-10 shadow-xl shadow-amber-900/20"
                            >
                                <p className="font-black text-xl uppercase tracking-tighter">🎁 {getReward().prize}</p>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startGame}
                                className="bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-sm"
                            >
                                🔄 Заново
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/')}
                                className="bg-white/10 backdrop-blur-md py-5 rounded-2xl font-black uppercase tracking-widest text-sm border border-white/10"
                            >
                                🏠 Меню
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-600/5 rounded-full blur-[150px] animate-pulse animation-delay-2000" />
            </div>
        </div>
    );
};

export default QuizPlay;
