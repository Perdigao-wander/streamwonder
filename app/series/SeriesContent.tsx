'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tv, SearchIcon, X, Filter } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { useGenres } from '@/hooks/useGenres';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import { MediaSearchBar } from '@/components/MediaSearchBar';
import { MediaFiltersPanel } from '@/components/MediaFiltersPanel';
import { MediaCard } from '@/components/MediaCard';
import { MediaPagination } from '@/components/MediaPagination';
import { MediaItem } from '@/types/media';

export default function SeriesContent() {
    const { genres } = useGenres();
    const { filters, updateFilter, resetFilters, isInitialized } = useFilterPersistence('series', 'vote_count.desc');
    const {
        searchQuery,
        selectedGenres,
        sortBy,
        selectedYear,
        minRating,
        currentPage,
    } = filters;

    const sortOptions = [
        { value: 'vote_count.desc', label: 'Mais Votados' },
        { value: 'popularity.desc', label: 'Mais Populares' },
        { value: 'vote_average.desc', label: 'Melhor Avaliados' },
        { value: 'release_date.desc', label: 'Mais Recentes' },
        { value: 'release_date.asc', label: 'Mais Antigos' },
    ];

    const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);
    const [showFilters, setShowFilters] = useState(false);
    const [series, setSeries] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    // Atualizar o campo temporário quando o filtro de busca mudar externamente
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTempSearchQuery(searchQuery);
    }, [searchQuery]);

    // Buscar séries sempre que os filtros mudarem
    const fetchSeries = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            let url = '';
            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('sort_by', sortBy);
            queryParams.append('exclude_countries', 'JP,KR');

            if (selectedGenres.length > 0) {
                queryParams.append('with_genres', selectedGenres.join(','));
            }
            if (selectedYear) {
                queryParams.append('first_air_date_year', selectedYear);
            }
            if (minRating) {
                queryParams.append('vote_average.gte', minRating);
            }

            const isSearching = !!searchQuery;
            if (isSearching) {
                url = '/api/tv/search';
                queryParams.append('query', searchQuery);
            } else {
                url = '/api/tv/discover';
            }

            const response = await fetch(`${url}?${queryParams.toString()}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            const seriesList = data.results || data;

            if (isLoadMore) {
                setSeries(prev => [...prev, ...seriesList]);
            } else {
                setSeries(seriesList);
            }

            setTotalPages(data.total_pages || Math.ceil(seriesList.length / 20));
        } catch (err) {
            console.error('Erro ao buscar séries:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchQuery, selectedGenres, sortBy, selectedYear, minRating]);

    // Efeito para buscar quando os filtros mudarem ou a página mudar
    useEffect(() => {
        if (isInitialized) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchSeries(currentPage, false);
        }
    }, [searchQuery, selectedGenres, sortBy, selectedYear, minRating, currentPage, isInitialized, fetchSeries]);

    // Handlers que atualizam os filtros via hook
    const performSearch = () => {
        if (tempSearchQuery === searchQuery) return;
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
        const newGenres = selectedGenres.includes(genreId)
            ? selectedGenres.filter(id => id !== genreId)
            : [...selectedGenres, genreId];
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
        if (currentPage < totalPages && !loadingMore) {
            fetchSeries(currentPage + 1, true);
            updateFilter({ currentPage: currentPage + 1 });
        }
    };

    const handleShowInfo = (show: MediaItem) => {
        window.location.href = `/tv/${show.id}`;
    };

    const activeFiltersCount = selectedGenres.length + (selectedYear ? 1 : 0) + (minRating ? 1 : 0);

    if (!isInitialized || (loading && series.length === 0)) {
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
                            Séries
                            <Tv className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
                        </h1>
                    </div>

                    <div className="mb-8 space-y-4">
                            <MediaSearchBar
                                tempSearchQuery={tempSearchQuery}
                                onTempQueryChange={setTempSearchQuery}
                                onSearch={performSearch}
                                onClear={clearSearch}
                                onKeyPress={handleKeyPress}
                                placeholder="Pesquise as series aqui..."
                            />
                            <MediaFiltersPanel
                                showFilters={showFilters}
                                onToggleFilters={() => setShowFilters(!showFilters)}
                                sortBy={sortBy}
                                onSortChange={handleSortChange}
                                selectedYear={selectedYear}
                                onYearChange={handleYearChange}
                                minRating={minRating}
                                onRatingChange={handleRatingChange}
                                genres={genres}
                                selectedGenres={selectedGenres}
                                onToggleGenre={toggleGenre}
                                onClearFilters={resetFilters}
                                yearLabel="Ano de lançamento"
                                activeFiltersCount={activeFiltersCount}
                                sortOptions={sortOptions}
                            />
                    </div>

                    {searchQuery && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-indigo-400">
                            <SearchIcon className="w-4 h-4" />
                            <span>Resultados para: {searchQuery}</span>
                            <button onClick={clearSearch} className="ml-2 text-gray-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {series.map((show) => (
                            <MediaCard key={show.id} item={show} onShowInfo={handleShowInfo} />
                        ))}
                    </div>

                    {loadingMore && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    )}

                    {!searchQuery && totalPages > 1 && (
                        <MediaPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    )}

                    {searchQuery && currentPage < totalPages && (
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

                    {series.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                {searchQuery
                                    ? `Nenhuma série encontrada para "${searchQuery}".`
                                    : 'Nenhuma série encontrada com os filtros selecionados.'}
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