import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCamera, IconCheck, IconX } from '../../../components/GameIcons';

const ScanReceiptModal = ({ isOpen, onClose, onScanComplete }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        // Simulate API call / scanning delay
        setTimeout(() => {
            setIsScanning(false);
            setScanSuccess(true);
            setTimeout(() => {
                onScanComplete();
                setScanSuccess(false); // Reset for next time
                onClose();
            }, 1000);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
                    >
                        <IconX className="w-5 h-5" />
                    </button>

                    <div className="p-8 flex flex-col items-center text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Сканировать чек</h2>
                        <p className="text-slate-500 mb-8">
                            Наведите камеру на QR-код чека из Shu Bakery, чтобы восстановить энергию.
                        </p>

                        <div className="w-64 h-64 bg-slate-900 rounded-2xl mb-8 relative overflow-hidden ring-4 ring-slate-100">
                            {/* Camera Viewfinder UI */}
                            <div className="absolute inset-0 border-[3px] border-white/30 m-4 rounded-xl flex items-center justify-center">
                                {isScanning && (
                                    <motion.div
                                        animate={{ height: ["0%", "100%", "0%"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-full bg-green-500/50 h-1 absolute top-0 blur-sm"
                                    />
                                )}
                                {!isScanning && !scanSuccess && (
                                    <IconCamera className="w-12 h-12 text-white/50" />
                                )}
                                {scanSuccess && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-green-500 rounded-full p-4 text-white"
                                    >
                                        <IconCheck className="w-10 h-10" />
                                    </motion.div>
                                )}
                            </div>

                            {/* Background placeholder for camera */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 -z-10"></div>
                        </div>

                        {!isScanning && !scanSuccess && (
                            <button
                                onClick={handleScan}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 transition-all active:scale-95"
                            >
                                Сканировать
                            </button>
                        )}

                        {isScanning && (
                            <div className="text-purple-600 font-medium animate-pulse">
                                Обработка...
                            </div>
                        )}

                        {scanSuccess && (
                            <div className="text-green-600 font-bold">
                                Чек принят! +10 Энергии
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default ScanReceiptModal;
