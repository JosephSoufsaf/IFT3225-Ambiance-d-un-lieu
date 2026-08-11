import { useState } from 'react'
import { Marker, MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { addNewLocation } from '../api/client';

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(event) {
            setPosition(event.latlng);
            console.log(position);
        }
    })
    return position ? <Marker position={position} /> : null;
}


export default function AddLocation () {
    
    const [position , setPosition] = useState(null);
    const [locationName , setLocationName] = useState('');

    function handleSubmit (event) {
        event.preventDefault();
        if (! position) {
            return alert("Veuillez sélectionner une position sur la map");
        }
        const locationObject = {
            name: locationName,
            latitude: position.lat,
            longitude: position.lng
        }
        console.log(locationObject);
        const data = addNewLocation(locationObject);
        console.log(data);
    }

    return <main className='aboslute py-20'>

        <form onSubmit={handleSubmit} className='flex flex-col items-center gap-8'>
        
            <h1 className='text-center my-5 text-3xl'>Ajouter une nouvelle localisation</h1>
        
            <div className='h-[75vw] w-[75vw] mx-auto'>
        
                <MapContainer
                center={[45.502760 , -73.615061]} zoom={13} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}>
        
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                        />
        
                    <LocationMarker position={position} setPosition={setPosition}/>
        
                </MapContainer>
        
            </div>
            
            {position && <p><span className='italic'>Position selectionnée :</span> <span className='text-teal-500'>{position.lat}, {position.lng}</span></p>}
            <div className='flex gap-4 items-center'>
                <label htmlFor="locationName" >
                    Nom de la localisation : 
                </label>
                <input type="text" placeholder='Ex : Université de Montréal' value={locationName} name='locationName'
                    className='border p-1 rounded-md border-teal-300 placeholder:italic'
                    onChange={ (event) => { setLocationName(event.target.value)} }
                />
            </div>
        
            <button type="submit" className='border border-teal-300 p-2 rounded-md text-teal-700 font-semibold hover:cursor-pointer hover:bg-teal-100 hover:border-teal-600 transition-all'>
                Ajouter localisation
            </button>
        
        </form>
    </main>
}