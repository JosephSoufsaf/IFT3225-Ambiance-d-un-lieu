import { useState, useEffect } from 'react';
import { getLocations, getLocationByName, addFavoriteLocation, getPortrait, getQuietHours, getHistory } from '../api/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './lieux.css';

export default function Lieux() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [portrait, setPortrait] = useState(null);
    const [quietHours, setQuietHours] = useState(null);
    const [history, setHistory] = useState(null);

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
            setPortrait(null);
            setQuietHours(null);
            setHistory(null);
            return;
        }

        setError(null);
        try {
            const res = await getLocationByName(name);
            setSelected(res.data);

            const portraitRes = await getPortrait(name);
            setPortrait(portraitRes);

            const quietHoursRes = await getQuietHours(name);
            setQuietHours(quietHoursRes);

            const historyRes = await getHistory(name);
            setHistory(historyRes);

        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="lieux-page">
            <div className="lieux-content">
                <h1 className="lieux-title">Lieux enregistrés</h1>

                {loading && <p className="lieux-message">Chargement des lieux</p>}
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
                        <button className='lieu-btn' onClick={() => {addFavoriteLocation(selected.name)}}>Ajouter favoris</button>
                        {portrait && portrait.semanticPortrait && (
                            <>
                                <p className="lieu-card-detail">Classification : {portrait.semanticPortrait.noiseClass}</p>
                                <p className="lieu-card-detail">Vibe rapportée : {portrait.semanticPortrait.reportedVibe}</p>
                            </>
                        )}
                        {portrait && !portrait.semanticPortrait && (
                            <p className="lieu-card-detail">{portrait.message || 'Aucune donnée récente.'}</p>
                        )}
                        {quietHours && quietHours.hourlyRanking?.length > 0 && (
                            <div>
                                <p className="lieu-card-detail font-semibold">Créneaux les plus calmes :</p>
                                {quietHours.hourlyRanking.slice(0, 3).map((slot) => (
                                    <p key={slot.hourSlot24h} className="lieu-card-detail">
                                        {slot.hourSlot24h}h — {slot.averageSoundDb} dB
                                    </p>
                                ))}
                            </div>
                        )}
                        {history && history.history?.length > 0 && (
                            <div style={{ width: '100%', height: 200 }}>
                                <p className="lieu-card-detail font-semibold">Historique du son</p>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={history.history}>
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        />
                                        <YAxis unit=" dB" />
                                        <Tooltip labelFormatter={(t) => new Date(t).toLocaleTimeString()} />
                                        <Line type="monotone" dataKey="value" stroke="#0d9488" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        {history && history.history?.length === 0 && (
                            <p className="lieu-card-detail">Aucun historique disponible pour la période demandée.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}