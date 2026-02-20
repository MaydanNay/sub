import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import gameConfig from './game/config';

const ShalamGame = () => {
    const gameRef = useRef(null);

    useEffect(() => {
        if (gameRef.current) return;

        const config = {
            ...gameConfig,
            parent: 'phaser-game',
        };

        gameRef.current = new Phaser.Game(config);

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div className="w-full h-screen bg-neutral-900 flex justify-center items-center overflow-hidden relative">
            {/* Mobile Emulator Container */}
            <div className="relative w-full max-w-[480px] h-full max-h-[900px] bg-black shadow-2xl overflow-hidden border-x border-neutral-800">
                <div id="phaser-game" className="w-full h-full" />

                {/* UI Overlay */}
                <div className="absolute top-4 left-4 text-white z-10 pointer-events-none">
                    <h1 className="text-xl font-black italic drop-shadow-md text-red-500 uppercase tracking-tighter">Shalam: Агент 007</h1>
                    <p className="text-[8px] font-bold text-white/60 tracking-widest uppercase">Salam Cola x Aviata.kz</p>
                </div>
            </div>
        </div>
    );
};

export default ShalamGame;
