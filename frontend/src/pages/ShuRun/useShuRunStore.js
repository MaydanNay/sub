import { create } from 'zustand';
import { generateArtPath } from './artShapes';

// Helper for safe localStorage parsing
const safeParse = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.warn(`Error parsing localStorage key "${key}":`, e);
        return fallback;
    }
};

const API_BASE = '/api/v1'; // Base for backend API


const useShuRunStore = create((set, get) => ({
    // Current run state (persisted)
    isRunning: localStorage.getItem('shurun_isRunning') === 'true',
    currentKm: parseFloat(localStorage.getItem('shurun_currentKm')) || 0,
    startTime: parseInt(localStorage.getItem('shurun_startTime')) || null,
    elapsedSeconds: 0,
    selectedMarathon: safeParse('shurun_selectedMarathon', null),

    // Core engine state
    intervalRef: null,
    watchId: null,      // Geolocation watcher ID
    path: safeParse('shurun_currentPath', []),          // Real GPS path: [[lat, lng], ...]
    isGpsReady: false,  // For warm-up logic
    gpsError: null,     // Error state for UI
    capturedZones: safeParse('shurun_sessionZones', []),  // [{ id: 'lat,lng', lat, lng }]
    selectedArtId: null, // Will be hydranted below
    artPath: safeParse('shurun_artPath', []),        // Absolute coordinates of the art shape
    artAccuracy: parseFloat(localStorage.getItem('shurun_artAccuracy')) || 100,    // % accuracy based on proximity to artPath

    // Persistence across sessions
    allCapturedZones: safeParse('shurun_territory', []),
    user: safeParse('shurun_user', {
        phone: null,
        nickname: null,
        isAuthenticated: false
    }),
    unlockedAchievementIds: safeParse('shurun_achievements', []),

    feed: [
        {
            id: 'mock-1',
            nickname: 'Алибек',
            type: 'marathon',
            title: 'Ночной Алматы',
            km: 5.2,
            seconds: 1440,
            date: '10.03.2026',
            reactions: 12,
            hasReacted: false
        },
        {
            id: 'mock-2',
            nickname: 'Мадина',
            type: 'art',
            title: 'Сердце',
            km: 2.5,
            seconds: 900,
            date: '09.03.2026',
            artAccuracy: 92,
            reactions: 24,
            hasReacted: true
        }
    ],

    finishedRuns: safeParse('shurun_runs', []), // { marathonId, km, seconds, date, rewardClaimed: boolean }
    orders: safeParse('shurun_orders', []), // { id, marathonId, date, status, addressInfo }

    // Authenticate user
    authenticate: (userData) => {
        const newUser = { ...userData, isAuthenticated: true };
        localStorage.setItem('shurun_user', JSON.stringify(newUser));
        set({ user: newUser });
        get().fetchInitialData();
    },


    logout: () => {
        get().resetRun(); // Safety first: clear active run if logging out
        localStorage.removeItem('shurun_user');
        set({ user: { phone: null, nickname: null, isAuthenticated: false }, finishedRuns: [], orders: [] });
    },

    fetchInitialData: async () => {
        const { user } = get();
        if (!user.isAuthenticated || !user.phone) return;

        try {
            const [runsRes, ordersRes] = await Promise.all([
                fetch(`${API_BASE}/shurun/runs?user_phone=${user.phone}`),
                fetch(`${API_BASE}/shurun/orders?user_phone=${user.phone}`)
            ]);

            if (runsRes.ok && ordersRes.ok) {
                const runs = await runsRes.json();
                const orders = await ordersRes.json();
                set({ finishedRuns: runs, orders: orders });
                localStorage.setItem('shurun_runs', JSON.stringify(runs));
                localStorage.setItem('shurun_orders', JSON.stringify(orders));
            }
        } catch (e) {
            console.error("Failed to fetch initial ShuRun data:", e);
        }
    },


    // Select marathon to run
    selectMarathon: (marathon) => {
        localStorage.setItem('shurun_selectedMarathon', JSON.stringify(marathon));
        set({
            selectedMarathon: marathon,
            selectedArtId: marathon?.type === 'art' ? marathon.id : null
        });
    },

    // Start the real GPS run
    startRun: () => {
        if (get().isRunning && get().startTime) {
            // Resume logic: just restart intervals if already "running" in state
            get().initIntervals();
            return;
        }

        const now = Date.now();
        localStorage.setItem('shurun_isRunning', 'true');
        localStorage.setItem('shurun_startTime', now.toString());
        localStorage.setItem('shurun_currentKm', '0');
        localStorage.setItem('shurun_currentPath', '[]');
        localStorage.setItem('shurun_sessionZones', '[]');
        localStorage.setItem('shurun_artAccuracy', '100');

        set({
            path: [],
            currentKm: 0,
            startTime: now,
            elapsedSeconds: 0,
            isRunning: true,
            isGpsReady: false,
            gpsError: null,
            capturedZones: [], // Current session zones
            artPath: [],
            artAccuracy: 100
        });

        get().initIntervals();
    },

    initIntervals: () => {
        const { intervalRef, watchId } = get();
        if (intervalRef) clearInterval(intervalRef);
        if (watchId) navigator.geolocation.clearWatch(watchId);

        const newInterval = setInterval(() => {
            const { startTime } = get();
            if (startTime) {
                set({ elapsedSeconds: Math.floor((Date.now() - startTime) / 1000) });
            }
        }, 1000);

        if (!navigator.geolocation) {
            console.error("GPS not supported");
            set({ gpsError: "GPS не поддерживается вашим браузером" });
            return;
        }

        const newWatchId = navigator.geolocation.watchPosition(
            (position) => {
                if (!get().isRunning) return; // Ghost update protection

                const { latitude, longitude, accuracy } = position.coords;
                const newPoint = [latitude, longitude];
                const currentPath = get().path;

                set({ isGpsReady: true });

                if (currentPath.length > 0) {
                    const lastPoint = currentPath[currentPath.length - 1];
                    const distPace = calculateDistance(
                        lastPoint[0], lastPoint[1],
                        latitude, longitude
                    );

                    // Filters: accuracy must be decent, and point must be at least 2m away to avoid jitter
                    if (accuracy < 30 && distPace > 0.002) {
                        const gridLat = Math.floor(latitude / GRID_SIZE) * GRID_SIZE;
                        const gridLng = Math.floor(longitude / GRID_SIZE) * GRID_SIZE;
                        const zoneId = `${gridLat.toFixed(5)},${gridLng.toFixed(5)}`;

                        set((state) => {
                            const newCapturedZones = [...state.capturedZones];
                            const newAllZones = [...state.allCapturedZones];
                            const newPath = [...state.path, newPoint];
                            const newKm = parseFloat((state.currentKm + distPace).toFixed(4));

                            if (!newCapturedZones.find(z => z.id === zoneId)) {
                                newCapturedZones.push({ id: zoneId, lat: gridLat, lng: gridLng });
                            }

                            if (!newAllZones.find(z => z.id === zoneId)) {
                                newAllZones.push({ id: zoneId, lat: gridLat, lng: gridLng });
                                localStorage.setItem('shurun_territory', JSON.stringify(newAllZones));
                            }

                            // Calculate Accuracy if doing Art
                            let newAccuracy = state.artAccuracy;
                            if (state.artPath.length > 1) {
                                const distToArt = minDistanceToPath(latitude, longitude, state.artPath);
                                // If further than 20m (0.02km), accuracy drops faster
                                const penalty = Math.max(0, (distToArt - 0.02) * 20);
                                newAccuracy = Math.max(1, Math.min(100, state.artAccuracy - penalty));
                            }

                            // Persistent storage updates during run - with safety check for size
                            try {
                                if (newPath.length < 3000) { // Limit path persistence to avoid LS overflow (~60KB)
                                    localStorage.setItem('shurun_currentPath', JSON.stringify(newPath));
                                }
                                localStorage.setItem('shurun_currentKm', newKm.toString());
                                localStorage.setItem('shurun_sessionZones', JSON.stringify(newCapturedZones));
                                localStorage.setItem('shurun_artAccuracy', newAccuracy.toString());
                            } catch (e) {
                                console.warn("LocalStorage partially full, path persistence might be limited", e);
                            }

                            return {
                                currentKm: newKm,
                                path: newPath,
                                capturedZones: newCapturedZones,
                                allCapturedZones: newAllZones,
                                artAccuracy: newAccuracy
                            };
                        });
                    }
                } else {
                    const gridLat = Math.floor(latitude / GRID_SIZE) * GRID_SIZE;
                    const gridLng = Math.floor(longitude / GRID_SIZE) * GRID_SIZE;
                    const zoneId = `${gridLat.toFixed(5)},${gridLng.toFixed(5)}`;

                    const artId = get().selectedArtId;
                    const artPath = artId ? generateArtPath(latitude, longitude, artId) : [];

                    const initialZones = [{ id: zoneId, lat: gridLat, lng: gridLng }];
                    localStorage.setItem('shurun_currentPath', JSON.stringify([newPoint]));
                    localStorage.setItem('shurun_sessionZones', JSON.stringify(initialZones));
                    if (artPath.length > 0) localStorage.setItem('shurun_artPath', JSON.stringify(artPath));

                    set({
                        path: [newPoint],
                        capturedZones: initialZones,
                        artPath: artPath
                    });
                }
            },
            (error) => {
                console.error("GPS Error:", error);
                set({ gpsError: error.message });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        set({ intervalRef: newInterval, watchId: newWatchId });
    },

    stopRun: () => {
        const { intervalRef, watchId, currentKm, elapsedSeconds, selectedMarathon, path, capturedZones, artAccuracy, user, feed, finishedRuns } = get();

        if (intervalRef) clearInterval(intervalRef);
        if (watchId) navigator.geolocation.clearWatch(watchId);

        // Clear persistence
        localStorage.removeItem('shurun_isRunning');
        localStorage.removeItem('shurun_startTime');
        localStorage.removeItem('shurun_currentKm');
        localStorage.removeItem('shurun_currentPath');
        localStorage.removeItem('shurun_sessionZones');
        localStorage.removeItem('shurun_artPath');
        localStorage.removeItem('shurun_artAccuracy');
        localStorage.removeItem('shurun_selectedMarathon');

        const run = {
            id: `run_${Date.now()}`,
            marathonId: selectedMarathon?.id || 'free',
            km: parseFloat(currentKm.toFixed(2)),
            seconds: elapsedSeconds,
            date: new Date().toLocaleDateString('ru-RU'),
            path: path,
            capturedZonesCount: capturedZones.length,
            artAccuracy: selectedMarathon?.type === 'art' ? Math.round(artAccuracy) : null,
            pace: elapsedSeconds > 0 && currentKm > 0
                ? formatPace(elapsedSeconds / currentKm)
                : '—',
        };

        const newFeedItem = {
            id: `feed_${run.id}`,
            nickname: user.nickname || 'Бегун',
            type: selectedMarathon?.type || 'marathon',
            title: selectedMarathon?.title || 'Свободный забег',
            km: run.km,
            seconds: run.seconds,
            date: run.date,
            artAccuracy: run.artAccuracy,
            reactions: 0,
            hasReacted: false
        };

        const updatedRuns = [run, ...finishedRuns];
        localStorage.setItem('shurun_runs', JSON.stringify(updatedRuns));

        set({
            isRunning: false,
            intervalRef: null,
            watchId: null,
            finishedRuns: updatedRuns,
            feed: [newFeedItem, ...feed],
            startTime: null,
            elapsedSeconds: 0
        });

        get().checkAchievements(run);

        // Sync to backend
        if (user.isAuthenticated && user.phone) {
            fetch(`${API_BASE}/shurun/runs?user_phone=${user.phone}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: run.id,
                    marathon_id: run.marathonId,
                    km: run.km,
                    seconds: run.seconds,
                    date: run.date,
                    pace: run.pace,
                    art_accuracy: run.artAccuracy,
                    reward_claimed: false,
                    path: run.path,
                    captured_zones_count: run.capturedZonesCount
                })
            }).catch(e => console.error("Failed to sync run to backend:", e));
        }

        return run;
    },


    checkAchievements: (latestRun) => {
        const { finishedRuns, allCapturedZones, unlockedAchievementIds } = get();
        const totalKm = finishedRuns.reduce((acc, r) => acc + r.km, 0);
        const newUnlocks = [];

        if (!unlockedAchievementIds.includes('first_run')) {
            newUnlocks.push('first_run');
        }
        if (!unlockedAchievementIds.includes('km10') && totalKm >= 10) {
            newUnlocks.push('km10');
        }
        if (!unlockedAchievementIds.includes('marathon') && latestRun.marathonId !== 'free') {
            newUnlocks.push('marathon');
        }
        if (!unlockedAchievementIds.includes('territory') && allCapturedZones.length >= 5) {
            newUnlocks.push('territory');
        }
        if (!unlockedAchievementIds.includes('gps_art') && latestRun.artAccuracy > 80) {
            newUnlocks.push('gps_art');
        }
        if (!unlockedAchievementIds.includes('fast_5k') && latestRun.km >= 5 && latestRun.seconds <= 1500) {
            newUnlocks.push('fast_5k');
        }

        if (newUnlocks.length > 0) {
            const updated = [...new Set([...unlockedAchievementIds, ...newUnlocks])];
            set({ unlockedAchievementIds: updated });
            localStorage.setItem('shurun_achievements', JSON.stringify(updated));
        }
    },

    reactToRun: (runId) => {
        set(state => ({
            feed: state.feed.map(item => {
                if (item.id === runId) {
                    return {
                        ...item,
                        reactions: item.hasReacted ? item.reactions - 1 : item.reactions + 1,
                        hasReacted: !item.hasReacted
                    };
                }
                return item;
            })
        }));
    },

    placeOrder: (orderData) => {
        const { orders, finishedRuns, selectedMarathon } = get();
        const newOrder = {
            id: `ord_${Date.now()}`,
            marathonId: selectedMarathon?.id || orderData.marathonId,
            marathonTitle: selectedMarathon?.title || 'Марафон',
            date: new Date().toLocaleDateString(),
            status: 'pending',
            ...orderData
        };

        const updatedOrders = [newOrder, ...orders];
        localStorage.setItem('shurun_orders', JSON.stringify(updatedOrders));

        const updatedRuns = finishedRuns.map(run => {
            if (run.marathonId === orderData.marathonId && !run.rewardClaimed) {
                return { ...run, rewardClaimed: true };
            }
            return run;
        });

        localStorage.setItem('shurun_runs', JSON.stringify(updatedRuns));
        set({ orders: updatedOrders, finishedRuns: updatedRuns });

        // Sync to backend
        const { user } = get();
        if (user.isAuthenticated && user.phone) {
            fetch(`${API_BASE}/shurun/orders?user_phone=${user.phone}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: newOrder.id,
                    marathon_id: newOrder.marathonId,
                    marathon_title: newOrder.marathonTitle,
                    date: newOrder.date,
                    status: newOrder.status,
                    address: newOrder.address,
                    city: newOrder.city,
                    postal_code: newOrder.postalCode,
                    phone: newOrder.phone
                })
            }).catch(e => console.error("Failed to sync order to backend:", e));
        }
    },


    resetRun: () => {
        const { intervalRef, watchId } = get();
        if (intervalRef) clearInterval(intervalRef);
        if (watchId) navigator.geolocation.clearWatch(watchId);

        localStorage.removeItem('shurun_isRunning');
        localStorage.removeItem('shurun_startTime');
        localStorage.removeItem('shurun_currentKm');
        localStorage.removeItem('shurun_currentPath');
        localStorage.removeItem('shurun_sessionZones');
        localStorage.removeItem('shurun_artPath');
        localStorage.removeItem('shurun_artAccuracy');
        localStorage.removeItem('shurun_selectedMarathon');

        set({
            isRunning: false,
            currentKm: 0,
            elapsedSeconds: 0,
            startTime: null,
            intervalRef: null,
            watchId: null,
            path: [],
            isGpsReady: false,
            capturedZones: [],
            artPath: [],
            artAccuracy: 100,
            selectedMarathon: null,
            selectedArtId: null
        });
    },
}));

