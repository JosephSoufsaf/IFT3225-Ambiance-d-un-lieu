import { useEffect, useMemo, useState } from 'react';
import { getLocations, getPortrait } from '../api/client.js';

// Valeurs placeholder.
const padding = 8;
const seuilFreaicheur = 300;
const couleurDeMood = { calme: '#10b981', modéré: '#f59e0b', animé: '#f43f5e' };
const couleurGrise = '#9ca3af'; // gris

function isFresh(portrait) {
    if (!portrait || !portrait.lastMeasurementAt) return false;
    const ageMs = Date.now() - new Date(portrait.lastMeasurementAt).getTime();
    return ageMs <= seuilFreaicheur * 60 * 1000;
}

// Convertit une liste de lieux (lat/lng) en positions (%) dans un cadre
// rectangulaire, en préservant leurs positions relatives les unes aux
// autres.
function computePositions(locations) {
    const valid = locations.filter(
        (loc) => typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
    );

    if (valid.length === 0) return {};

    const lats = valid.map((loc) => loc.latitude);
    const lngs = valid.map((loc) => loc.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;
    const usable = 100 - padding * 2;

    const positions = {};
    valid.forEach((loc) => {
        const xPercent = padding + ((loc.longitude - minLng) / lngRange) * usable;
        // Axe inversé
        const yPercent = padding + (1 - (loc.latitude - minLat) / latRange) * usable;
        positions[loc._id] = { xPercent, yPercent };
    });
    return positions;
}

export default function Map() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // portraits[locationId] = { loading, error, data }
    const [portraits, setPortraits] = useState({});
    const [selectedId, setSelectedId] = useState(null);

    // Charge les lieux
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        getLocations()
            .then((data) => {
                if (!cancelled) setLocations(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Charge chaque lieu pour colorer les nodes marqueurs
    useEffect(() => {
        locations.forEach((loc) => {
            setPortraits((prev) => ({
                ...prev,
                [loc._id]: { loading: true, error: null, data: prev[loc._id]?.data ?? null },
            }));

            getPortrait(loc.name)
                .then((data) => {
                    setPortraits((prev) => ({ ...prev, [loc._id]: { loading: false, error: null, data } }));
                })
                .catch((err) => {
                    setPortraits((prev) => ({
                        ...prev,
                        [loc._id]: { loading: false, error: err.message, data: null },
                    }));
                });
        });
    }, [locations]);

    // Ajout de Claude lors de la vérification
    const positions = useMemo(() => computePositions(locations), [locations]);
    const selected = locations.find((l) => l._id === selectedId);
    const selectedPortrait = selectedId ? portraits[selectedId] : null;

    // XML placeholder par Claude
    return (
        <div className="flex h-[600px]">
            <div className="w-64 overflow-y-auto border-2">
                <p className="p-2">
                    {loading ? 'Chargement des lieux...' : `${locations.length} lieux`}
                </p>

                {error && <p className="p-2">Erreur: {error}</p>}

                {!loading && !error && locations.length === 0 && (
                    <p className="p-2">Aucun lieu enregistré.</p>
                )}

                <ul>
                    {locations.map((loc) => {
                        const portraitState = portraits[loc._id];
                        const fresh = isFresh(portraitState?.data);
                        const noiseClass = portraitState?.data?.semanticPortrait?.noiseClass;
                        const color = fresh && noiseClass && couleurDeMood[noiseClass]
                            ? couleurDeMood[noiseClass]
                            : couleurGrise;

                        return (
                            <li
                                key={loc._id}
                                onClick={() => setSelectedId(loc._id)}
                                className="p-2 border-t-2 cursor-pointer flex items-center gap-2"
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        backgroundColor: color,
                                    }}
                                />
                                {loc.name}
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="flex-1 relative border-2">
                {Object.entries(positions).map(([locId, pos]) => {
                    const loc = locations.find((l) => l._id === locId);
                    if (!loc) return null;

                    const portraitState = portraits[locId];
                    const fresh = isFresh(portraitState?.data);
                    const noiseClass = portraitState?.data?.semanticPortrait?.noiseClass;
                    const color = fresh && noiseClass && CLASS_COLOR[noiseClass]
                        ? CLASS_COLOR[noiseClass]
                        : couleurGrise;

                    return (
                        <button
                            key={locId}
                            onClick={() => setSelectedId(locId)}
                            title={loc.name}
                            style={{
                                position: 'absolute',
                                left: `${pos.xPercent}%`,
                                top: `${pos.yPercent}%`,
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    border: '2px solid white',
                                    boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                                }}
                            />
                            {loc.name}
                        </button>
                    );
                })}

                {selected && (
                    <div className="absolute bottom-2 left-2 right-2 border-2 bg-white p-2">
                        <p className="font-bold">{selected.name}</p>
                        <p>lat: {selected.latitude}, lng: {selected.longitude}</p>

                        {selectedPortrait?.loading && <p>Chargement du portrait...</p>}
                        {selectedPortrait?.error && (
                            <p>Portrait indisponible: {selectedPortrait.error}</p>
                        )}

                        {selectedPortrait?.data && !isFresh(selectedPortrait.data) && (
                            <p>Aucune mesure récente (moins de {FRESHNESS_MINUTES} min).</p>
                        )}

                        {selectedPortrait?.data && isFresh(selectedPortrait.data) && (
                            <div>
                                <p>Niveau moyen: {selectedPortrait.data.averageSoundDb} dB</p>
                                <p>Classe: {selectedPortrait.data.semanticPortrait?.noiseClass}</p>
                                <p>Vibe rapportée: {selectedPortrait.data.semanticPortrait?.reportedVibe}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}