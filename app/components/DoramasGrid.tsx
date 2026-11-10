'use client';

import TVShowsGrid from './TVShowsGrid';

interface DoramasGridProps {
    category?: 'popular' | 'top_rated' | 'airing_today' | 'on_the_air';
    limit?: number;
    year?: number | string; // ← NOVO
}

const DoramasGrid = ({ category, limit = 10, year }: DoramasGridProps) => {

    return (
        <TVShowsGrid
            category={category}
            limit={limit}
            originCountry="KR"
            year={year}
            mediaCategory="doramas"
        />
    );

};

export default DoramasGrid;