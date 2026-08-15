const store = new Map();

function get(key) {
    const entry = store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }

    return entry.value;
}

function set(key, value, lifespan) {
    store.set(key, {
        value,
        expiresAt: Date.now() + lifespan,
    });
}

function invalidate(key) {
    store.delete(key);
}

module.exports = { get, set, invalidate };