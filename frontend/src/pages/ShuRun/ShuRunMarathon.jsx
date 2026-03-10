import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Circle, Rectangle, useMap } from 'react-leaflet';
import { Play, Square, ChevronLeft, Trophy, Flag, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import useShuRunStore, { formatTime, GRID_SIZE } from './useShuRunStore';

// Runner dot that follows the latest REAL path point
function RunnerMarker({ path }) {
    const map = useMap();
    const lastPoint = path[path.length - 1];

    useEffect(() => {
        if (lastPoint) {
            map.panTo(lastPoint, { animate: true, duration: 0.5 });
        }
    }, [lastPoint]);

    if (!lastPoint) return null;

    return (
        <Circle
            center={lastPoint}
            radius={10}
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.9, weight: 2 }}
        />
    );
}

const FinishScreen = ({ run, marathon, onClose, navigate }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md font-montserrat"
    >
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 w-full max-w-sm text-center shadow-[0_0_60px_rgba(16,185,129,0.2)]">
            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.8 }}
                className="text-7xl mb-4"
            >
                🏅
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-1 font-montserrat">Финиш!</h2>
            <p className="text-emerald-400 font-bold text-sm mb-6">
                {marathon ? marathon.title : 'Свободный бег'} завершён
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: 'Дистанция', value: `${run.km} км`, icon: '📍' },
                    { label: 'Время', value: formatTime(run.seconds), icon: '⏱️' },
                    { label: 'Темп', value: run.pace, icon: '⚡' },
                ].map((s, i) => (
                    <div key={i} className="bg-slate-800 rounded-2xl p-3">
                        <div className="text-xl mb-1">{s.icon}</div>
                        <div className="text-white font-bold text-xs leading-tight">{s.value}</div>
                        <div className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {marathon && run.km >= marathon.distance && (
                <div className="space-y-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-3">
                        <Flag className="w-5 h-5 text-emerald-400 shrink-0" />
                        <p className="text-emerald-300 text-xs font-bold text-left leading-tight">
                            {marathon.type === 'art' && run.artAccuracy > 80
                                ? `Шедевр! Точность ${run.artAccuracy}%. Медаль художника твоя!`
                                : 'Марафон выполнен! Теперь ты можешь заказать физическую медаль.'
                            }
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(`/game/shurun/delivery?marathonId=${marathon.id}`)}
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                    >
                        Заказать медаль 🎖️
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full bg-slate-800 text-slate-400 font-bold py-3 rounded-2xl text-xs"
                    >
                        Позже, в рейтинг
                    </button>
                </div>
            )}

            {(!marathon || run.km < marathon.distance) && (
                <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg"
                >
                    В рейтинг
                </button>
            )}
        </div>
    </motion.div>
);
const ALMATY_CENTER = [43.238946, 76.889709];

