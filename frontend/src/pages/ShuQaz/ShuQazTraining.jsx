import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DICTIONARY } from './qazData';

const ShuQazTraining = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('READY'); // READY, PLAYING, FINISHED
    const [activeMode, setActiveMode] = useState(null); // CONSTRUCTOR, TRANSLATOR, SAVANNA
    const [currentWord, setCurrentWord] = useState(null);
    const [options, setOptions] = useState([]); // For Translator/Savanna
    const [scrambledLetters, setScrambledLetters] = useState([]); // For Constructor
    const [pickedLetters, setPickedLetters] = useState([]); // For Constructor
    const [earnedBaursaks, setEarnedBaursaks] = useState(0);
    const [isWrong, setIsWrong] = useState(false);

    // Savanna specific
    const [fallingOptions, setFallingOptions] = useState([]);
    const savannaTimer = useRef(null);

    const startConstructor = () => {
        const word = DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)];
        setCurrentWord(word);
        const letters = word.kz.split('').map((char, index) => ({ id: index, char }));
        setScrambledLetters(shuffleArray([...letters]));
        setPickedLetters([]);
        setActiveMode('CONSTRUCTOR');
        setGameState('PLAYING');
    };

    const startTranslator = () => {
        const target = DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)];
        const distractors = DICTIONARY
            .filter(w => w.id !== target.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const allOptions = shuffleArray([target, ...distractors]);
        setCurrentWord(target);
        setOptions(allOptions);
        setActiveMode('TRANSLATOR');
        setGameState('PLAYING');
    };

    const startSavanna = () => {
        const target = DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)];
        setCurrentWord(target);
        const distractors = DICTIONARY
            .filter(w => w.id !== target.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const allOptions = shuffleArray([target, ...distractors]);
        const falling = allOptions.map((opt, i) => ({
            ...opt,
            x: 10 + Math.random() * 60, // 10-70% width
            y: -10 - (i * 20), // staggered start
            speed: 0.5 + Math.random() * 0.5
        }));

        setFallingOptions(falling);
        setActiveMode('SAVANNA');
        setGameState('PLAYING');
    };

    const shuffleArray = (array) => {
        return [...array].sort(() => Math.random() - 0.5);
    };

    const handleAnswer = (option) => {
        if (option.id === currentWord.id) {
            setEarnedBaursaks(prev => prev + 15);
            setGameState('FINISHED');
            if (activeMode === 'SAVANNA') clearInterval(savannaTimer.current);
        } else {
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 500);
        }
    };

    // Constructor logic
    const pickLetter = (letterObj) => {
        setPickedLetters([...pickedLetters, letterObj]);
        setScrambledLetters(scrambledLetters.filter(l => l.id !== letterObj.id));
    };

    const removeLetter = (letterObj) => {
        setScrambledLetters([...scrambledLetters, letterObj]);
        setPickedLetters(pickedLetters.filter(l => l.id !== letterObj.id));
    };

    useEffect(() => {
        if (activeMode === 'CONSTRUCTOR' && gameState === 'PLAYING' && scrambledLetters.length === 0 && pickedLetters.length > 0) {
            const result = pickedLetters.map(l => l.char).join('');
            if (result === currentWord.kz) {
                setEarnedBaursaks(prev => prev + 15);
                setTimeout(() => setGameState('FINISHED'), 500);
            } else {
                setIsWrong(true);
                setTimeout(() => {
                    setScrambledLetters(shuffleArray([...pickedLetters]));
                    setPickedLetters([]);
                    setIsWrong(false);
                }, 500);
            }
        }
    }, [pickedLetters, scrambledLetters, gameState, currentWord, activeMode]);

    // Savanna Logic
    useEffect(() => {
        if (activeMode === 'SAVANNA' && gameState === 'PLAYING') {
            savannaTimer.current = setInterval(() => {
                setFallingOptions(prev => {
                    const next = prev.map(opt => ({ ...opt, y: opt.y + opt.speed }));
                    // If correct word hits bottom, user loses (shake and finish without reward)
                    const missedTarget = next.find(opt => opt.id === currentWord.id && opt.y > 90);
                    if (missedTarget) {
                        clearInterval(savannaTimer.current);
                        setIsWrong(true);
                        setTimeout(() => {
                            setIsWrong(false);
                            setGameState('FINISHED');
                        }, 500);
                        return next;
                    }
                    return next;
                });
            }, 50);
            return () => clearInterval(savannaTimer.current);
        }
    }, [activeMode, gameState, currentWord]);

    return (
        <div className="w-full h-full min-h-[100dvh] bg-[#F0F4F8] text-[#2D3748] font-sans flex justify-center items-center overflow-hidden relative">
            <div className="w-full max-w-[480px] h-full bg-white shadow-2xl overflow-hidden relative border-x border-slate-200 flex flex-col">

                {/* Header */}
                <div className="p-4 flex items-center gap-4 relative z-50 bg-white">
                    <button onClick={() => navigate('/game/shuqaz')} className="text-slate-400 text-2xl">←</button>
                    <h1 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Тренировка</h1>
                </div>

                <div className="flex-grow flex flex-col items-center justify-center px-8 relative">
                    <AnimatePresence mode="wait">
                        {gameState === 'READY' && (
                            <motion.div
                                key="ready"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full space-y-4"
                            >
                                <div className="text-center mb-6">
                                    <div className="text-6xl mb-4">🎯</div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase italic">Выбери режим</h2>
                                </div>

                                <button
                                    onClick={startConstructor}
                                    className="w-full group bg-white border-2 border-slate-100 p-4 rounded-[2rem] flex items-center gap-4 hover:border-blue-400 transition-all text-left shadow-sm active:scale-95"
                                >
                                    <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl text-xl group-hover:bg-blue-100 transition-colors">🧩</div>
                                    <div>
                                        <h3 className="font-black text-slate-800 uppercase italic text-xs">Сөз-Конструктор</h3>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Собери слово из букв</p>
                                    </div>
                                </button>

                                <button
                                    onClick={startTranslator}
                                    className="w-full group bg-white border-2 border-slate-100 p-4 rounded-[2.5rem] flex items-center gap-4 hover:border-emerald-400 transition-all text-left shadow-sm active:scale-95"
                                >
                                    <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-xl text-xl group-hover:bg-emerald-100 transition-colors">📖</div>
                                    <div>
                                        <h3 className="font-black text-slate-800 uppercase italic text-xs">Аудармашы</h3>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Выбери правильный перевод</p>
                                    </div>
                                </button>

                                <button
                                    onClick={startSavanna}
                                    className="w-full group bg-white border-2 border-slate-100 p-4 rounded-[2.5rem] flex items-center gap-4 hover:border-amber-400 transition-all text-left shadow-sm active:scale-95"
                                >
                                    <div className="w-12 h-12 bg-amber-50 flex items-center justify-center rounded-xl text-xl group-hover:bg-amber-100 transition-colors">🐎</div>
                                    <div>
                                        <h3 className="font-black text-slate-800 uppercase italic text-xs">Көкпар</h3>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Успей поймать перевод</p>
                                    </div>
                                </button>
                            </motion.div>
                        )}

                        {gameState === 'PLAYING' && activeMode === 'CONSTRUCTOR' && (
                            <motion.div
                                key="playing-constructor"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`w-full flex-grow flex flex-col items-center pt-10 ${isWrong ? 'animate-shake' : ''}`}
                            >
                                <div className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2 italic">Перевод</div>
                                <div className="text-3xl font-black text-slate-800 mb-20">{currentWord?.ru}</div>

                                {/* Slot Areas */}
                                <div className="flex gap-2 mb-16 flex-wrap justify-center min-h-[64px] w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                                    {pickedLetters.map((l, i) => (
                                        <motion.button
                                            key={l.id}
                                            layoutId={`letter-${l.id}`}
                                            onClick={() => removeLetter(l)}
                                            className="w-12 h-14 bg-white border-b-4 border-blue-600 rounded-xl shadow-md flex items-center justify-center text-2xl font-black text-blue-600"
                                        >
                                            {l.char}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Scrambled Letters */}
                                <div className="flex gap-3 flex-wrap justify-center">
                                    {scrambledLetters.map((l, i) => (
                                        <motion.button
                                            key={l.id}
                                            layoutId={`letter-${l.id}`}
                                            onClick={() => pickLetter(l)}
                                            className="w-14 h-16 bg-white border-b-4 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center text-2xl font-black text-slate-700 hover:border-blue-400 active:translate-y-1 transition-all"
                                        >
                                            {l.char}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {gameState === 'PLAYING' && activeMode === 'TRANSLATOR' && (
                            <motion.div
                                key="playing-translator"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`w-full flex-grow flex flex-col items-center pt-10 ${isWrong ? 'animate-shake' : ''}`}
                            >
                                <div className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2 italic">Слово на казахском</div>
                                <div className="text-4xl font-black text-slate-800 mb-20">{currentWord?.kz}</div>

                                <div className="grid grid-cols-1 gap-4 w-full px-4">
                                    {options.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleAnswer(opt)}
                                            className="w-full py-5 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-700 hover:border-emerald-400 hover:text-emerald-600 transition-all text-center shadow-sm active:scale-95 uppercase tracking-widest text-sm italic"
                                        >
                                            {opt.ru}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {gameState === 'PLAYING' && activeMode === 'SAVANNA' && (
                            <motion.div
                                key="playing-savanna"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`w-full h-full flex flex-col items-center relative overflow-hidden ${isWrong ? 'animate-shake' : ''}`}
                            >
                                <div className="absolute top-10 text-center">
                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">Цель</div>
                                    <div className="text-3xl font-black text-slate-800 transition-all">{currentWord?.kz}</div>
                                </div>

                                {/* Falling Container Area */}
                                <div className="w-full h-full relative mt-16 pb-20">
                                    {fallingOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleAnswer(opt)}
                                            className="absolute bg-white border-2 border-slate-100 px-4 py-2 rounded-xl font-black text-slate-700 hover:border-amber-400 shadow-lg active:scale-95 whitespace-nowrap text-xs uppercase italic tracking-widest transition-colors"
                                            style={{
                                                left: `${opt.x}%`,
                                                top: `${opt.y}%`,
                                                zIndex: 10
                                            }}
                                        >
                                            {opt.ru}
                                        </button>
                                    ))}

                                    {/* Bottom Finish Line */}
                                    <div className="absolute bottom-16 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50" />
                                </div>
                            </motion.div>
                        )}

                        {gameState === 'FINISHED' && (
                            <motion.div
                                key="finished"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="text-7xl mb-6">{earnedBaursaks > 0 ? '🎉' : '😟'}</div>
                                <h1 className="text-4xl font-black text-slate-800 mb-2 italic">
                                    {earnedBaursaks > 0 ? 'МОЛОДЕЦ!' : 'ПОПРОБУЙ ЕЩЕ!'}
                                </h1>
                                <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-xs">
                                    {earnedBaursaks > 0 ? 'Тренировка завершена' : 'Время вышло или ошибка'}
                                </p>

                                <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-100 mb-10">
                                    <div className="text-4xl font-black text-amber-600 mb-1 italic">+{earnedBaursaks}</div>
                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Баурсаков заработано</div>
                                </div>

                                <button
                                    onClick={() => {
                                        setEarnedBaursaks(0);
                                        setGameState('READY');
                                        setActiveMode(null);
                                    }}
                                    className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl uppercase text-sm tracking-widest mb-3"
                                >
                                    Еще раз
                                </button>
                                <button
                                    onClick={() => navigate('/game/shuqaz')}
                                    className="w-full py-4 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-2xl uppercase text-sm tracking-widest"
                                >
                                    Выйти
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Tip */}
                {gameState === 'PLAYING' && (
                    <div className="p-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.25em] relative z-50 bg-white">
                        {activeMode === 'CONSTRUCTOR' ? 'Нажми на букву, чтобы выбрать' :
                            activeMode === 'SAVANNA' ? 'Жми на правильный перевод!' :
                                'Выбери правильный вариант'}
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            ` }} />
        </div>
    );
};

export default ShuQazTraining;
