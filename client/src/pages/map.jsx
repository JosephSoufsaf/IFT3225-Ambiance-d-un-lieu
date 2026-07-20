import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getLocations, getPortrait } from '../api/client';
import './map.css';

const moodColor = {
    'Très Calme': '#10b981',
    'Calme': '#34d399',
    'Modéré': '#f59e0b',
    'Bruyant': '#f43f5e',
    'Unknown': '#9ca3af',
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
                        const color = moodColor[mood] ?? moodColor['Unknown'];

                        const icon = L.divIcon({
                            className: '',
                            html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.5);"></div>`,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                        });

                        return (
                            <Marker key={location._id} position={[location.latitude, location.longitude]} icon={icon}>
                                <Popup>
                                    <strong>{location.name}</strong>
                                    <br />

                                    {portraitState?.loading && 'Chargement du portrait...'}
                                    {portraitState?.error && `Portrait indisponible : ${portraitState.error}`}

                                    {data && isUnknown && (data.message ?? 'Aucune donnée récente.')}

                                    {data && !isUnknown && (
                                        <>
                                            Classe : {mood}
                                            <br />
                                            Niveau moyen : {data.averageSoundDb} dB
                                            <br />
                                            Vibe rapportée : {data.semanticPortrait?.reportedVibe ?? 'Inconnue'}
                                        </>
                                    )}
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}