export default function ShuRunMarathon() {
    const navigate = useNavigate();
    const {
        isRunning, currentKm, elapsedSeconds, path, isGpsReady, gpsError,
        capturedZones, artPath, artAccuracy, startRun, stopRun, resetRun, selectedMarathon
    } = useShuRunStore();

    const [finished, setFinished] = useState(false);
    const [finishData, setFinishData] = useState(null);
    const [lastZoneCount, setLastZoneCount] = useState(0);
    const [showZoneToast, setShowZoneToast] = useState(false);
    const marathon = selectedMarathon;
    const targetKm = marathon?.distance ?? 5;
    const progress = Math.min(currentKm / targetKm, 1);

    // Auto-finish and Resumption logic
    useEffect(() => {
        // If we are already running (e.g. page refresh), re-init intervals
        if (isRunning) {
            startRun();
        }

        if (isRunning && currentKm >= targetKm) {
            const run = stopRun();
            setFinishData(run);
            setFinished(true);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#10b981', '#f59e0b', '#3b82f6'] });
        }
    }, [currentKm, isRunning, startRun]);

    // Zone capture notification
    useEffect(() => {
        if (isRunning && capturedZones.length > lastZoneCount) {
            setShowZoneToast(true);
            setLastZoneCount(capturedZones.length);
            setTimeout(() => setShowZoneToast(false), 3000);

            // Optional: light haptic/sound effect could go here
        }
    }, [capturedZones.length, isRunning]);

    // Clean up only watchId on unmount to save battery, but keep interval if desired
    // Actually, it's better to keep intervals for notifications/sync, but clear it if needed.
    // For now, let's just make sure we don't STOP the run on unmount.
    useEffect(() => () => {
        // We do NOT stopRun() here because we want it to persist across navigation.
        // But we might want to clearWatch to save battery when not viewing map.
        // For simplicity in this demo, we'll keep it running.
    }, []);

    const handleStart = () => {
        resetRun();
        startRun();
    };

    const handleStop = () => {
        const run = stopRun();
        setFinishData(run);
        setFinished(true);
    };

    const handleFinishClose = () => {
        setFinished(false);
        resetRun();
        navigate('/game/shurun/board');
    };

    const currentPath = path;

    return (
        <div className="h-screen w-full flex flex-col bg-slate-950 font-montserrat overflow-hidden relative">

            {/* Map */}
            <div className="flex-1 relative">
                <MapContainer
                    center={ALMATY_CENTER}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution="&copy; OpenStreetMap"
                    />
                    {/* GPS Art Template (Ghost Line) */}
                    {artPath.length > 1 && (
                        <Polyline
                            positions={artPath}
                            pathOptions={{ color: '#white', opacity: 0.3, weight: 6, dashArray: '10 10' }}
                        />
                    )}

                    {/* Real Path visualization */}
                    {path.length > 1 && (
                        <Polyline
                            positions={path}
                            pathOptions={{ color: '#10b981', opacity: 0.9, weight: 5, smoothFactor: 1.5 }}
                        />
                    )}

                    {/* Captured Territory Zones */}
                    {capturedZones.map((zone) => (
                        <Rectangle
                            key={zone.id}
                            bounds={[
                                [zone.lat, zone.lng],
                                [zone.lat + GRID_SIZE, zone.lng + GRID_SIZE]
                            ]}
                            pathOptions={{
                                color: '#10b981',
                                fillColor: '#10b981',
                                fillOpacity: 0.3,
                                weight: 1,
                                dashArray: '4'
                            }}
                        />
                    ))}

                    {path.length > 0 && <RunnerMarker path={path} />}
                </MapContainer>

                {/* Back button */}
                <button
                    onClick={() => navigate('/game/shurun/home')}
                    className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md text-white p-2.5 rounded-full border border-white/10 shadow-lg"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Marathon badge */}
                {marathon && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-bold">{marathon.title}</span>
                    </div>
                )}

                {/* GPS Error Overlay */}
                {gpsError && (
                    <div className="absolute inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 text-center">
                        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl">
                            <div className="text-4xl mb-3">📡❌</div>
                            <h3 className="text-xl font-bold text-white mb-2 font-montserrat">Ошибка GPS</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                {gpsError === "User denied Geolocation"
                                    ? "Пожалуйста, разрешите доступ к геопозиции в настройках браузера."
                                    : gpsError}
                            </p>
                            <button
                                onClick={() => { resetRun(); startRun(); }}
                                className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl border border-white/10"
                            >
                                Попробовать снова
                            </button>
                        </div>
                    </div>
                )}

                {/* Zone Captured Toast */}
                <AnimatePresence>
                    {showZoneToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[500] bg-emerald-500 text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center gap-2 border border-white/20"
                        >
                            <Flag className="w-4 h-4" /> РАЙОН ЗАХВАЧЕН! +1
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* HUD panel */}
            <div className="bg-slate-950 border-t border-white/10 px-5 pt-5 pb-8 relative">

                {/* Distance progress arc */}
                <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                            <motion.circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke="#10b981" strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                animate={{ strokeDashoffset: `${2 * Math.PI * 42 * (1 - progress)}` }}
                                transition={{ duration: 0.5 }}
                                style={{ filter: 'drop-shadow(0 0 6px #10b981)' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white leading-none">{currentKm.toFixed(2)}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">/ {targetKm} км</span>
                            {!isGpsReady && isRunning && (
                                <span className="absolute -bottom-6 text-[8px] text-amber-400 animate-pulse font-bold uppercase">Поиск GPS...</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { icon: '⏱️', label: 'Время', value: formatTime(elapsedSeconds) },
                        { icon: '🚩', label: 'Районы', value: capturedZones.length },
                        {
                            icon: selectedMarathon?.type === 'art' ? '🎨' : '🎯',
                            label: selectedMarathon?.type === 'art' ? 'Точность' : 'Осталось',
                            value: selectedMarathon?.type === 'art' ? `${Math.round(artAccuracy)}%` : `${Math.max(0, targetKm - currentKm).toFixed(2)} км`
                        },
                    ].map((s, i) => (
                        <div key={i} className="bg-slate-900 border border-white/10 rounded-2xl p-3 text-center">
                            <div className="text-lg">{s.icon}</div>
                            <div className="text-white font-bold text-sm leading-tight">{s.value}</div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Control button */}
                {!isRunning ? (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStart}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xl py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                    >
                        <Play className="w-6 h-6" />
                        Старт
                    </motion.button>
                ) : (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStop}
                        className="w-full bg-rose-600 text-white font-bold text-xl py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg"
                    >
                        <Zap className="w-6 h-6 animate-pulse" />
                        Финиш
                        <Square className="w-5 h-5" />
                    </motion.button>
                )}
            </div>

            {/* Finish modal */}
            <AnimatePresence>
                {finished && finishData && (
                    <FinishScreen run={finishData} marathon={marathon} onClose={handleFinishClose} navigate={navigate} />
                )}
            </AnimatePresence>
        </div>
    );
}
