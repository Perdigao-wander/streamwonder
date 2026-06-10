'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Satellite, SearchIcon, X, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import ChannelPlayer from '@/app/components/ChannelPlayer';
import { useChannelFilters } from '@/hooks/useChannelFilters';
import { MediaSearchBar } from '@/components/MediaSearchBar';
import { MediaPagination } from '@/components/MediaPagination';
import { ChannelCard } from '@/components/ChannelCard';
import { ChannelFiltersPanel } from '@/components/ChannelFiltersPanel';
import { Channel } from '@/types/channel';

const BLOCKED_CATEGORIES = ['adulto', 'adult'];
const BLOCKED_KEYWORDS = ['xxx', 'sex', 'adult', 'porn', 'hot', 'dreamsex', 'jennylive'];
const ITEMS_PER_PAGE = 24;

interface Category {
    id: string;
    name: string;
}


export default function ChannelsPage() {
    const { filters, updateFilter, resetFilters, isInitialized } = useChannelFilters();
    const [categories, setCategories] = useState<Category[]>([]);
    const [allChannels, setAllChannels] = useState<Channel[]>([]);
    const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

    // Campo temporário para busca
    const [tempSearchQuery, setTempSearchQuery] = useState(filters.searchQuery);

    // Atualiza tempSearchQuery quando o filtro mudar externamente
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTempSearchQuery(filters.searchQuery);
    }, [filters.searchQuery]);

    // Função para bloquear conteúdo adulto
    const isAdultChannel = (channel: Channel): boolean => {
        if (BLOCKED_CATEGORIES.some(cat => channel.category?.toLowerCase().includes(cat))) return true;
        if (BLOCKED_KEYWORDS.some(keyword => channel.name?.toLowerCase().includes(keyword))) return true;
        if (BLOCKED_KEYWORDS.some(keyword => channel.id?.toLowerCase().includes(keyword))) return true;
        return false;
    };

    // Carregar categorias
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/channels/category');
                const data = await res.json();
                if (data.categories) {
                    const safe = data.categories.filter((cat: Category) => !BLOCKED_CATEGORIES.includes(cat.id));
                    setCategories(safe);
                } else throw new Error('Erro ao carregar categorias');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
            }
        };
        fetchCategories();
    }, []);

    // Buscar canais (com ou sem categoria, com ou sem busca)
    const fetchChannels = useCallback(async (category: string | null, search: string) => {
        setLoadingChannels(true);
        try {
            let url = '/api/channels?limit=200';
            if (category && !BLOCKED_CATEGORIES.includes(category)) {
                const categoryMap: Record<string, string> = {
                    '24-horas': '24-horas', 'animes': 'animes', 'canais-abertos': 'canais-abertos',
                    'casa-do-patrao': 'casa-do-patrao', 'desenhos': 'desenhos', 'documentarios': 'documentarios',
                    'esportes': 'esportes', 'filmes': 'filmes', 'gospel': 'gospel', 'infantil': 'infantil',
                    'ingles': 'ingles', 'internacionais': 'internacionais', 'miamitv': 'miamitv',
                    'noticias': 'noticias', 'realitys': 'realitys', 'series': 'series', 'variedades': 'variedades',
                };
                const genreId = categoryMap[category];
                if (genreId) url = `/api/channels?genre=${genreId}&limit=200`;
            }
            if (search) {
                url = `/api/channels?q=${encodeURIComponent(search)}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            if (data.channels) {
                const safe = data.channels.filter((ch: Channel) => !isAdultChannel(ch));
                setFilteredChannels(safe);
                if (!category && !search) setAllChannels(safe);
            } else {
                setFilteredChannels([]);
                if (!category && !search) setAllChannels([]);
            }
        } catch (err) {
            console.error(err);
            setFilteredChannels([]);
        } finally {
            setLoadingChannels(false);
            setLoading(false);
        }
    }, []);

    // Disparar busca quando categoria, busca ou página mudarem
    useEffect(() => {
        if (isInitialized) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchChannels(filters.category, filters.searchQuery);
        }
    }, [filters.category, filters.searchQuery, isInitialized, fetchChannels]);

    // Paginação client-side
    const totalPages = Math.ceil(filteredChannels.length / ITEMS_PER_PAGE);
    const startIdx = (filters.currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedChannels = filteredChannels.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    // Handlers
    const handleCategorySelect = (categoryId: string | null) => {
        if (categoryId && BLOCKED_CATEGORIES.includes(categoryId)) return;
        updateFilter({ category: categoryId, currentPage: 1 });
        setShowFilters(false);
    };

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

    const handleChannelClick = (channel: Channel) => {
        if (isAdultChannel(channel)) return;
        setSelectedChannel(channel);
        setShowPlayer(true);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            updateFilter({ currentPage: page });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const activeFiltersCount = (filters.category ? 1 : 0) + (filters.searchQuery ? 1 : 0);

    if (!isInitialized || (loading && !loadingChannels && filteredChannels.length === 0)) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20">
                    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <p className="text-red-500 mb-4">Erro: {error}</p>
                        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
                            Canais de TV
                            <Satellite className="w-7 h-7 md:w-10 md:h-10 text-indigo-500" />
                        </h1>
                        <p className="text-gray-400">
                            {loadingChannels ? 'Carregando...' : `${filteredChannels.length} canais disponíveis`}
                        </p>
                        {filters.searchQuery && (
                            <p className="text-indigo-400 text-sm mt-2">Resultados para: {filters.searchQuery}</p>
                        )}
                    </div>

                    <div className="mb-8 space-y-4">
                        <MediaSearchBar
                            placeholder="Buscar canais por nome..."
                            tempSearchQuery={tempSearchQuery}
                            onTempQueryChange={setTempSearchQuery}
                            onSearch={performSearch}
                            onClear={clearSearch}
                            onKeyPress={handleKeyPress}
                        />
                        <ChannelFiltersPanel
                            showFilters={showFilters}
                            onToggleFilters={() => setShowFilters(!showFilters)}
                            selectedCategory={filters.category}
                            categories={categories}
                            onSelectCategory={handleCategorySelect}
                            activeFiltersCount={activeFiltersCount}
                            onClearFilters={resetFilters}
                        />
                    </div>

                    {loadingChannels ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : paginatedChannels.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {paginatedChannels.map(channel => (
                                    <ChannelCard key={channel.id} channel={channel} onClick={handleChannelClick} />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <MediaPagination
                                    currentPage={filters.currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                            <div className="text-center mt-4 text-gray-500 text-sm">
                                Página {filters.currentPage} de {totalPages} • {filteredChannels.length} canais no total
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Satellite className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-4">
                                {filters.searchQuery
                                    ? `Nenhum canal encontrado para "${filters.searchQuery}"`
                                    : filters.category
                                        ? `Nenhum canal disponível na categoria selecionada`
                                        : 'Nenhum canal disponível'}
                            </p>
                            {(filters.searchQuery || filters.category) && (
                                <button onClick={resetFilters} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showPlayer && selectedChannel && (
                <ChannelPlayer
                    channelId={selectedChannel.id}
                    channelName={selectedChannel.name}
                    embedUrl={selectedChannel.embed_url}
                    onClose={() => {
                        setShowPlayer(false);
                        setSelectedChannel(null);
                    }}
                />
            )}
        </>
    );
}