'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Film, Tv, Drama, JapaneseYen, Satellite, Trash2, X } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import ChannelPlayer from '@/app/components/ChannelPlayer';
import { useWatchlist } from '@/hooks/useWatchlist';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { WatchlistItem } from '@/types/watchlist';

type Filter = 'all' | 'movie' | 'series' | 'doramas' | 'animes' | 'channels';

type PendingAction =
    | { type: 'clear-all' }
    | { type: 'remove-item'; item: WatchlistItem }
    | null;

function getItemCategory(item: WatchlistItem): Exclude<Filter, 'all'> {
    if (item.mediaType === 'channel') return 'channels';
    if (item.mediaType === 'movie') return 'movie';
    return item.category ?? 'series';
}

export default function MinhaListaPage() {
    const { items, isHydrated, removeFromWatchlist, clearWatchlist } = useWatchlist();
    const [filter, setFilter] = useState<Filter>('movie');
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);

    // 🆕 Estado do player de canais
    const [playingChannel, setPlayingChannel] = useState<WatchlistItem | null>(null);

    const counts = {
        all: items.length,
        movie: items.filter(i => getItemCategory(i) === 'movie').length,
        series: items.filter(i => getItemCategory(i) === 'series').length,
        doramas: items.filter(i => getItemCategory(i) === 'doramas').length,
        animes: items.filter(i => getItemCategory(i) === 'animes').length,
        channels: items.filter(i => getItemCategory(i) === 'channels').length,
    };

    const filtered = items.filter(item =>
        filter === 'all' ? true : getItemCategory(item) === filter
    );

    const handleConfirm = () => {
        if (!pendingAction) return;
        if (pendingAction.type === 'clear-all') {
            clearWatchlist();
        } else {
            removeFromWatchlist(pendingAction.item.id, pendingAction.item.mediaType);
        }
        setPendingAction(null);
    };

    const handleClose = () => setPendingAction(null);

    const handleItemClick = (item: WatchlistItem) => {
        if (item.mediaType === 'channel' && item.embedUrl) {
            setPlayingChannel(item);
        }
    };

    const modalConfig =
        pendingAction?.type === 'clear-all'
            ? {
                title: 'Limpar toda a lista?',
                description: `Todos os ${items.length} itens serão removidos da sua lista. Esta ação não pode ser desfeita.`,
                confirmText: 'Limpar tudo',
                variant: 'danger' as const,
            }
            : pendingAction?.type === 'remove-item'
                ? {
                    title: 'Remover da lista?',
                    description: `"${pendingAction.item.title}" será removido da sua lista.`,
                    confirmText: 'Remover',
                    variant: 'danger' as const,
                }
                : {
                    title: '',
                    description: '',
                    confirmText: '',
                    variant: 'default' as const,
                };

    if (!isHydrated) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-800 rounded-xl aspect-[2/3]" />
                                    <div className="h-4 bg-gray-800 rounded mt-2 w-3/4" />
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
            <div className="relative min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20">
                <div className="fixed inset-0 z-0">
                    <img src="/backgroud.jpg" alt="" className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/80 via-[#0a0a1a]/70 to-[#0f0f13]/80" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
                            Minha Lista
                            <Bookmark className="w-8 h-8 text-indigo-500 fill-current" />
                        </h1>

                        {items.length > 0 && (
                            <button
                                onClick={() => setPendingAction({ type: 'clear-all' })}
                                className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 rounded-lg text-sm transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Limpar tudo
                            </button>
                        )}
                    </div>

                    {/* Filtros */}
                    {items.length > 0 && (
                        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                            <button
                                onClick={() => setFilter('movie')}
                                className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                                    filter === 'movie' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                <Film className="w-4 h-4" />
                                Filmes ({counts.movie})
                            </button>
                            <button
                                onClick={() => setFilter('series')}
                                className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                                    filter === 'series' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                <Tv className="w-4 h-4" />
                                Séries ({counts.series})
                            </button>
                            <button
                                onClick={() => setFilter('doramas')}
                                className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                                    filter === 'doramas' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                <Drama className="w-4 h-4" />
                                Doramas ({counts.doramas})
                            </button>
                            <button
                                onClick={() => setFilter('animes')}
                                className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                                    filter === 'animes' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                <JapaneseYen className="w-4 h-4" />
                                Animes ({counts.animes})
                            </button>
                            <button
                                onClick={() => setFilter('channels')}
                                className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                                    filter === 'channels' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                <Satellite className="w-4 h-4" />
                                Canais ({counts.channels})
                            </button>
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                    filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                Todos ({counts.all})
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {items.length === 0 && (
                        <div className="text-center py-24">
                            <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">Sua lista está vazia</p>
                            <p className="text-gray-500 text-sm mb-6">
                                Adicione filmes, séries e canais para assistir depois
                            </p>
                            <Link
                                href="/"
                                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Explorar catálogo
                            </Link>
                        </div>
                    )}

                    {/* Grid */}
                    {filtered.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                            {filtered.map(item => {
                                const isChannel = item.mediaType === 'channel';

                                // 🎬 Card de canal (diferente — abre player)
                                if (isChannel) {
                                    return (
                                        <div key={`channel-${item.id}`} className="group relative">
                                            <div
                                                className="cursor-pointer rounded-xl overflow-hidden bg-gray-900 p-4 hover:scale-105 transition-transform"
                                                onClick={() => handleItemClick(item)}
                                            >
                                                <div className="aspect-square flex items-center justify-center mb-3 bg-gray-800 rounded-lg">
                                                    <img
                                                        src={item.posterPath || '/placeholder-channel.png'}
                                                        alt={item.title}
                                                        className="max-w-full max-h-full object-contain pointer-events-none"
                                                        loading="lazy"
                                                        draggable={false}
                                                    />
                                                </div>
                                                <p className="text-white text-sm font-semibold truncate text-center">
                                                    {item.title}
                                                </p>
                                                {item.channelCategory && (
                                                    <p className="text-gray-400 text-xs text-center truncate mt-1">
                                                        {item.channelCategory}
                                                    </p>
                                                )}
                                                <p className="text-indigo-400 text-xs text-center mt-2 flex items-center justify-center gap-1">
                                                    <Satellite className="w-3 h-3" />
                                                    Ao vivo
                                                </p>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setPendingAction({ type: 'remove-item', item });
                                                }}
                                                aria-label={`Remover ${item.title} da lista`}
                                                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                }

                                // 🎬 Cards normais (filme/série)
                                return (
                                    <div key={`${item.mediaType}-${item.id}`} className="group relative">
                                        <Link href={`/${item.mediaType}/${item.id}`}>
                                            <div className="relative rounded-xl overflow-hidden bg-gray-900">
                                                <img
                                                    src={item.posterPath
                                                        ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
                                                        : 'https://via.placeholder.com/500x750?text=Sem+Imagem'}
                                                    alt={item.title}
                                                    className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                                                    <div className="text-white text-sm font-semibold truncate">
                                                        {item.title}
                                                    </div>
                                                    {item.releaseDate && (
                                                        <div className="text-indigo-400 text-xs">
                                                            {item.releaseDate.split('-')[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setPendingAction({ type: 'remove-item', item });
                                            }}
                                            aria-label={`Remover ${item.title} da lista`}
                                            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Filtro vazio */}
                    {items.length > 0 && filtered.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-gray-400">
                                Nenhum {filter === 'movie' ? 'filme' :
                                filter === 'series' ? 'série' :
                                    filter === 'doramas' ? 'dorama' :
                                        filter === 'animes' ? 'anime' :
                                            filter === 'channels' ? 'canal' : 'item'} na sua lista
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 🆕 Player de canal */}
            {playingChannel && playingChannel.embedUrl && (
                <ChannelPlayer
                    channelId={String(playingChannel.id)}
                    channelName={playingChannel.title}
                    embedUrl={playingChannel.embedUrl}
                    onClose={() => setPlayingChannel(null)}
                />
            )}

            <ConfirmationModal
                isOpen={pendingAction !== null}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={modalConfig.title}
                description={modalConfig.description}
                confirmText={modalConfig.confirmText}
                cancelText="Cancelar"
                variant={modalConfig.variant}
            />
        </>
    );
}