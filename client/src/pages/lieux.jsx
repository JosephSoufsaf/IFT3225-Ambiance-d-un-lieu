import { useState } from 'react';
import { addFavoriteLocation, removeFavoriteLocation, getFavoriteLocations, getObservedLocations } from '../api/client';
import { useLocations } from '../hooks/useLocations';
import { useLocationDetails } from '../hooks/useLocationDetails';
import { useAuth } from '../hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './lieux.css';

export default function Lieux() {
    const { locations, loading, error: locationsError } = useLocations();
    const [selectedName, setSelectedName] = useState(null);
    const { selected, portrait, quietHours, history, error: detailsError } = useLocationDetails(selectedName);
    const [activeTab, setActiveTab] = useState('all');
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [favoritesError, setFavoritesError] = useState(null);
    const [favoriteMessage, setFavoriteMessage] = useState(null);
    const [observed, setObserved] = useState([]);
    const [selectedFrom, setSelectedFrom] = useState('all');

    const { loggedin, token } = useAuth();

    function handleSelect(name, from = 'all') {
        if (selectedName === name) {
            setSelectedName(null);
            return;
        }
        setSelectedFrom(from);
        setSelectedName(name);
    }

    async function handleAddFavorite() {
        try {
            await addFavoriteLocation(selected.name, token);
            setFavoriteMessage(true);
        } catch (err) {
            console.log(err);
        }
        setTimeout(() => setFavoriteMessage(false), 1000);
    }

    async function handleRemoveFavorite() {
        try {
            await removeFavoriteLocation(selected.name, token);
            setFavoriteMessage(true);
            setFavorites((prev) => prev.filter((fav) => fav.location.name !== selected.name));
            if (activeTab === 'mine') {
                setSelectedName(null);
            }
        } catch (err) {
            console.log(err);
        }
        setTimeout(() => setFavoriteMessage(false), 1000);
    }

    async function handleTabClick(tab) {
        if (tab === 'mine' && !loggedin) {
            alert('Connecte-toi pour voir tes lieux favoris et observés.');
            return;
        }
        setActiveTab(tab);
        setSelectedName(null);

        if (tab === 'mine') {
            setFavoritesLoading(true);
            setFavoritesError(null);
            try {
                const favRes = await getFavoriteLocations(token);
                setFavorites(favRes.data);

                const obsRes = await getObservedLocations(token);
                setObserved(obsRes.data);
            } catch (err) {
                setFavoritesError(err.message);
            } finally {
                setFavoritesLoading(false);
            }
        }
    }

    return (
        <div className="lieux-page">
            <div className="lieux-content">
                <h1 className="lieux-title">Lieux enregistrés</h1>

                <div className="lieux-tabs">
                    <button
                        className={`lieu-btn ${activeTab === 'all' ? 'lieu-btn-active' : ''}`}
                        onClick={() => handleTabClick('all')}
                    >
                        Tous les lieux
                    </button>
                    <button
                        className={`lieu-btn ${activeTab === 'mine' ? 'lieu-btn-active' : ''}`}
                        onClick={() => handleTabClick('mine')}
                    >
                        Mes lieux
                    </button>
                </div>

                {activeTab === 'all' && (
                    <>
                        {loading && <p className="lieux-message">Chargement des lieux</p>}
                        {locationsError && <p className="lieux-error">{locationsError}</p>}
                        {!loading && !locationsError && locations.length === 0 && (
                            <p className="lieux-message">Aucun lieu enregistré pour le moment.</p>
                        )}
                        <div className="lieux-list">
                            {locations.map((location) => (
                                <button
                                    key={location._id}
                                    onClick={() => handleSelect(location.name, 'all')}
                                    className={`lieu-btn ${selectedName === location.name ? 'lieu-btn-active' : ''}`}
                                >
                                    {location.name}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'mine' && loggedin && (
                    <>
                        <div>
                            <h2 className="lieux-title" style={{ fontSize: '1.25rem' }}>Mes favoris</h2>
                            {favoritesLoading && <p className="lieux-message">Chargement...</p>}
                            {favoritesError && <p className="lieux-error">{favoritesError}</p>}
                            {!favoritesLoading && !favoritesError && favorites.length === 0 && (
                                <p className="lieux-message">Aucun lieu favori pour le moment.</p>
                            )}
                            <div className="lieux-list">
                                {favorites.map((fav) => (
                                    <button
                                        key={fav._id}
                                        onClick={() => handleSelect(fav.location.name, 'favorites')}
                                        className={`lieu-btn ${selectedName === fav.location.name ? 'lieu-btn-active' : ''}`}
                                    >
                                        {fav.location.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <h2 className="lieux-title" style={{ fontSize: '1.25rem' }}>Lieux observés</h2>
                            {!favoritesLoading && observed.length === 0 && (
                                <p className="lieux-message">Aucun lieu observé pour le moment.</p>
                            )}
                            <div className="lieux-list">
                                {observed.map((obs) => (
                                    <button
                                        key={obs._id}
                                        onClick={() => handleSelect(obs.location.name, 'observed')}
                                        className={`lieu-btn ${selectedName === obs.location.name ? 'lieu-btn-active' : ''}`}
                                    >
                                        {obs.location.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {selected && (
                    <div className="lieu-card">
                        <h2 className="lieu-card-title">{selected.name}</h2>
                        <p className="lieu-card-detail">Latitude : {selected.latitude}</p>
                        <p className="lieu-card-detail">Longitude : {selected.longitude}</p>
                        {detailsError && <p className="lieux-error">{detailsError}</p>}
                        {loggedin &&
                            <div className='flex gap-2'>
                                {selectedFrom === 'favorites' ? (
                                    <button
                                        className={`lieu-btn ${favoriteMessage ? 'lieu-btn-active' : ''}`}
                                        onClick={handleRemoveFavorite}
                                    >
                                        Enlever favoris
                                    </button>
                                ) : selectedFrom === 'observed' ? null : (
                                    <button
                                        className={`lieu-btn ${favoriteMessage ? 'lieu-btn-active' : ''}`}
                                        onClick={handleAddFavorite}
                                    >
                                        Ajouter favoris
                                    </button>
                                )}
                            </div>
                        }
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