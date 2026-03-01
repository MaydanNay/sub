import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import confetti from 'canvas-confetti';
import boxImage from '../pages/ShuBoom/images/box.PNG';
import { useNotification } from './NotificationProvider';
import { useUser } from './UserProvider';

const ScannerContext = createContext();

export const useScanner = () => useContext(ScannerContext);

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
export const ScannerProvider = ({ children }) => {
    const { show } = useNotification();
    const { userPhone, fetchUser } = useUser();
    const [isActionPending, setIsActionPending] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
    const [scanMode, setScanMode] = useState(false);
    const [chest, setChest] = useState(null);
    const [prizes, setPrizes] = useState(null);

    const scanTimeoutRef = React.useRef(null);

    const handleScan = () => {
        if (isActionPending) return;
        setIsActionPending(true);
        setScanMode(true);

        scanTimeoutRef.current = setTimeout(() => {
            setScanMode(false);
            checkScan("MOCK_QR_DATA");
            setIsActionPending(false);
        }, 2000);
    };

    useEffect(() => {
        return () => {
            if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        // Auto-cleanup for handleScan if provider unmounts during simulation
        // Though handleScan returns a cleanup, it's not captured by React unless used in useEffect
    }, []);

    const checkScan = async (qrData) => {
        try {
            const res = await axios.post(`${API_URL}/transactions/scan`, {
                qr_data: qrData,
                user_phone: userPhone
            }, { timeout: 5000 });
            setChest(res.data.chest_type);
        } catch (e) {
            console.error(e);
            show("Ошибка сканирования", 'error');
        }
    };

    const openChest = async () => {
        if (!chest || isOpening) return;
        setIsOpening(true);
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        try {
            const res = await axios.post(`${API_URL}/chests/open`, null, {
                params: { chest_type: chest, user_phone: userPhone },
                timeout: 5000
            });
            setPrizes(res.data); // Store full response to handle coins/skins/coupons
            fetchUser(); // Sync coins globally after open
        } catch (e) {
            console.error(e);
            show("Ошибка открытия сундука", 'error');
            setChest(null);
        } finally {
            setIsOpening(false);
        }
    };

    // Confetti effect when prize triggers
    useEffect(() => {
        let animationFrameId;
        if (prizes) {
            const end = Date.now() + 1000;
            const colors = ['#bb0000', '#ffffff'];
            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });
                if (Date.now() < end) {
                    animationFrameId = requestAnimationFrame(frame);
                }
            };
            frame();
        }
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [prizes]);

    const closeAll = () => {
        setPrizes(null);
        setChest(null);
    };

    return (
        <ScannerContext.Provider value={{ handleScan }}>
            {children}

            <AnimatePresence>
                {/* 1. SCAN OVERLAY */}
                {scanMode && (
                    <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center text-white">
                        <div className="w-64 h-64 border-2 border-white/20 rounded-3xl relative overflow-hidden mb-8">
                            <motion.div
                                animate={{ top: ["0%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_20px_red]"
                            />
                        </div>
                        <p className="font-bold animate-pulse">Сканируем...</p>
                    </div>
                )}

                {/* 2. CHEST OVERLAY */}
                {chest && !prizes && (
                    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-6" onClick={openChest}>
                        <motion.button
                            animate={{ scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-64 h-64 filter drop-shadow-[0_0_30px_rgba(255,215,0,0.5)] flex items-center justify-center p-4"
                        >
                            <img src={boxImage} alt="Gift Box" className="w-full h-full object-contain" />
                        </motion.button>
                        <p className="absolute bottom-20 text-white/50 animate-pulse text-sm font-bold">Нажми чтобы открыть</p>
                    </div>
                )}

                {/* 3. PRIZE OVERLAY */}
                {prizes && (
                    <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-8 text-center">
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 mb-8">УРА!</h2>
                        <div className="w-64 h-64 rounded-[40px] bg-slate-100 shadow-2xl overflow-hidden mb-8 relative flex items-center justify-center">
                            <img src={prizes.image_url || (prizes.character && prizes.character.image_2d)} alt={prizes.title} className="w-full h-full object-contain p-4" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800">{prizes.title || (prizes.character && prizes.character.name)}</h3>
                        <p className="text-gray-500 font-medium mb-8 uppercase tracking-widest text-xs">
                            {prizes.prize_type === 'CHARACTER' ? prizes.character.rarity : prizes.prize_type}
                        </p>
                        <button onClick={closeAll} className="w-full max-w-sm bg-black text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform">
                            {prizes.prize_type === 'CHARACTER' ? 'В Коллекцию' : 'Отлично!'}
                        </button>
                    </div>
                )}
            </AnimatePresence>
        </ScannerContext.Provider>
    );
};
