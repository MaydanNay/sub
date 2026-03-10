import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, ChevronRight, X, ArrowLeft } from 'lucide-react';
import useShuRunStore from './useShuRunStore';

export default function ShuRunAuth({ isOpen, onClose, onShowCatalog }) {
    const authenticate = useShuRunStore(s => s.authenticate);
    const [step, setStep] = useState(1); // 1: Phone, 2: Nickname
    const [phone, setPhone] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');

    const handleNext = () => {
        if (step === 1) {
            if (phone.length < 10) {
                setError('Введите корректный номер телефона');
                return;
            }
            setError('');
            setStep(2);
        } else {
            if (nickname.length < 2) {
                setError('Имя должно быть не короче 2 символов');
                return;
            }
            authenticate({ phone, nickname });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center p-0 sm:p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative bg-slate-900 w-full max-w-md rounded-t-[40px] sm:rounded-[40px] overflow-hidden border-t sm:border border-white/10 font-montserrat"
                >
                    {/* Decorative Top Line */}
                    <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-4 mb-2 sm:hidden" />

                    <div className="p-8 pt-6">
                        <div className="flex justify-between items-center mb-8">
                            {step === 2 ? (
                                <button onClick={() => setStep(1)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            ) : <div className="w-5" />}

                            <h2 className="text-xl font-bold text-white text-center flex-1 font-montserrat">
                                {step === 1 ? 'Твой телефон' : 'Как тебя зовут?'}
                            </h2>

                            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Step 1: Phone */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="+7 (___) ___-__-__"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                                    />
                                </div>
                                <p className="text-slate-500 text-xs text-center leading-relaxed">
                                    Мы отправим SMS с кодом подтверждения (в демо-режиме код не требуется).
                                </p>
                            </motion.div>
                        )}

                        {/* Step 2: Nickname */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Придумай никнейм"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        autoFocus
                                        className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                                    />
                                </div>
                                <p className="text-slate-500 text-xs text-center leading-relaxed">
                                    Твой никнейм будет виден в таблице лидеров и на медалях.
                                </p>
                            </motion.div>
                        )}

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-rose-500 text-xs font-bold text-center mt-4"
                            >
                                {error}
                            </motion.p>
                        )}

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNext}
                            className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
                        >
                            {step === 1 ? 'Далее' : 'Начать приключение'}
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>

                        <button
                            onClick={onShowCatalog}
                            className="w-full mt-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
                        >
                            Узнать больше о проекте
                        </button>
                    </div>

                    {/* Footer decoration */}
                    <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 opacity-30" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
