import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getLocations, getPortrait } from '../api/client';
import './map.css';

// Corrige un bug connu de react-leaflet + bundlers : sans ça, l'icône
// par défaut des marqueurs Leaflet ne se charge pas (chemins cassés par Vite).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Couleurs + libellés par mood, selon les valeurs réelles retournées par
// /ambiance/:location/portrait (semanticPortrait.noiseClass), plus
// 'Unknown' pour le cas où il n'y a pas de mesure récente.
const MOOD_COLOR = {
    'Très Calme': '#10b981',
    'Calme': '#34d399',
    'Modéré': '#f59e0b',
    'Bruyant': '#f43f5e',
    'Unknown': '#9ca3af',
};

const MOOD_LABEL = {
    'Très Calme': 'Très calme',
    'Calme': 'Calme',
    'Modéré': 'Modéré',
    'Bruyant': 'Bruyant',
    'Unknown': 'Pas de mesure récente',
};

export default function Map() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // portraits[locationName] = { loading, error, data }
    const [portraits, setPortraits] = useState({});

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

    useEffect(() => {
        async function fetchPortrait(location) {
            setPortraits((prev) => ({
                ...prev,
                [location.name]: { loading: true, error: null, data: prev[location.name]?.data ?? null },
            }));

            try {
                const data = await getPortrait(location.name);
                setPortraits((prev) => ({ ...prev, [location.name]: { loading: false, error: null, data } }));
            } catch (err) {
                setPortraits((prev) => ({
                    ...prev,
                    [location.name]: { loading: false, error: err.message, data: null },
                }));
            }
        }

        locations.forEach((location) => fetchPortrait(location));
    }, [locations]);

    const validLocations = locations.filter(
        (location) => typeof location.latitude === 'number' && typeof location.longitude === 'number'
    );

    return (
        <div className="map-page">
            <div className="map-content">
                <h1 className="map-title">Carte des lieux</h1>

                {loading && <p className="map-message">Chargement des lieux...</p>}
                {error && <p className="map-error">{error}</p>}
                {!loading && !error && validLocations.length === 0 && (
                    <p className="map-message">Aucun lieu avec coordonnées à afficher.</p>
                )}

                <MapContainer center={[45.517, -73.575]} zoom={12} className="map-container">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />

                    {validLocations.map((location) => {
                        const portraitState = portraits[location.name];
                        const data = portraitState?.data;
                        const isUnknown = !data || data.status === 'Unknown';
                        const mood = isUnknown ? 'Unknown' : data.semanticPortrait?.noiseClass;
                        const color = MOOD_COLOR[mood] ?? MOOD_COLOR['Unknown'];

                        const icon = L.divIcon({
                            className: '',
                            html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.5);"></div>`,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                        });

                        return (
                            <Marker key={location._id} position={[location.latitude, location.longitude]} icon={icon}>
                                <Popup>
                                    <div className="map-popup">
                                        <p className="map-popup-title">{location.name}</p>

                                        {portraitState?.loading && (
                                            <p className="map-popup-detail">Chargement du portrait...</p>
                                        )}
                                        {portraitState?.error && (
                                            <p className="map-popup-detail">
                                                Portrait indisponible : {portraitState.error}
                                            </p>
                                        )}

                                        {data && isUnknown && (
                                            <p className="map-popup-detail">
                                                {data.message ?? 'Aucune donnée récente.'}
                                            </p>
                                        )}

                                        {data && !isUnknown && (
                                            <>
                                                <p className="map-popup-detail">
                                                    <span>Classe</span>
                                                    <span>{mood}</span>
                                                </p>
                                                <p className="map-popup-detail">
                                                    <span>Niveau moyen</span>
                                                    <span>{data.averageSoundDb} dB</span>
                                                </p>
                                                <p className="map-popup-detail">
                                                    <span>Vibe rapportée</span>
                                                    <span>{data.semanticPortrait?.reportedVibe ?? 'Inconnue'}</span>
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>

                <div className="map-legend">
                    {Object.entries(MOOD_LABEL).map(([mood, label]) => (
                        <div key={mood} className="map-legend-item">
                            <span className="map-legend-dot" style={{ backgroundColor: MOOD_COLOR[mood] }} />
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}