// hooks/useSeriesURL.ts
import { useCallback } from 'react';
import { useRouter } from "next/navigation";

interface URLParams {
    q?: string;
    page?: number;
    sort?: string;
    genres?: number[];
    year?: string;
    rating?: string;
}

export function useSeriesURL() {
    const router = useRouter();

    const updateURL = useCallback((params: URLParams, currentState: {
        searchQuery: string;
        currentPage: number;
        sortBy: string;
        selectedGenres: number[];
        selectedYear: string;
        minRating: string;
    }) => {
        const urlParams = new URLSearchParams();

        const queryValue = params.q !== undefined ? params.q : currentState.searchQuery;
        if (queryValue) {
            urlParams.set('q', queryValue);
        }

        const pageValue = params.page !== undefined ? params.page : currentState.currentPage;
        urlParams.set('page', String(pageValue));

        const sortValue = params.sort !== undefined ? params.sort : currentState.sortBy;
        if (sortValue && sortValue !== 'vote_count.desc') {
            urlParams.set('sort', sortValue);
        }

        const genresValue = params.genres !== undefined ? params.genres : currentState.selectedGenres;
        if (genresValue && genresValue.length > 0) {
            urlParams.set('genres', genresValue.join(','));
        }

        const yearValue = params.year !== undefined ? params.year : currentState.selectedYear;
        if (yearValue) {
            urlParams.set('year', yearValue);
        }

        const ratingValue = params.rating !== undefined ? params.rating : currentState.minRating;
        if (ratingValue) {
            urlParams.set('rating', ratingValue);
        }

        const newUrl = `/series${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
        router.push(newUrl, { scroll: false });
    }, [router]);

    return { updateURL };
}