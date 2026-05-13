'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {Search, Filter, X, ChevronLeft, ChevronRight, SearchIcon, Info, BookOpen} from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import ComicInfoModal from '@/app/components/ComicInfoModal';

interface ComicIssue {
    id: number;
    name: string;
    volume: {
        id: number;
        name: string;
    };
    cover_date: string;
    description?: string;
    image: {
        super_url: string;
        thumb_url: string;
        small_url: string;
    };
    issue_number: string;
    publisher?: {
        id: number;
        name: string;
    };
}

const ComicsPage = () => {
    const [comics, setComics] = useState<ComicIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [tempSearchQuery, setTempSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedComic, setSelectedComic] = useState<ComicIssue | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Filtros
    const [selectedPublisher, setSelectedPublisher] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [sortBy, setSortBy] = useState('cover_date:desc');

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const sortOptions = [
        { value: 'cover_date:desc', label: 'Mais Recentes' },
        { value: 'cover_date:asc', label: 'Mais Antigos' },
        { value: 'name:asc', label: 'Nome A-Z' },
        { value: 'name:desc', label: 'Nome Z-A' },
    ];

    const publishers = [
        'DC Comics',
        'Marvel',
        'Image Comics',
        'Dark Horse Comics',
        'IDW Publishing',
        'BOOM! Studios',
        'Dynamite Entertainment',
    ];


    const fetchComics = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            let url = '';
            const queryParams = new URLSearchParams();

            if (searchQuery && isSearching) {
                url = '/api/comics/search';
                queryParams.append('query', searchQuery);
                queryParams.append('page', page.toString());
            } else {
                url = '/api/comics/issues';
                queryParams.append('page', page.toString());
                queryParams.append('sort', sortBy);
                if (selectedPublisher) {
                    queryParams.append('filter', `publisher:${encodeURIComponent(selectedPublisher)}`);
                }
            }

            const response = await fetch(`${url}?${queryParams.toString()}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (isLoadMore) {
                setComics(prev => [...prev, ...data.results]);
            } else {
                setComics(data.results);
            }

            setTotalPages(data.total_pages);
            setTotalResults(data.total_results);
            console.log(totalResults)
            setCurrentPage(page);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar HQs');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchQuery, isSearching, sortBy, selectedPublisher]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);

        fetchComics(1, false);
    }, [fetchComics]);

    const performSearch = () => {
        setSearchQuery(tempSearchQuery);
        setIsSearching(!!tempSearchQuery);
        setCurrentPage(1);
    };

    const clearSearch = () => {
        setTempSearchQuery('');
        setSearchQuery('');
        setIsSearching(false);
        setCurrentPage(1);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchComics(newPage, false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const loadMore = () => {
        if (currentPage < totalPages && !loadingMore) {
            fetchComics(currentPage + 1, true);
        }
    };

    const clearFilters = () => {
        setSelectedPublisher('');
        setSelectedYear('');
        setSortBy('cover_date:desc');
        clearSearch();
    };

    const handleOpenModal = (comic: ComicIssue) => {
        setSelectedComic(comic);
        setShowModal(true);
    };

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
                    {/* Overlay escuro para garantir legibilidade */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/80 via-[#0a0a1a]/70 to-[#0f0f13]/80" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
                            HQs
                            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
                        </h1>
                    </div>

                    <div className="mb-8 space-y-4">
                        {/* Layout para mobile */}
                        <div className="block md:hidden">
                            {/* Campo de pesquisa em cima */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar HQs por nome..."
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

                            {/* Botões embaixo, um ao lado do outro */}
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
                                        showFilters || selectedPublisher || selectedYear
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <Filter className="w-5 h-5" />
                                    Filtros
                                    {(selectedPublisher || selectedYear) && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                        {(selectedPublisher ? 1 : 0) + (selectedYear ? 1 : 0)}
                    </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Layout para desktop (mantém o original) */}
                        <div className="hidden md:flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar HQs por nome..."
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
                                    showFilters || selectedPublisher || selectedYear
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                <Filter className="w-5 h-5" />
                                Filtros
                                {(selectedPublisher || selectedYear) && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {(selectedPublisher ? 1 : 0) + (selectedYear ? 1 : 0)}
                </span>
                                )}
                            </button>
                        </div>

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
                                            onChange={(e) => setSortBy(e.target.value)}
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
                                        <label className="text-white text-sm block mb-2">Editora</label>
                                        <select
                                            value={selectedPublisher}
                                            onChange={(e) => setSelectedPublisher(e.target.value)}
                                            className="w-full cursor-pointer px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="">Todas as editoras</option>
                                            {publishers.map(pub => (
                                                <option key={pub} value={pub}>{pub}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {isSearching && searchQuery && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-indigo-400">
                            <SearchIcon className="w-4 h-4" />
                            <span>Resultados para: {searchQuery}</span>
                            <button onClick={clearSearch} className="ml-2 text-gray-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {comics.map((comic) => {
                            const title = comic.name;
                            const volumeName = comic.volume?.name || 'HQ';
                            const issueNumber = comic.issue_number;
                            const year = comic.cover_date?.split('-')[0] || 'Data indisponível';
                            const imageUrl = comic.image?.small_url || comic.image?.thumb_url || 'https://via.placeholder.com/500x750?text=Sem+Imagem';

                            return (
                                <div
                                    key={comic.id}
                                    onClick={() => handleOpenModal(comic)}
                                    className="group cursor-pointer transition-transform duration-300 hover:scale-105"
                                >
                                    <div className="relative rounded-xl overflow-hidden bg-gray-900">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full aspect-[2/3] object-cover"
                                            loading="lazy"
                                        />

                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="bg-indigo-600 cursor-pointer rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform">
                                                <Info className="w-5 h-5 text-white" />
                                            </button>
                                        </div>

                                        {comic.publisher && (
                                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                                                <span className="text-white text-xs">{comic.publisher.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-white font-semibold mt-2 truncate text-sm md:text-base">
                                        {title}
                                    </h3>
                                    <p className="text-gray-400 text-xs">
                                        {volumeName} #{issueNumber} • {year}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {loadingMore && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    )}

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
                                className="px-4 py-2 cursor-pointer bg-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
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
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loadingMore ? 'Carregando...' : 'Carregar Mais'}
                            </button>
                        </div>
                    )}

                    {comics.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                {isSearching
                                    ? `Nenhuma HQ encontrada para "${searchQuery}".`
                                    : 'Nenhuma HQ encontrada com os filtros selecionados.'}
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

            {showModal && selectedComic && (
                <ComicInfoModal
                    comic={selectedComic}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedComic(null);
                    }}
                    onWatch={() => {
                        // Para HQs, podemos abrir uma visualização ou redirecionar
                        console.log('Ver HQ:', selectedComic.name);
                    }}
                />
            )}
        </>
    );
};

export default ComicsPage;