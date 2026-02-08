import React from 'react';
import { motion } from 'framer-motion';

const BusinessValueCard = ({ explanation, usage, impact, className = "mt-16 mb-20 px-4" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`w-full max-w-4xl ${className}`}
        >
            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/50 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>

                <h3 className="text-2xl md:text-3xl font-black text-indigo-900 mb-10 flex items-center gap-3 relative z-10">
                    <span className="bg-indigo-600 text-white p-2 rounded-xl text-xl shadow-lg shadow-indigo-200">💼</span>
                    Ценность для вашего бизнеса
                </h3>

                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                    {/* Explanation */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-xs">
                            <span className="text-lg">💡</span> Зачем это нужно?
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                            {explanation}
                        </p>
                    </div>

                    {/* Usage */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs">
                            <span className="text-lg">🚀</span> Как использовать?
                        </div>
                        <ul className="space-y-3">
                            {usage.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-gray-600 text-sm">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span className="font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Impact */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-xs">
                            <span className="text-lg">📈</span> Что это принесет?
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {impact.map((item, index) => (
                                <div key={index} className="bg-emerald-50/50 border border-emerald-100/50 p-3 rounded-2xl flex items-center gap-3">
                                    <span className="text-xl">✅</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest leading-none mb-1">Эффект</p>
                                        <p className="text-xs font-black text-emerald-900 leading-none">{item}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-gray-400 font-bold max-w-sm text-center md:text-left">
                        Геймификация повышает лояльность клиентов на <span className="text-indigo-600">30%</span> и увеличивает средний чек за счет игрового азарта.
                    </p>
                    <button className="px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl font-black text-xs transition-all tracking-widest uppercase">
                        ЗАКАЗАТЬ ВНЕДРЕНИЕ
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default BusinessValueCard;
