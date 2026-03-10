/**
 * Safe localStorage wrapper to prevent crashes in restricted environments
 */
export const storage = {
    get: (key, defaultValue = null) => {
        try {
            const val = localStorage.getItem(key);
            return val !== null ? val : defaultValue;
        } catch (e) {
            console.warn(`LocalStorage.get("${key}") failed:`, e);
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn(`LocalStorage.set("${key}") failed:`, e);
            return false;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn(`LocalStorage.remove("${key}") failed:`, e);
            return false;
        }
    }
};
