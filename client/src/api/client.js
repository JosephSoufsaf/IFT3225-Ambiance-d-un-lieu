import * as cache from './cacheFrontend.js';

const cacheTimer = 45 * 1000;

export async function registerUser({ email, username, password }) {
    const res = await fetch(`api/register`, {
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
    const res = await fetch(`api/login`, {
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


export async function getLocations() {
    const res = await fetch(`api/locations`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des lieux');
    }
    return data;
}

export async function getLocationByName(name) {
    const res = await fetch(`api/locations/${encodeURIComponent(name)}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Ce lieu est introuvable');
    }
    return data;
}

export async function addFavoriteLocation(name, token) {
    if (!token) {
        throw new Error("Utilisateur n'est pas connecté");
    }

    const res = await fetch('api/userLocations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            locationName: name,
            locationCategory: 'favorite'
        })
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de l'ajout aux favoris");
    }
}

export async function removeFavoriteLocation(name, token) {
    if (!token) {
        throw new Error("Utilisateur n'est pas connecté");
    }
    const res = await fetch('api/userLocations', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            locationName: name,
            locationCategory: 'favorite'
        })
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors du retrait des favoris");
    }
}

export async function logout(token) {
    const res = await fetch('api/logout', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!res.ok) {
        console.log('Erreur lors de la déconnexion côté serveur');
    }
}


export async function getQuietHours(location) {
    const res = await fetch(`api/ambiance/${encodeURIComponent(location)}/quiet-hours`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des créneaux calmes');
    }
    return data;
}


export async function getHistory(location, last = '3h') {
    const res = await fetch(`api/ambiance/${encodeURIComponent(location)}/history?last=${last}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Erreur lors du chargement de l'historique");
    }
    return data;
}


export async function getPortrait(location) {
    const cacheKey = `portrait:${location}`;

    const cached = cache.get(cacheKey);
    if (cached) {
        return cached;
    }

    const res = await fetch(`api/ambiance/${encodeURIComponent(location)}/portrait`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du chargement du portrait');
    }

    cache.set(cacheKey, data, cacheTimer);
    return data;
}

export async function getFavoriteLocations(token) {
    if (!token) {
        throw new Error("Utilisateur n'est pas connecté");
    }

    const res = await fetch(`api/userLocations?locationCategory=favorite`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des favoris');
    }
    return data;
}

export async function submitObservation({ location, proximity, vibe, notes }, token) {
    if (!token) {
        throw new Error("Utilisateur n'est pas connecté");
    }

    const res = await fetch(`api/observations`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            location,
            proximity,
            vibe,
            notes,
            timestamp: new Date().toISOString()
        })
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la soumission de l'observation");
    }

    cache.invalidate(`portrait:${location}`);
    return data;
}


export async function getObservedLocations(token) {
    if (!token) {
        throw new Error("Utilisateur n'est pas connecté");
    }

    const res = await fetch(`api/userLocations?locationCategory=observed`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des lieux observés');
    }
    return data;
}

export async function addNewLocation(locationObject, token) {
    if (!token) {
        throw new Error("Utilisateur n'est pas connecté");
    }
    const res = await fetch('api/locations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(locationObject)
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'ajout d'une nouvelle localisation");
    }
    return data;
}