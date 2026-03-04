import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Circle, useMap } from 'react-leaflet';
import { Play, Square, ChevronLeft, Trophy, Flag, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import useShuRunStore, { formatTime } from './useShuRunStore';
import 'leaflet/dist/leaflet.css';

// Center map on Almaty
const ALMATY_CENTER = [43.2565, 76.9286];

// Fake route for visualization (Almaty area)
const MOCK_ROUTE = [
    [43.2565, 76.9286],
    [43.2580, 76.9310],
    [43.2600, 76.9340],
    [43.2620, 76.9370],
    [43.2640, 76.9350],
    [43.2660, 76.9320],
    [43.2650, 76.9290],
    [43.2630, 76.9260],
    [43.2610, 76.9240],
    [43.2590, 76.9260],
    [43.2570, 76.9280],
    [43.2565, 76.9286],
];

// Runner dot that follows partial route based on progress
function RunnerMarker({ progress }) {
    const map = useMap();
    const totalPoints = MOCK_ROUTE.length;
    const idx = Math.min(Math.floor(progress * (totalPoints - 1)), totalPoints - 2);
    const t = (progress * (totalPoints - 1)) - idx;
    const lat = MOCK_ROUTE[idx][0] + (MOCK_ROUTE[idx + 1][0] - MOCK_ROUTE[idx][0]) * t;
    const lng = MOCK_ROUTE[idx][1] + (MOCK_ROUTE[idx + 1][1] - MOCK_ROUTE[idx][1]) * t;
    useEffect(() => {
        if (progress > 0.1) map.panTo([lat, lng], { animate: true, duration: 0.5 });
    }, [lat, lng]);
    return (
        <Circle
            center={[lat, lng]}
            radius={25}
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.9, weight: 2 }}
        />
    );
}

const FinishScreen = ({ run, marathon, onClose }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 w-full max-w-sm text-center shadow-[0_0_60px_rgba(16,185,129,0.2)]">
            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.8 }}
                className="text-7xl mb-4"
            >
                🏅
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-1">Финиш!</h2>
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
                        <div className="text-white font-black text-xs leading-tight">{s.value}</div>
                        <div className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {marathon && run.km >= marathon.distance && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 mb-5 flex items-center gap-3">
                    <Flag className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-emerald-300 text-sm font-bold text-left leading-tight">
                        Марафон выполнен! Медаль будет отправлена по почте.
                    </p>
                </div>
            )}

            <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 rounded-2xl shadow-lg"
            >
                В рейтинг
            </button>
        </div>
    </motion.div>
);

export default function ShuRunMarathon() {
    const navigate = useNavigate();
    const {
        isRunning, currentKm, elapsedSeconds,
        startRun, stopRun, resetRun, selectedMarathon
    } = useShuRunStore();

    const [finished, setFinished] = useState(false);
    const [finishData, setFinishData] = useState(null);
    const marathon = selectedMarathon;
    const targetKm = marathon?.distance ?? 5;
    const progress = Math.min(currentKm / targetKm, 1);

    // Auto-finish when target reached
    useEffect(() => {
        if (isRunning && currentKm >= targetKm) {
            const run = stopRun();
            setFinishData(run);
            setFinished(true);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#10b981', '#f59e0b', '#3b82f6'] });
        }
    }, [currentKm, isRunning]);

    // Clean up on unmount
    useEffect(() => () => { if (isRunning) stopRun(); }, []);

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

    const currentSegment = MOCK_ROUTE.slice(0, Math.max(2, Math.ceil(progress * MOCK_ROUTE.length)));

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
                    {/* Full route (dim) */}
                    <Polyline positions={MOCK_ROUTE} pathOptions={{ color: '#10b981', opacity: 0.2, weight: 4, dashArray: '8 8' }} />
                    {/* Covered path */}
                    {isRunning || progress > 0 ? (
                        <Polyline
                            positions={currentSegment}
                            pathOptions={{ color: '#10b981', opacity: 0.9, weight: 5 }}
                        />
                    ) : null}
                    {isRunning && <RunnerMarker progress={progress} />}
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
                        <span className="text-xs font-black">{marathon.title}</span>
                    </div>
                )}
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
                            <span className="text-2xl font-black text-white leading-none">{currentKm.toFixed(2)}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">/ {targetKm} км</span>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { icon: '⏱️', label: 'Время', value: formatTime(elapsedSeconds) },
                        { icon: '⚡', label: 'Темп', value: isRunning && currentKm > 0.01 ? `${Math.floor(elapsedSeconds / currentKm / 60)}:${String(Math.floor((elapsedSeconds / currentKm) % 60)).padStart(2, '0')}` : '—' },
                        { icon: '🎯', label: 'Осталось', value: `${Math.max(0, targetKm - currentKm).toFixed(2)} км` },
                    ].map((s, i) => (
                        <div key={i} className="bg-slate-900 border border-white/10 rounded-2xl p-3 text-center">
                            <div className="text-lg">{s.icon}</div>
                            <div className="text-white font-black text-sm leading-tight">{s.value}</div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Control button */}
                {!isRunning ? (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStart}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                    >
                        <Play className="w-6 h-6" />
                        Старт
                    </motion.button>
                ) : (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStop}
                        className="w-full bg-rose-600 text-white font-black text-xl py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg"
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
                    <FinishScreen run={finishData} marathon={marathon} onClose={handleFinishClose} />
                )}
            </AnimatePresence>
        </div>
    );
}
