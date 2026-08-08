import { create } from 'zustand';
import { getLocations } from '../api/client';

export const useLocationsStore = create((set, get) => ({
    locations: [],
    loading: false,
    error: null,
    hasFetched: false,

    fetchLocations: async () => {
        if (get().hasFetched || get().loading) return;

        set({ loading: true, error: null });
        try {
            const res = await getLocations();
            set({ locations: res.data, loading: false, hasFetched: true });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },
}));