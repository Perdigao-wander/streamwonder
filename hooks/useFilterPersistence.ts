// hooks/useFilterPersistence.ts
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

// 🔧 Encoda apenas o que difere dos defaults
function encodeFilters(filters: FilterState, defaults: FilterState): string {
    const toEncode: Partial<FilterState> = {};

    if (filters.searchQuery !== defaults.searchQuery) {
        toEncode.searchQuery = filters.searchQuery;
    }
    if (
        filters.selectedGenres.length > 0 &&
        [...filters.selectedGenres].sort().join(',') !==
        [...defaults.selectedGenres].sort().join(',')
    ) {
        toEncode.selectedGenres = filters.selectedGenres;
    }
    if (filters.sortBy !== defaults.sortBy) {
        toEncode.sortBy = filters.sortBy;
    }
    if (filters.selectedYear !== defaults.selectedYear) {
        toEncode.selectedYear = filters.selectedYear;
    }
    if (filters.minRating !== defaults.minRating) {
        toEncode.minRating = filters.minRating;
    }
    if (filters.currentPage > 1) {
        toEncode.currentPage = filters.currentPage;
    }

    if (Object.keys(toEncode).length === 0) return '';
    return encodeURIComponent(JSON.stringify(toEncode));
}

function decodeFilters(encoded: string | null): Partial<FilterState> | null {
    if (!encoded) return null;
    try {
        const decoded = decodeURIComponent(encoded);
        const parsed = JSON.parse(decoded);
        if (parsed.selectedGenres && !Array.isArray(parsed.selectedGenres)) {
            parsed.selectedGenres = [];
        }
        return parsed;
    } catch (error) {
        console.error('Erro ao decodificar filtros:', error);
        return null;
    }
}

// 🔍 Compara filtros com os defaults (para decidir se salva no localStorage)
function isNonDefault(filters: FilterState, defaults: FilterState): boolean {
    if (filters.searchQuery !== defaults.searchQuery) return true;
    if (filters.sortBy !== defaults.sortBy) return true;
    if (filters.selectedYear !== defaults.selectedYear) return true;
    if (filters.minRating !== defaults.minRating) return true;
    if (filters.currentPage !== 1) return true;

    const fGenres = [...filters.selectedGenres].sort().join(',');
    const dGenres = [...defaults.selectedGenres].sort().join(',');
    if (fGenres !== dGenres) return true;

    return false;
}

export function useFilterPersistence(
    namespace: string,
    defaultSort: string,
    /** 🆕 Filtros aplicados na primeira visita E após "Limpar Filtros" */
    defaultFilters?: Partial<Omit<FilterState, 'sortBy'>>
) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const storageKey = `${namespace}_filters`;

    // 🧠 Memoiza `defaults` (stringify do objeto → dep estável para useMemo/useCallback)
    const defaultFiltersKey = JSON.stringify(defaultFilters || {});
    const defaults = useMemo<FilterState>(
        () => ({
            searchQuery: '',
            selectedGenres: [],
            sortBy: defaultSort,
            selectedYear: '',
            minRating: '',
            currentPage: 1,
            ...(defaultFilters || {}),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [defaultSort, defaultFiltersKey]
    );

    const [filters, setFilters] = useState<FilterState>(defaults);
    const [isInitialized, setIsInitialized] = useState(false);
    const isUpdatingRef = useRef(false);

    const saveToLocalStorage = useCallback(
        (newFilters: FilterState) => {
            if (isNonDefault(newFilters, defaults)) {
                localStorage.setItem(storageKey, JSON.stringify(newFilters));
            } else {
                localStorage.removeItem(storageKey);
            }
        },
        [storageKey, defaults]
    );

    const updateURL = useCallback(
        (newFilters: FilterState) => {
            if (isUpdatingRef.current) return;
            isUpdatingRef.current = true;

            const encoded = encodeFilters(newFilters, defaults);
            const urlParams = new URLSearchParams();
            if (encoded) urlParams.set(URL_FILTERS_PARAM, encoded);

            const newUrl = `/${namespace}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
            router.push(newUrl, { scroll: false });

            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 100);
        },
        [router, namespace, defaults]
    );

    const updateFilter = useCallback(
        (updates: Partial<FilterState>) => {
            setFilters(prev => {
                const newFilters = { ...prev, ...updates };
                saveToLocalStorage(newFilters);
                updateURL(newFilters);
                return newFilters;
            });
        },
        [saveToLocalStorage, updateURL]
    );

    // 🧹 Reseta para os DEFAULT FILTERS (não para "tudo vazio")
    const resetFilters = useCallback(() => {
        setFilters(defaults);
        saveToLocalStorage(defaults);
        updateURL(defaults);
    }, [defaults, saveToLocalStorage, updateURL]);

    // Inicializa: URL > localStorage > defaults
    useEffect(() => {
        const encoded = searchParams.get(URL_FILTERS_PARAM);
        let initialFilters: FilterState = { ...defaults };

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
                } catch (e) {
                    console.error(e);
                }
            }
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFilters(initialFilters);
        setIsInitialized(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, storageKey]);

    return { filters, updateFilter, resetFilters, isInitialized };
}