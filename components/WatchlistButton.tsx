'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { MediaCategory } from '@/types/watchlist';

interface WatchlistButtonProps {
    id: number | string;
    mediaType: 'movie' | 'tv' | 'channel';
    title: string;
    posterPath: string | null;
    backdropPath?: string | null;
    voteAverage?: number;
    releaseDate?: string;
    category?: MediaCategory;
    embedUrl?: string;
    channelCategory?: string;
    variant?: 'icon' | 'full';
    /** 🆕 Esconde o texto do botão no mobile (mostra só o ícone) */
    iconOnlyOnMobile?: boolean;
    className?: string;
}

export function WatchlistButton({
                                    id,
                                    mediaType,
                                    title,
                                    posterPath,
                                    backdropPath,
                                    voteAverage,
                                    releaseDate,
                                    category,
                                    embedUrl,
                                    channelCategory,
                                    variant = 'icon',
                                    iconOnlyOnMobile = false,
                                    className = '',
                                }: WatchlistButtonProps) {
    const { isInWatchlist, toggleWatchlist, isHydrated } = useWatchlist();
    const active = isInWatchlist(id, mediaType);

    if (!isHydrated) return null;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWatchlist({
            id, mediaType, title, posterPath, backdropPath,
            voteAverage, releaseDate, category,
            embedUrl, channelCategory,
        });
    };

    if (variant === 'full') {
        return (
            <button
                onClick={handleClick}
                aria-label={active ? 'Remover da minha lista' : 'Adicionar à minha lista'}
                title={active ? 'Na Minha Lista' : 'Adicionar à Minha Lista'}
                className={`flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-lg font-medium transition-all ${
                    active
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                } ${className}`}
            >
                {active ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                <span className={iconOnlyOnMobile ? 'hidden md:inline' : ''}>
                    {active ? 'Na Minha Lista' : 'Adicionar à Minha Lista'}
                </span>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            aria-label={active ? 'Remover da minha lista' : 'Adicionar à minha lista'}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                active ? 'bg-indigo-600 text-white' : 'bg-black/60 text-white hover:bg-black/80'
            } ${className}`}
        >
            {active ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
    );
}