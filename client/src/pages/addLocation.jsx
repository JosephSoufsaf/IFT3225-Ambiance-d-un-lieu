import { useState } from 'react';
import { Marker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { addNewLocation } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useLocationsStore } from '../stores/useLocationsStore';

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(event) {
            setPosition(event.latlng);
        }
    });
    return position ? <Marker position={position} /> : null;
}

export default function AddLocation() {
    const [position, setPosition] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { token } = useAuth();
    const refetchLocations = useLocationsStore((state) => state.refetchLocations);

    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        if (!position) {
            setError('Veuillez sélectionner une position sur la carte.');
            return;
        }
        if (!locationName.trim()) {
            setError('Veuillez entrer un nom pour la localisation.');
            return;
        }

        const locationObject = {
            name: locationName,
            latitude: position.lat,
            longitude: position.lng
        };

        setLoading(true);
        try {
            await addNewLocation(locationObject, token);
            setSuccess(true);
            setLocationName('');
            setPosition(null);
            refetchLocations();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className='min-h-screen py-20 bg-linear-to-b from-teal-200 via-amber-200 to-teal-200'>
            <form onSubmit={handleSubmit} className='flex flex-col items-center gap-8'>

                <h1 className='text-center my-5 text-3xl'>Ajouter une nouvelle localisation</h1>

                <div className='h-[50vh] max-h-[80vw] w-[50vh] max-w-[80vw] mx-auto'>
                    <MapContainer
                        center={[45.502760, -73.615061]} zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}>

                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        <LocationMarker position={position} setPosition={setPosition} />

                    </MapContainer>
                </div>

                {position && <p><span className='italic'>Position selectionnée :</span> <span className='text-teal-500'>{position.lat}, {position.lng}</span></p>}
                <div className='flex gap-4 items-center'>
                    <label htmlFor="locationName">
                        Nom de la localisation :
                    </label>
                    <input type="text" placeholder='Ex : Université de Montréal' value={locationName} name='locationName'
                        className='border p-1 rounded-md border-teal-300 placeholder:italic'
                        onChange={(event) => { setLocationName(event.target.value) }}
                    />
                </div>

                <button type="submit" disabled={loading} className='border border-teal-300 p-2 rounded-md text-teal-700 font-semibold hover:cursor-pointer hover:bg-teal-100 hover:border-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
                    {loading ? 'Ajout en cours...' : 'Ajouter localisation'}
                </button>

                {error && <p className='text-red-600'>{error}</p>}
                {success && <p className='text-teal-600'>Localisation ajoutée avec succès !</p>}

            </form>
        </main>
    );
}