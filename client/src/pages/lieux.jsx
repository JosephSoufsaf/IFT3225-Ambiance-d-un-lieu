import { useState, useEffect } from 'react';
import { getLocations, getLocationByName } from '../api/client';
import './lieux.css';

export default function Lieux() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        async function fetchLocations() {
            try {
                const res = await getLocations();
                setLocations(res.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchLocations();
    }, []);

    async function handleSelect(name) {
        if (selected?.name === name) {
            setSelected(null);
            return;
        }

        setError(null);
        try {
            const res = await getLocationByName(name);
            setSelected(res.data);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="lieux-page">
            <div className="lieux-content">
                <h1 className="lieux-title">Lieux enregistrés</h1>

                {loading && <p className="lieux-message">Chargement des lieux...</p>}
                {error && <p className="lieux-error">{error}</p>}
                {!loading && !error && locations.length === 0 && (
                    <p className="lieux-message">Aucun lieu enregistré pour le moment.</p>
                )}

                <div className="lieux-list">
                    {locations.map((location) => (
                        <button
                            key={location._id}
                            onClick={() => handleSelect(location.name)}
                            className={`lieu-btn ${selected?.name === location.name ? 'lieu-btn-active' : ''}`}
                        >
                            {location.name}
                        </button>
                    ))}
                </div>

                {selected && (
                    <div className="lieu-card">
                        <h2 className="lieu-card-title">{selected.name}</h2>
                        <p className="lieu-card-detail">Latitude : {selected.latitude}</p>
                        <p className="lieu-card-detail">Longitude : {selected.longitude}</p>
                    </div>
                )}
            </div>
        </div>
    );
}