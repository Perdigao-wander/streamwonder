'use client';

import TVShowsGrid from './TVShowsGrid';

interface AnimeGridProps {
    category?: 'popular' | 'top_rated' | 'airing_today' | 'on_the_air';
    limit?: number;
    genre?: string; // Para filtrar por gênero específico (ex: 'action', 'comedy')
}

const AnimeGrid = ({ category = 'popular', limit = 10 }: AnimeGridProps) => {
    // Pode adicionar lógica extra aqui se necessário
    return <TVShowsGrid category={category} limit={limit} originCountry="JP" />;
};

export default AnimeGrid;