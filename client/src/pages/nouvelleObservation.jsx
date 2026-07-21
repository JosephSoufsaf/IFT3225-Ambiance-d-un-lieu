import { useState, useEffect } from 'react';
import { getLocations, submitObservation } from '../api/client';
import './connection.css';

const PROXIMITY_OPTIONS = ['proche', 'moyen', 'loin'];
const VIBE_OPTIONS = ['Très Calme', 'Calme', 'Modéré', 'Bruyant'];

export default function NouvelleObservation() {
    const [locations, setLocations] = useState([]);
    const [location, setLocation] = useState('');
    const [proximity, setProximity] = useState(PROXIMITY_OPTIONS[0]);
    const [vibe, setVibe] = useState(VIBE_OPTIONS[0]);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function fetchLocations() {
            try {
                const res = await getLocations();
                setLocations(res.data);
                if (res.data.length > 0) {
                    setLocation(res.data[0].name);
                }
            } catch (err) {
                setError(err.message);
            }
        }
        fetchLocations();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        try {
            await submitObservation({ location, proximity, vibe, notes });
            setSuccess(true);
            setNotes('');
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="auth-page">
            <form onSubmit={handleSubmit} className="auth-form">
                <h1>Nouvelle observation</h1>

                <label className="w-full text-left text-sm text-gray-600">
                    Lieu
                    <select className="auth-input" value={location} onChange={(e) => setLocation(e.target.value)}>
                        {locations.map((loc) => (
                            <option key={loc._id} value={loc.name}>{loc.name}</option>
                        ))}
                    </select>
                </label>

                <label className="w-full text-left text-sm text-gray-600">
                    Proximité
                    <select className="auth-input" value={proximity} onChange={(e) => setProximity(e.target.value)}>
                        {PROXIMITY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </label>

                <label className="w-full text-left text-sm text-gray-600">
                    Vibe ressentie
                    <select className="auth-input" value={vibe} onChange={(e) => setVibe(e.target.value)}>
                        {VIBE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </label>

                <label className="w-full text-left text-sm text-gray-600">
                    Notes (optionnel)
                    <textarea className="auth-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ajoute un commentaire..." />
                </label>

                <button type="submit" className="auth-submit">Soumettre</button>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-message">Observation soumise avec succès !</p>}
            </form>
        </div>
    );
}