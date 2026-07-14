const API_URL = import.meta.env.VITE_API_URL;

export async function registerUser({ email, username, password }) {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
    }
    return data;
}

export async function loginUser({ email, password }) {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || data.message || 'Erreur lors de la connexion');
    }
    return data;
} 