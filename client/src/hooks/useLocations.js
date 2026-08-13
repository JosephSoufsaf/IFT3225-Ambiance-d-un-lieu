import { useState, useEffect } from 'react';
import { getLocations } from '../api/client';

export function useLocations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchLocations() {
            setLoading(true);
            setError(null);
            try {
                const res = await getLocations();
                if (!cancelled) {
                    setLocations(res.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchLocations();

        return () => {
            cancelled = true;
        };
    }, []);

    return { locations, loading, error };
}