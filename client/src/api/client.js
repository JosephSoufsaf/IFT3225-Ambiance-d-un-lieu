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

export async function addFavoriteLocation(name) {

    console.log(name);
    const token = localStorage.getItem('loginToken');
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
    console.log(res);
}

export async function removeFavoriteLocation(name) {
    console.log('delete envoye');
    const token = localStorage.getItem('loginToken');
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
    console.log(res);
}

export async function logout(token) {
    const res = await fetch('api/logout', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    console.log(res);
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
    const res = await fetch(`api/ambiance/${encodeURIComponent(location)}/portrait`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du chargement du portrait');
    }
    return data;
}




