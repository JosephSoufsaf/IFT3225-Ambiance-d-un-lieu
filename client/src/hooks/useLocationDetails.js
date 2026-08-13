import { useState, useEffect } from 'react';
import { getLocationByName, getPortrait, getQuietHours, getHistory } from '../api/client';

export function useLocationDetails(name) {
    const [selected, setSelected] = useState(null);
    const [portrait, setPortrait] = useState(null);
    const [quietHours, setQuietHours] = useState(null);
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!name) {
            setSelected(null);
            setPortrait(null);
            setQuietHours(null);
            setHistory(null);
            setError(null);
            return;
        }

        let cancelled = false;

        async function fetchDetails() {
            setLoading(true);
            setError(null);
            try {
                const [locationRes, portraitRes, quietHoursRes, historyRes] = await Promise.all([
                    getLocationByName(name),
                    getPortrait(name),
                    getQuietHours(name),
                    getHistory(name),
                ]);

                if (!cancelled) {
                    setSelected(locationRes.data);
                    setPortrait(portraitRes);
                    setQuietHours(quietHoursRes);
                    setHistory(historyRes);
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

        fetchDetails();

        return () => {
            cancelled = true;
        };
    }, [name]);

    return { selected, portrait, quietHours, history, loading, error };
}