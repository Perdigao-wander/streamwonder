// app/movies/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Film, SearchIcon, X } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import { useGenres } from '@/hooks/useGenres';
import { MediaSearchBar } from '@/components/MediaSearchBar';
import { MediaFiltersPanel } from '@/components/MediaFiltersPanel';
import { MediaCard } from '@/components/MediaCard';
import { MediaPagination } from '@/components/MediaPagination';
import { MediaItem, Genre } from '@/types/media';


export default function MoviesPage() {
    const { filters, updateFilter, resetFilters, isInitialized } = useFilterPersistence('movies', 'popularity.desc');
    const { genres } = useGenres();

    const [tempSearchQuery, setTempSearchQuery] = useState(filters.searchQuery);
    const [showFilters, setShowFilters] = useState(false);
    const [movies, setMovies] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const sortOptions = [
        { value: 'popularity.desc', label: 'Mais Populares' },
        { value: 'vote_average.desc', label: 'Melhor Avaliados' },
        { value: 'release_date.desc', label: 'Mais Recentes' },
        { value: 'release_date.asc', label: 'Mais Antigos' },
        { value: 'vote_count.desc', label: 'Mais Votados' },
    ];

    const fetchMovies = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const queryParams = new URLSearchParams();
            queryParams.append('sort_by', filters.sortBy);
            queryParams.append('page', page.toString());
            if (filters.selectedGenres.length) queryParams.append('with_genres', filters.selectedGenres.join(','));
            if (filters.selectedYear) queryParams.append('primary_release_year', filters.selectedYear);
            if (filters.minRating) queryParams.append('vote_average.gte', filters.minRating);

            let url = '';
            const isSearching = !!filters.searchQuery;
            if (isSearching) {
                url = '/api/movies/search';
                queryParams.append('query', filters.searchQuery);
            } else {
                url = '/api/movies/discover';
            }

            const response = await fetch(`${url}?${queryParams.toString()}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const results = data.results || [];
            if (isLoadMore) {
                setMovies(prev => [...prev, ...results]);
            } else {
                setMovies(results);
            }
            setTotalPages(data.total_pages || 1);
        } catch (err) {
            console.error('Erro ao buscar filmes:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters]);

    // Sincroniza tempSearchQuery quando o filtro mudar externamente
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTempSearchQuery(filters.searchQuery);
    }, [filters.searchQuery]);

    // Busca quando os filtros mudam ou a página muda
    useEffect(() => {
        if (isInitialized) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchMovies(filters.currentPage, false);
        }
    }, [filters, isInitialized, fetchMovies]);

    const performSearch = () => {
        if (tempSearchQuery === filters.searchQuery) return;
        updateFilter({ searchQuery: tempSearchQuery, currentPage: 1 });
    };

    const clearSearch = () => {
        setTempSearchQuery('');
        updateFilter({ searchQuery: '', currentPage: 1 });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') performSearch();
    };

    const toggleGenre = (genreId: number) => {
        const newGenres = filters.selectedGenres.includes(genreId)
            ? filters.selectedGenres.filter(id => id !== genreId)
            : [...filters.selectedGenres, genreId];
        updateFilter({ selectedGenres: newGenres, currentPage: 1 });
    };

    const handleSortChange = (newSort: string) => {
        updateFilter({ sortBy: newSort, currentPage: 1 });
    };

    const handleYearChange = (year: string) => {
        updateFilter({ selectedYear: year, currentPage: 1 });
    };

    const handleRatingChange = (rating: string) => {
        updateFilter({ minRating: rating, currentPage: 1 });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            updateFilter({ currentPage: newPage });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const loadMore = () => {
        if (filters.currentPage < totalPages && !loadingMore) {
            fetchMovies(filters.currentPage + 1, true);
            updateFilter({ currentPage: filters.currentPage + 1 });
        }
    };

    const handleShowInfo = (movie: MediaItem) => {
        window.location.href = `/movie/${movie.id}`;
    };

    const activeFiltersCount = filters.selectedGenres.length + (filters.selectedYear ? 1 : 0) + (filters.minRating ? 1 : 0);
    const isSearching = !!filters.searchQuery;

    if (!isInitialized || (loading && movies.length === 0)) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-800 rounded-xl aspect-[2/3]"></div>
                                    <div className="h-4 bg-gray-800 rounded mt-2 w-3/4"></div>
                                    <div className="h-3 bg-gray-800 rounded mt-1 w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="relative min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20 overflow-hidden">
                <div className="fixed inset-0 z-0">
                    <img src="/backgroud.jpg" alt="Universo" className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/80 via-[#0a0a1a]/70 to-[#0f0f13]/80" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
                            Filmes
                            <Film className="w-7 h-7 md:w-10 md:h-10 text-indigo-500" />
                        </h1>
                    </div>

                    <div className="mb-8 space-y-4">
                        <MediaSearchBar
                            placeholder="Buscar filmes por nome..."
                            tempSearchQuery={tempSearchQuery}
                            onTempQueryChange={setTempSearchQuery}
                            onSearch={performSearch}
                            onClear={clearSearch}
                            onKeyPress={handleKeyPress}
                        />
                        <MediaFiltersPanel
                            showFilters={showFilters}
                            onToggleFilters={() => setShowFilters(!showFilters)}
                            sortBy={filters.sortBy}
                            sortOptions={sortOptions}
                            onSortChange={handleSortChange}
                            selectedYear={filters.selectedYear}
                            onYearChange={handleYearChange}
                            minRating={filters.minRating}
                            onRatingChange={handleRatingChange}
                            genres={genres}
                            selectedGenres={filters.selectedGenres}
                            onToggleGenre={toggleGenre}
                            onClearFilters={resetFilters}
                            activeFiltersCount={activeFiltersCount}
                            yearLabel="Ano de lançamento"
                        />
                    </div>

                    {isSearching && filters.searchQuery && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-indigo-400">
                            <SearchIcon className="w-4 h-4" />
                            <span>Resultados para: {filters.searchQuery}</span>
                            <button onClick={clearSearch} className="ml-2 text-gray-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {movies.map(movie => (
                            <MediaCard key={movie.id} item={movie} onShowInfo={handleShowInfo} />
                        ))}
                    </div>

                    {loadingMore && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    )}

                    {!isSearching && totalPages > 1 && (
                        <MediaPagination
                            currentPage={filters.currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}

                    {isSearching && filters.currentPage < totalPages && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-6 py-3 cursor-pointer bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loadingMore ? 'Carregando...' : 'Carregar Mais'}
                            </button>
                        </div>
                    )}

                    {movies.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                {isSearching
                                    ? `Nenhum filme encontrado para "${filters.searchQuery}".`
                                    : 'Nenhum filme encontrado com os filtros selecionados.'}
                            </div>
                            <button onClick={resetFilters} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                Limpar Filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}