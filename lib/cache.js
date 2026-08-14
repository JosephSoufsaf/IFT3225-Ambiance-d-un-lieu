const store = new Map();

export function get(key) {
    const entry = store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }

    return entry.value;
}

export function set(key, value, lifespan) {
    store.set(key, {
        value,
        expiresAt: Date.now() + lifespan,
    });
}

export function invalidate(key) {
    store.delete(key);
}