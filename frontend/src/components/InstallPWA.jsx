import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconDownload } from './GameIcons';

const InstallPWA = (props) => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        // Detect iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        setIsIOS(ios || isSafari);

        // Check if app is already installed/in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

        if (isStandalone) {
            setIsVisible(false);
            return;
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        // For Android/Chrome
        window.addEventListener('beforeinstallprompt', handler);

        // For iOS, we show it after a small delay if not standalone
        // BUT now we only show the button, instructions come later
        if (ios || isSafari) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowInstructions(true);
            return;
        }

        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    // Variant: 'fixed' (default bottom sheet) or 'header' (inline button)
    const { variant = 'fixed' } = props;

    if (variant === 'header') {
        return (
            <AnimatePresence mode="wait">
                {isVisible && (
                    <motion.div
                        key="header-install"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 flex justify-center w-full px-4"
                    >
                        {showInstructions ? (
                            <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-4 flex items-center gap-4 shadow-xl max-w-sm w-full text-left">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Установить приложение</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Нажмите <span className="inline-block mx-1"><svg className="w-3 h-3 inline text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" /></svg></span> и "На экран Домой"
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowInstructions(false)}
                                    className="ml-auto text-gray-400 hover:text-gray-600 p-2"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstallClick}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-purple-200 hover:shadow-purple-300 active:scale-95 transition-all flex items-center gap-3"
                            >
                                <IconDownload className="w-5 h-5" />
                                <span>Скачать приложение</span>
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    // Floating variant (bottom fixed) - keeping implementation but using unified handler
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[110] w-[calc(100%-1.5rem)] max-w-sm md:max-w-md"
                >
                    <div className="bg-white/90 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 relative overflow-hidden">
                        {/* Background subtle gradient */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>

                        {showInstructions ? (
                            <div className="flex items-center gap-4 w-full">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl flex-shrink-0">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 text-sm">Для установки на iOS:</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Нажмите <span className="inline-block mx-1"><svg className="w-3 h-3 inline text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" /></svg></span> и "На экран Домой"
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowInstructions(false)}
                                    className="ml-auto text-gray-400 hover:text-gray-600 p-2"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 md:p-3.5 text-white shadow-xl shadow-indigo-100">
                                        <IconDownload className="w-full h-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 leading-tight text-sm md:text-base">
                                            Установить приложение
                                        </h4>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">
                                            Быстрый доступ и работа офлайн
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleInstallClick}
                                    className="w-full sm:w-auto bg-gray-900 text-white px-6 py-2.5 md:py-3 rounded-2xl text-xs md:text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                                >
                                    Установить
                                </button>
                            </>
                        )}

                        {!showInstructions && (
                            <button
                                onClick={() => setIsVisible(false)}
                                className="absolute top-3 right-3 w-8 h-8 bg-gray-100/50 hover:bg-gray-200/50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPWA;