// Hydrate selectedArtId correctly from restored state
const initialMarathon = useShuRunStore.getState().selectedMarathon;
if (initialMarathon?.type === 'art') {
    useShuRunStore.setState({ selectedArtId: initialMarathon.id });
}


// Bootstrap sync on load
if (useShuRunStore.getState().user.isAuthenticated) {
    useShuRunStore.getState().fetchInitialData();
}


function minDistanceToPath(lat, lng, path) {
    if (path.length < 2) return 0;

    let minDist = Infinity;
    // Check distance to each segment
    for (let i = 0; i < path.length - 1; i++) {
        const d = distToSegment(
            [lat, lng],
            path[i],
            path[i + 1]
        );
        if (d < minDist) minDist = d;
    }
    return minDist;
}

// Distance from point p to line segment v-w in KM
function distToSegment(p, v, w) {
    const l2 = calculateDistance(v[0], v[1], w[0], w[1]) ** 2;
    if (l2 === 0) return calculateDistance(p[0], p[1], v[0], v[1]);

    // Fraction of segment projection
    let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));

    return calculateDistance(
        p[0], p[1],
        v[0] + t * (w[0] - v[0]),
        v[1] + t * (w[1] - v[1])
    );
}

export const GRID_SIZE = 0.0022;

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function formatPace(secPerKm) {
    const mins = Math.floor(secPerKm / 60);
    const secs = Math.floor(secPerKm % 60);
    return `${mins}:${String(secs).padStart(2, '0')}/км`;
}

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
