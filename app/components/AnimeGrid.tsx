'use client';

import TVShowsGrid from './TVShowsGrid';

interface AnimeGridProps {
    category?: 'popular' | 'top_rated' | 'airing_today' | 'on_the_air';
    limit?: number;
    genre?: string;
    year?: number | string;
}

const AnimeGrid = ({ category, limit = 10, year }: AnimeGridProps) => {
    return (
        <TVShowsGrid
            category={category}
            limit={limit}
            originCountry="JP"
            year={year}
            mediaCategory="animes"

        />
    );
};

export default AnimeGrid;