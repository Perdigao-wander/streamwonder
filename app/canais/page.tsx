'use client';

import React, { useState, useEffect } from 'react';
import { Search, Tv, Radio, X, Loader2, AlertCircle, Monitor, Filter, ChevronDown } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import ChannelPlayer from '@/app/components/ChannelPlayer';

interface Category {
    id: string;
    name: string;
}

interface Channel {
    id: string;
    name: string;
    description: string;
    logo_url: string;
    embed_url: string;
    category: string;
    is_active: boolean;
}

// Palavras-chave para bloquear conteúdo adulto (camada extra de segurança)
const BLOCKED_CATEGORIES = ['adulto', 'adult', '24-horas'];
const BLOCKED_KEYWORDS = ['xxx', 'sex', 'adult', 'porn', 'hot', 'dreamsex', 'jennylive'];

const ChannelsPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [allChannels, setAllChannels] = useState<Channel[]>([]);
    const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Função para verificar se um canal é adulto
    const isAdultChannel = (channel: Channel): boolean => {
        // Verificar categoria
        if (BLOCKED_CATEGORIES.some(cat =>
            channel.category?.toLowerCase().includes(cat)
        )) {
            return true;
        }

        // Verificar nome
        if (BLOCKED_KEYWORDS.some(keyword =>
            channel.name?.toLowerCase().includes(keyword)
        )) {
            return true;
        }

        // Verificar ID
        if (BLOCKED_KEYWORDS.some(keyword =>
            channel.id?.toLowerCase().includes(keyword)
        )) {
            return true;
        }

        return false;
    };

    // Buscar categorias (já filtradas pela API)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/channels/category');
                const data = await response.json();

                if (data.categories) {
                    setCategories(data.categories);
                } else {
                    throw new Error('Erro ao carregar categorias');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
                console.error('Erro:', err);
            }
        };

        fetchCategories();
    }, []);

    // Buscar canais (todos ou por categoria) - já filtrados pela API
    const fetchChannels = async (categoryId?: string | null) => {
        setLoadingChannels(true);
        try {
            let url = '/api/channels?limit=200';

            if (categoryId && categoryId !== 'adulto' && !BLOCKED_CATEGORIES.includes(categoryId)) {
                const categoryMap: Record<string, string> = {
                    '24-horas': '24-horas',
                    'animes': 'animes',
                    'canais-abertos': 'canais-abertos',
                    'casa-do-patrao': 'casa-do-patrao',
                    'desenhos': 'desenhos',
                    'documentarios': 'documentarios',
                    'esportes': 'esportes',
                    'filmes': 'filmes',
                    'gospel': 'gospel',
                    'infantil': 'infantil',
                    'ingles': 'ingles',
                    'internacionais': 'internacionais',
                    'miamitv': 'miamitv',
                    'noticias': 'noticias',
                    'realitys': 'realitys',
                    'series': 'series',
                    'variedades': 'variedades',
                };

                const genreId = categoryMap[categoryId];
                if (genreId) {
                    url = `/api/channels?genre=${genreId}&limit=200`;
                }
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.channels) {
                // Filtro extra de segurança no frontend
                const safeChannels = data.channels.filter((channel: Channel) => !isAdultChannel(channel));
                setFilteredChannels(safeChannels);
                if (!categoryId) {
                    setAllChannels(safeChannels);
                }
            } else {
                setFilteredChannels([]);
                if (!categoryId) {
                    setAllChannels([]);
                }
            }
        } catch (err) {
            console.error('Erro ao buscar canais:', err);
            setFilteredChannels([]);
        } finally {
            setLoadingChannels(false);
            setLoading(false);
        }
    };

    // Buscar todos os canais inicialmente
    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchChannels(null);
    }, []);

    // Quando a categoria mudar, buscar canais novamente
    useEffect(() => {
        if (selectedCategory !== undefined && selectedCategory !== 'adulto') {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchChannels(selectedCategory);
        }
    }, [selectedCategory]);

    const handleCategorySelect = (categoryId: string | null) => {
        // Impedir seleção de categoria adulta
        if (categoryId && BLOCKED_CATEGORIES.includes(categoryId)) {
            return;
        }
        setSelectedCategory(categoryId);
        setSearchQuery('');
        setShowCategoryDropdown(false);
    };

    const handleChannelClick = (channel: Channel) => {
        // Verificar novamente se não é adulto antes de reproduzir
        if (isAdultChannel(channel)) {
            return;
        }
        setSelectedChannel(channel);
        setShowPlayer(true);
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setSearchQuery('');
        setShowCategoryDropdown(false);
        fetchChannels(null);
    };

    // Filtrar por busca local
    useEffect(() => {
        if (searchQuery && allChannels.length > 0 && !selectedCategory) {
            const query = searchQuery.toLowerCase();
            const filtered = allChannels.filter(channel =>
                channel.name.toLowerCase().includes(query) && !isAdultChannel(channel)
            );

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFilteredChannels(filtered);
        } else if (searchQuery && selectedCategory) {
            const query = searchQuery.toLowerCase();
            setFilteredChannels(prev =>
                prev.filter(channel =>
                    channel.name.toLowerCase().includes(query) && !isAdultChannel(channel)
                )
            );
        } else if (!searchQuery && !selectedCategory && allChannels.length > 0) {
            setFilteredChannels(allChannels);
        }
    }, [searchQuery, allChannels, selectedCategory]);

    // Filtrar categorias para exibição (remover adultas)
    const safeCategories = categories.filter(cat =>
        !BLOCKED_CATEGORIES.includes(cat.id) &&
        !cat.name.toLowerCase().includes('adult')
    );

    if (loading && !loadingChannels) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    </div>
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
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // Obter nome da categoria selecionada
    const selectedCategoryName = safeCategories.find(c => c.id === selectedCategory)?.name;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
                            Canais de TV
                            <Tv className="w-7 h-7 md:w-10 md:h-10 text-indigo-500" />
                        </h1>
                        <p className="text-gray-400">
                            {loadingChannels ? 'Carregando...' : `${filteredChannels.length} canais disponíveis`}
                        </p>
                    </div>

                    {/* Filtros */}
                    <div className="mb-8 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Busca */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar canais por nome..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown de categorias */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    className={`px-5 py-3 rounded-xl transition-colors flex items-center gap-2 ${
                                        selectedCategory
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <Filter className="w-5 h-5" />
                                    {selectedCategoryName || 'Todas as categorias'}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showCategoryDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowCategoryDropdown(false)}
                                        />
                                        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 rounded-xl border border-gray-700 shadow-xl z-20 max-h-80 overflow-y-auto">
                                            <button
                                                onClick={() => handleCategorySelect(null)}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors ${
                                                    !selectedCategory ? 'text-indigo-400 bg-gray-800/50' : 'text-gray-300'
                                                }`}
                                            >
                                                Todas as categorias
                                            </button>
                                            {safeCategories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    onClick={() => handleCategorySelect(category.id)}
                                                    className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors ${
                                                        selectedCategory === category.id ? 'text-indigo-400 bg-gray-800/50' : 'text-gray-300'
                                                    }`}
                                                >
                                                    {category.name}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Botão limpar filtros */}
                            {(selectedCategory || searchQuery) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-5 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
                                >
                                    <X className="w-5 h-5" />
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Loading indicator */}
                    {loadingChannels ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : filteredChannels.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredChannels.map((channel) => (
                                <div
                                    key={channel.id}
                                    onClick={() => handleChannelClick(channel)}
                                    className="group cursor-pointer"
                                >
                                    <div className="bg-gray-800/50 hover:bg-indigo-600/20 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 overflow-hidden">
                                        {/* Logo do canal */}
                                        <div className="aspect-video bg-gray-900 flex items-center justify-center p-4">
                                            {channel.logo_url ? (
                                                <img
                                                    src={channel.logo_url}
                                                    alt={channel.name}
                                                    className="max-w-full max-h-full object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Monitor className="w-6 h-6 text-indigo-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Informações do canal */}
                                        <div className="p-3 border-t border-gray-700">
                                            <h3 className="text-white font-medium text-sm truncate">
                                                {channel.name}
                                            </h3>
                                            <p className="text-gray-500 text-xs mt-1 truncate">
                                                {channel.category || 'Canal'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-4">
                                {searchQuery
                                    ? `Nenhum canal encontrado para "${searchQuery}"`
                                    : selectedCategory
                                        ? `Nenhum canal disponível na categoria "${selectedCategoryName}"`
                                        : 'Nenhum canal disponível'}
                            </p>
                            {(searchQuery || selectedCategory) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Channel Player */}
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
};

export default ChannelsPage;