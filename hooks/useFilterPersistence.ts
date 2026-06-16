// hooks/useFilterPersistence.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterState {
    searchQuery: string;
    selectedGenres: number[];
    sortBy: string;
    selectedYear: string;
    minRating: string;
    currentPage: number;
}

const URL_FILTERS_PARAM = 'filters';

function encodeFilters(filters: FilterState, defaultSort: string): string {
    const toEncode: Partial<FilterState> = {};
    if (filters.searchQuery) toEncode.searchQuery = filters.searchQuery;
    if (filters.selectedGenres.length > 0) toEncode.selectedGenres = filters.selectedGenres;
    if (filters.sortBy !== defaultSort) toEncode.sortBy = filters.sortBy;
    if (filters.selectedYear) toEncode.selectedYear = filters.selectedYear;
    if (filters.minRating) toEncode.minRating = filters.minRating;
    if (filters.currentPage > 1) toEncode.currentPage = filters.currentPage;
    if (Object.keys(toEncode).length === 0) return '';
    return encodeURIComponent(JSON.stringify(toEncode));
}

function decodeFilters(encoded: string | null): Partial<FilterState> | null {
    if (!encoded) return null;
    try {
        const decoded = decodeURIComponent(encoded);
        const parsed = JSON.parse(decoded);
        if (parsed.selectedGenres && !Array.isArray(parsed.selectedGenres)) parsed.selectedGenres = [];
        return parsed;
    } catch (error) {
        console.error('Erro ao decodificar filtros:', error);
        return null;
    }
}

export function useFilterPersistence(namespace: string, defaultSort: string) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const storageKey = `${namespace}_filters`;

    const [filters, setFilters] = useState<FilterState>({
        searchQuery: '',
        selectedGenres: [],
        sortBy: defaultSort,
        selectedYear: '',
        minRating: '',
        currentPage: 1,
    });
    const [isInitialized, setIsInitialized] = useState(false);
    const isUpdatingRef = useRef(false);

    const saveToLocalStorage = useCallback((newFilters: FilterState) => {
        const hasNonDefault =
            newFilters.searchQuery !== '' ||
            newFilters.selectedGenres.length > 0 ||
            newFilters.sortBy !== defaultSort ||
            newFilters.selectedYear !== '' ||
            newFilters.minRating !== '' ||
            newFilters.currentPage !== 1;
        if (hasNonDefault) {
            localStorage.setItem(storageKey, JSON.stringify(newFilters));
        } else {
            localStorage.removeItem(storageKey);
        }
    }, [storageKey, defaultSort]);

    const updateURL = useCallback((newFilters: FilterState) => {
        if (isUpdatingRef.current) return;
        isUpdatingRef.current = true;
        const encoded = encodeFilters(newFilters, defaultSort);
        const urlParams = new URLSearchParams();
        if (encoded) urlParams.set(URL_FILTERS_PARAM, encoded);
        const newUrl = `/${namespace}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
        router.push(newUrl, { scroll: false });
        setTimeout(() => { isUpdatingRef.current = false; }, 100);
    }, [router, namespace, defaultSort]);

    const updateFilter = useCallback((updates: Partial<FilterState>) => {
        setFilters(prev => {
            const newFilters = { ...prev, ...updates };
            saveToLocalStorage(newFilters);
            updateURL(newFilters);
            return newFilters;
        });
    }, [saveToLocalStorage, updateURL]);

    const resetFilters = useCallback(() => {
        updateFilter({
            searchQuery: '',
            selectedGenres: [],
            sortBy: defaultSort,
            selectedYear: '',
            minRating: '',
            currentPage: 1,
        });
    }, [updateFilter, defaultSort]);

    useEffect(() => {
        const encoded = searchParams.get(URL_FILTERS_PARAM);
        let initialFilters: FilterState = {
            searchQuery: '',
            selectedGenres: [],
            sortBy: defaultSort,
            selectedYear: '',
            minRating: '',
            currentPage: 1,
        };

        if (encoded) {
            const decoded = decodeFilters(encoded);
            if (decoded) {
                initialFilters = { ...initialFilters, ...decoded };
            }
        } else {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    initialFilters = { ...initialFilters, ...parsed };
                    setTimeout(() => updateURL(initialFilters), 0);
                } catch (e) { console.error(e); }
            }
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFilters(initialFilters);
        setIsInitialized(true);
    }, [searchParams, storageKey, defaultSort, updateURL]);

    return { filters, updateFilter, resetFilters, isInitialized };
}