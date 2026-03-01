import React from 'react';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';

const GameLoader = ({ loading, error, retry, children, message = "Загрузка..." }) => {
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 font-montserrat">
                <div className="relative w-20 h-20 mb-6 font-montserrat">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full font-montserrat"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin font-montserrat"></div>
                    <Loader className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 opacity-50 font-montserrat" />
                </div>
                <div className="text-xl font-black tracking-tight animate-pulse font-montserrat">{message}</div>
                <div className="mt-4 text-slate-500 text-xs font-bold uppercase tracking-widest font-montserrat">ShuBoom Mobile</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8 text-center font-montserrat">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20 font-montserrat">
                    <AlertCircle className="w-10 h-10 text-red-500 font-montserrat" />
                </div>
                <h2 className="text-2xl font-black mb-2 font-montserrat">Ошибка загрузки</h2>
                <p className="text-slate-400 mb-8 max-w-xs font-montserrat">{error}</p>
                <button
                    onClick={retry}
                    className="flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-transform font-montserrat"
                >
                    <RefreshCw className="w-5 h-5 font-montserrat" />
                    ПОПРОБОВАТЬ СНОВА
                </button>
            </div>
        );
    }

    return children;
};

export default GameLoader;
