'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Star, ChevronLeft, ChevronRight, SearchIcon, Drama } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { useRouter, useSearchParams } from "next/navigation";

interface Genre {
    id: number;
    name: string;
}

interface TVShow {
    id: number;
    title: string;
    name: string;
    poster_path: string;
    backdrop_path?: string;
    overview?: string;
    imdb_id?: string | null;
    first_air_date?: string;
    original_language?: string;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    genre_ids?: number[];
    origin_country?: string[];
}

export default function DoramasContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [doramas, setDoramas] = useState<TVShow[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado inicial vindo da URL
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
    const [tempSearchQuery, setTempSearchQuery] = useState(() => searchParams.get('q') || '');
    const [isSearching, setIsSearching] = useState(() => !!searchParams.get('q'));
    const [showFilters, setShowFilters] = useState(false);

    // Filtros vindo da URL
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<number[]>(() => {
        const genresParam = searchParams.get('genres');
        return genresParam ? genresParam.split(',').map(Number) : [];
    });
    const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'vote_count.desc');
    const [selectedYear, setSelectedYear] = useState(() => searchParams.get('year') || '');
    const [minRating, setMinRating] = useState(() => searchParams.get('rating') || '');

    // Paginação vinda da URL
    const [currentPage, setCurrentPage] = useState(() => {
        const pageParam = searchParams.get('page');
        return pageParam ? parseInt(pageParam) : 1;
    });
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const sortOptions = [
        { value: 'vote_count.desc', label: '🗳️ Mais Votados' },
        { value: 'first_air_date.desc', label: '🆕 Mais Recentes' },
        { value: 'first_air_date.asc', label: '📅 Mais Antigos' },
        { value: 'name.desc', label: '🔤 Nome (Z-A)' },
        { value: 'name.asc', label: '🔤 Nome (A-Z)' },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    const updateURL = useCallback((params: {
        q?: string;
        page?: number;
        sort?: string;
        genres?: number[];
        year?: string;
        rating?: string;
    }) => {
        const urlParams = new URLSearchParams();

        const queryValue = params.q !== undefined ? params.q : searchQuery;
        if (queryValue) {
            urlParams.set('q', queryValue);
        }

        const pageValue = params.page !== undefined ? params.page : currentPage;
        urlParams.set('page', String(pageValue));

        const sortValue = params.sort !== undefined ? params.sort : sortBy;
        if (sortValue && sortValue !== 'vote_count.desc') {
            urlParams.set('sort', sortValue);
        }

        const genresValue = params.genres !== undefined ? params.genres : selectedGenres;
        if (genresValue && genresValue.length > 0) {
            urlParams.set('genres', genresValue.join(','));
        }

        const yearValue = params.year !== undefined ? params.year : selectedYear;
        if (yearValue) {
            urlParams.set('year', yearValue);
        }

        const ratingValue = params.rating !== undefined ? params.rating : minRating;
        if (ratingValue) {
            urlParams.set('rating', ratingValue);
        }

        const newUrl = `/doramas${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
        router.push(newUrl, { scroll: false });
    }, [searchQuery, currentPage, sortBy, selectedGenres, selectedYear, minRating, router]);

    // Buscar gêneros
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch('/api/tv/genres');
                const data = await response.json();
                setGenres(data);
            } catch (error) {
                console.error('Erro ao buscar gêneros:', error);
            }
        };
        fetchGenres();
    }, []);

    const fetchDoramas = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
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
            queryParams.append('with_origin_country', 'KR');

            if (selectedGenres.length > 0) {
                queryParams.append('with_genres', selectedGenres.join(','));
            }
            if (selectedYear) {
                queryParams.append('first_air_date_year', selectedYear);
            }
            if (minRating) {
                queryParams.append('vote_average.gte', minRating);
            }

            if (searchQuery && isSearching) {
                url = '/api/tv/search';
                queryParams.append('query', searchQuery);
            } else {
                url = '/api/tv/discover';
            }

            const response = await fetch(`${url}?${queryParams.toString()}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const doramasList = data.results || data;

            if (isLoadMore) {
                setDoramas(prev => [...prev, ...doramasList]);
            } else {
                setDoramas(doramasList);
            }

            setTotalPages(data.total_pages || Math.ceil(doramasList.length / 20));
            setTotalResults(data.total_results || doramasList.length);
            setCurrentPage(page);

            if (!isLoadMore) {
                updateURL({ page });
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar doramas');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchQuery, isSearching, sortBy, selectedGenres, selectedYear, minRating, updateURL]);

    // Executar busca quando os parâmetros mudarem
    useEffect(() => {
        setCurrentPage(1);
        fetchDoramas(1, false);
    }, [searchQuery, isSearching, sortBy, selectedGenres, selectedYear, minRating]);

    const performSearch = () => {
        setSearchQuery(tempSearchQuery);
        setIsSearching(!!tempSearchQuery);
        setCurrentPage(1);
        updateURL({ q: tempSearchQuery, page: 1 });
    };

    const clearSearch = () => {
        setTempSearchQuery('');
        setSearchQuery('');
        setIsSearching(false);
        setCurrentPage(1);
        updateURL({ q: '', page: 1 });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchDoramas(newPage, false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const loadMore = () => {
        if (currentPage < totalPages && !loadingMore) {
            fetchDoramas(currentPage + 1, true);
        }
    };

    const toggleGenre = (genreId: number) => {
        const newGenres = selectedGenres.includes(genreId)
            ? selectedGenres.filter(id => id !== genreId)
            : [...selectedGenres, genreId];

        setSelectedGenres(newGenres);
        setCurrentPage(1);
        updateURL({ genres: newGenres, page: 1 });
    };

    const clearFilters = () => {
        setSelectedGenres([]);
        setSelectedYear('');
        setMinRating('');
        setSortBy('vote_count.desc');
        setTempSearchQuery('');
        setSearchQuery('');
        setIsSearching(false);
        updateURL({
            genres: [],
            year: '',
            rating: '',
            sort: 'vote_count.desc',
            q: '',
            page: 1
        });
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        setCurrentPage(1);
        updateURL({ sort: newSort, page: 1 });
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        setCurrentPage(1);
        updateURL({ year, page: 1 });
    };

    const handleRatingChange = (rating: string) => {
        setMinRating(rating);
        setCurrentPage(1);
        updateURL({ rating, page: 1 });
    };

    const handleShowInfo = useCallback(async (show: TVShow, event?: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        router.push(`/tv/${show.id}`);
    }, [router]);

    if (loading && !loadingMore) {
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
                    <img
                        src="/backgroud.jpg"
                        alt="Universo"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/80 via-[#0a0a1a]/70 to-[#0f0f13]/80" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
                            Doramas
                            <Drama className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
                        </h1>
                    </div>

                    {/* Barra de busca e filtros */}
                    <div className="mb-8 space-y-4">
                        {/* Layout para mobile */}
                        <div className="block md:hidden">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar doramas por nome..."
                                    value={tempSearchQuery}
                                    onChange={(e) => setTempSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                                {tempSearchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                    >
                                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={performSearch}
                                    className="flex-1 px-4 py-3 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    <SearchIcon className="w-5 h-5" />
                                    Pesquisar
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex-1 px-4 py-3 cursor-pointer rounded-xl transition-colors flex items-center justify-center gap-2 ${
                                        showFilters || selectedGenres.length > 0 || selectedYear || minRating
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <Filter className="w-5 h-5" />
                                    Filtros
                                    {(selectedGenres.length > 0 || selectedYear || minRating) && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                                            {selectedGenres.length + (selectedYear ? 1 : 0) + (minRating ? 1 : 0)}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Layout para desktop */}
                        <div className="hidden md:flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar doramas por nome..."
                                    value={tempSearchQuery}
                                    onChange={(e) => setTempSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                                {tempSearchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                    >
                                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={performSearch}
                                className="px-6 py-3 rounded-xl cursor-pointer transition-colors flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                <SearchIcon className="w-5 h-5" />
                                Pesquisar
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-3 cursor-pointer rounded-xl transition-colors flex items-center gap-2 ${
                                    showFilters || selectedGenres.length > 0 || selectedYear || minRating
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                <Filter className="w-5 h-5" />
                                Filtros
                                {(selectedGenres.length > 0 || selectedYear || minRating) && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                                        {selectedGenres.length + (selectedYear ? 1 : 0) + (minRating ? 1 : 0)}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Filtros expandidos */}
                        {showFilters && (
                            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-semibold">Filtros Avançados</h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        Limpar todos
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="text-white text-sm block mb-2">Ordenar por</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => handleSortChange(e.target.value)}
                                            className="w-full cursor-pointer px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            {sortOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-white text-sm block mb-2">Ano de estreia</label>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => handleYearChange(e.target.value)}
                                            className="w-full cursor-pointer px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="">Todos os anos</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-white text-sm block mb-2">Avaliação mínima</label>
                                        <select
                                            value={minRating}
                                            onChange={(e) => handleRatingChange(e.target.value)}
                                            className="w-full cursor-pointer px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="">Todas</option>
                                            <option value="5">5+ estrelas</option>
                                            <option value="6">6+ estrelas</option>
                                            <option value="7">7+ estrelas</option>
                                            <option value="8">8+ estrelas</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="text-white text-sm block mb-2">Gêneros</label>
                                    <div className="flex flex-wrap gap-2">
                                        {genres.map(genre => (
                                            <button
                                                key={genre.id}
                                                onClick={() => toggleGenre(genre.id)}
                                                className={`px-3 py-1.5 cursor-pointer rounded-full text-sm transition-colors ${
                                                    selectedGenres.includes(genre.id)
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                            >
                                                {genre.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Indicador de busca ativa */}
                    {isSearching && searchQuery && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-indigo-400">
                            <SearchIcon className="w-4 h-4" />
                            <span>Resultados para: {searchQuery}</span>
                            <button
                                onClick={clearSearch}
                                className="ml-2 text-gray-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Loading indicator */}
                    {isLoadingDetails && (
                        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                            <div className="bg-gray-900 rounded-lg p-6 flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                                <span className="text-white">Carregando detalhes...</span>
                            </div>
                        </div>
                    )}

                    {/* Grid de doramas */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {doramas.map((show) => (
                            <div
                                key={show.id}
                                className="group cursor-pointer transition-transform duration-300 hover:scale-105"
                            >
                                <div className="relative rounded-xl overflow-hidden bg-gray-900">
                                    <img
                                        src={show.poster_path
                                            ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                                            : 'https://via.placeholder.com/500x750?text=Sem+Imagem'
                                        }
                                        alt={show.title || show.name}
                                        className="w-full aspect-[2/3] object-cover"
                                        loading="lazy"
                                        onClick={(e) => handleShowInfo(show, e)}
                                    />

                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            className="bg-indigo-600 cursor-pointer rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShowInfo(show, e);
                                            }}
                                        >
                                            <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        </button>
                                    </div>

                                    {show.vote_average && show.vote_average > 0 && (
                                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                            <span className="text-white text-xs font-semibold">
                                                {show.vote_average.toFixed(1)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                                        <span className="text-indigo-400 text-xs">🇰🇷</span>
                                    </div>
                                </div>

                                <h3 className="text-white font-semibold mt-2 truncate text-sm md:text-base">
                                    {show.title || show.name}
                                </h3>
                                <p className="text-gray-400 text-xs">
                                    {show.first_air_date?.split('-')[0] || 'Em breve'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {loadingMore && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    )}

                    {/* Paginação */}
                    {!isSearching && totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-gray-800 cursor-pointer rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 cursor-pointer rounded-lg transition-colors ${
                                                currentPage === pageNum
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-gray-800 cursor-pointer rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {isSearching && currentPage < totalPages && (
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

                    {doramas.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                {isSearching
                                    ? `Nenhum dorama encontrado para "${searchQuery}".`
                                    : 'Nenhum dorama encontrado com os filtros selecionados.'}
                            </div>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}