// hooks/useChannelFilters.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ChannelFiltersState {
    category: string | null;
    searchQuery: string;
    currentPage: number;
}

const STORAGE_KEY = 'channel_filters';
const URL_FILTERS_PARAM = 'filters';

function encodeFilters(filters: ChannelFiltersState): string {
    const toEncode: any = {};
    if (filters.category) toEncode.category = filters.category;
    if (filters.searchQuery) toEncode.searchQuery = filters.searchQuery;
    if (filters.currentPage > 1) toEncode.currentPage = filters.currentPage;
    return Object.keys(toEncode).length ? encodeURIComponent(JSON.stringify(toEncode)) : '';
}

function decodeFilters(encoded: string | null): Partial<ChannelFiltersState> | null {
    if (!encoded) return null;
    try {
        return JSON.parse(decodeURIComponent(encoded));
    } catch (e) {
        console.error('Erro ao decodificar filtros de canais:', e);
        return null;
    }
}

export function useChannelFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [filters, setFilters] = useState<ChannelFiltersState>({
        category: null,
        searchQuery: '',
        currentPage: 1,
    });
    const [isInitialized, setIsInitialized] = useState(false);
    const isUpdatingRef = useRef(false);

    const updateURL = useCallback((newFilters: ChannelFiltersState) => {
        if (isUpdatingRef.current) return;
        isUpdatingRef.current = true;

        const encoded = encodeFilters(newFilters);
        const urlParams = new URLSearchParams();
        if (encoded) urlParams.set(URL_FILTERS_PARAM, encoded);
        router.push(`/canais${urlParams.toString() ? `?${urlParams.toString()}` : ''}`, { scroll: false });

        setTimeout(() => { isUpdatingRef.current = false; }, 100);
    }, [router]);

    const saveToLocalStorage = useCallback((newFilters: ChannelFiltersState) => {
        const hasNonDefault = newFilters.category !== null || newFilters.searchQuery !== '' || newFilters.currentPage !== 1;
        if (hasNonDefault) localStorage.setItem(STORAGE_KEY, JSON.stringify(newFilters));
        else localStorage.removeItem(STORAGE_KEY);
    }, []);

    const updateFilter = useCallback((updates: Partial<ChannelFiltersState>) => {
        setFilters(prev => {
            const newFilters = { ...prev, ...updates };
            saveToLocalStorage(newFilters);
            updateURL(newFilters);
            return newFilters;
        });
    }, [saveToLocalStorage, updateURL]);

    const resetFilters = useCallback(() => {
        updateFilter({ category: null, searchQuery: '', currentPage: 1 });
    }, [updateFilter]);

    // Inicialização: URL > localStorage
    useEffect(() => {
        const encoded = searchParams.get(URL_FILTERS_PARAM);
        let initial: ChannelFiltersState = { category: null, searchQuery: '', currentPage: 1 };

        if (encoded) {
            const decoded = decodeFilters(encoded);
            if (decoded) initial = { ...initial, ...decoded };
        } else {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    initial = { ...initial, ...parsed };
                    setTimeout(() => updateURL(initial), 0);
                } catch (e) { console.error(e); }
            }
        }
        setFilters(initial);
        setIsInitialized(true);
    }, [searchParams, updateURL]);

    return { filters, updateFilter, resetFilters, isInitialized };
}