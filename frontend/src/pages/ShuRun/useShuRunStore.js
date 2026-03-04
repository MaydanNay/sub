import { create } from 'zustand';

const useShuRunStore = create((set, get) => ({
    // Current run state
    isRunning: false,
    currentKm: 0,
    elapsedSeconds: 0,
    selectedMarathon: null,
    intervalRef: null,
    finishedRuns: [], // { marathonId, km, seconds, date }

    // Select marathon to run
    selectMarathon: (marathon) => set({ selectedMarathon: marathon }),

    // Start the simulated run
    startRun: () => {
        if (get().isRunning) return;

        const intervalRef = setInterval(() => {
            set((state) => ({
                elapsedSeconds: state.elapsedSeconds + 1,
                // Simulate ~5 min/km pace: 1km per 300 seconds → +0.00333 km/sec
                currentKm: parseFloat((state.currentKm + 0.0033).toFixed(4)),
            }));
        }, 1000);

        set({ isRunning: true, intervalRef });
    },

    // Stop the run and record
    stopRun: () => {
        const { intervalRef, currentKm, elapsedSeconds, selectedMarathon } = get();
        if (intervalRef) clearInterval(intervalRef);

        const run = {
            marathonId: selectedMarathon?.id || 'free',
            km: parseFloat(currentKm.toFixed(2)),
            seconds: elapsedSeconds,
            date: new Date().toLocaleDateString('ru-RU'),
            pace: elapsedSeconds > 0 && currentKm > 0
                ? formatPace(elapsedSeconds / currentKm)
                : '—',
        };

        set((state) => ({
            isRunning: false,
            intervalRef: null,
            finishedRuns: [...state.finishedRuns, run],
        }));

        return run;
    },

    // Reset for a new run
    resetRun: () => {
        const { intervalRef } = get();
        if (intervalRef) clearInterval(intervalRef);
        set({
            isRunning: false,
            currentKm: 0,
            elapsedSeconds: 0,
            intervalRef: null,
        });
    },
}));

// Helper: seconds per km → "M:SS/км"
export function formatPace(secPerKm) {
    const mins = Math.floor(secPerKm / 60);
    const secs = Math.floor(secPerKm % 60);
    return `${mins}:${String(secs).padStart(2, '0')}/км`;
}

// Helper: total seconds → "H:MM:SS" or "MM:SS"
export function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default useShuRunStore;
