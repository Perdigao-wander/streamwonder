'use client';

import TVShowsGrid from './TVShowsGrid';

interface DoramasGridProps {
    category?: 'popular' | 'top_rated' | 'airing_today' | 'on_the_air';
    limit?: number;
}

const DoramasGrid = ({ category = 'popular', limit = 10 }: DoramasGridProps) => {

    return <TVShowsGrid category={category} limit={limit} originCountry="KR" />;
};

export default DoramasGrid;