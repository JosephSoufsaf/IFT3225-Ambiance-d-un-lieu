// client/src/hooks/useLocations.js
import { useEffect } from 'react';
import { useLocationsStore } from '../stores/useLocationsStore';

export function useLocations() {
    const locations = useLocationsStore((state) => state.locations);
    const loading = useLocationsStore((state) => state.loading);
    const error = useLocationsStore((state) => state.error);
    const fetchLocations = useLocationsStore((state) => state.fetchLocations);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    return { locations, loading, error };
}