import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTypewriter Hook
 * @param {string} text - The full text to type out
 * @param {number} speed - Typing speed in ms (default 40)
 * @param {boolean} active - Whether the typewriter is active
 */
export const useTypewriter = (text, speed = 40, active = false) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isFinished, setIsFinished] = useState(false);
    const intervalRef = useRef(null);
    const audioCtxRef = useRef(null);

    const playTypeSound = useCallback(() => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
            
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) {
            // Audio context might fail in some browsers without user interaction
        }
    }, []);

    const reset = useCallback(() => {
        setDisplayedText("");
        setIsFinished(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        if (!active || !text) {
            reset();
            return;
        }

        let i = 0;
        setDisplayedText("");
        setIsFinished(false);
        
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        intervalRef.current = setInterval(() => {
            if (i < text.length) {
                const nextI = i + 1;
                setDisplayedText(text.slice(0, nextI));
                playTypeSound();
                i++;
            } else {
                setIsFinished(true);
                clearInterval(intervalRef.current);
            }
        }, speed);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [text, speed, active, playTypeSound, reset]);

    const skip = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayedText(text);
        setIsFinished(true);
    }, [text]);

    return { displayedText, isFinished, skip, reset };
};
