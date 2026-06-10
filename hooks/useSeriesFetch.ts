// hooks/useSeriesFetch.ts
import { useState, useCallback } from 'react';
import { MediaItem } from '@/types/media';

export function useSeriesFetch() {
    const [series, setSeries] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchSeries = useCallback(async (
        page: number = 1,
        isLoadMore: boolean = false,
        params: {
            searchQuery: string;
            isSearching: boolean;
            sortBy: string;
            selectedGenres: number[];
            selectedYear: string;
            minRating: string;
        }
    ) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            let url = '';
            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('sort_by', params.sortBy);
            queryParams.append('exclude_countries', 'JP,KR');

            if (params.selectedGenres.length > 0) {
                queryParams.append('with_genres', params.selectedGenres.join(','));
            }
            if (params.selectedYear) {
                queryParams.append('first_air_date_year', params.selectedYear);
            }
            if (params.minRating) {
                queryParams.append('vote_average.gte', params.minRating);
            }

            if (params.searchQuery && params.isSearching) {
                url = '/api/tv/search';
                queryParams.append('query', params.searchQuery);
            } else {
                url = '/api/tv/discover';
            }

            const response = await fetch(`${url}?${queryParams.toString()}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const seriesList = data.results || data;

            if (isLoadMore) {
                setSeries(prev => [...prev, ...seriesList]);
            } else {
                setSeries(seriesList);
            }

            setTotalPages(data.total_pages || Math.ceil(seriesList.length / 20));
            setTotalResults(data.total_results || seriesList.length);
            setCurrentPage(page);

            return { seriesList, totalPages: data.total_pages, totalResults: data.total_results };

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar séries');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    return {
        series,
        loading,
        loadingMore,
        error,
        totalPages,
        totalResults,
        currentPage,
        setSeries,
        setLoading,
        setLoadingMore,
        setError,
        setTotalPages,
        setTotalResults,
        setCurrentPage,
        fetchSeries
    };
}