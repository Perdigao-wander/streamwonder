'use client';

import React from 'react';
import { Star, Play } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { WatchlistButton } from '@/components/WatchlistButton';
import { MediaCategory } from '@/types/watchlist';

interface MediaCardProps {
    item: MediaItem;
    onShowInfo: (item: MediaItem) => void;
    badge?: React.ReactNode;
    mediaType?: 'movie' | 'tv';
    category?: MediaCategory;    // 🆕
}

export function MediaCard({ item, onShowInfo, badge, mediaType, category }: MediaCardProps) {
    const title = item.title || item.name || 'Sem título';
    const date = item.release_date || item.first_air_date;
    const year = date ? date.split('-')[0] : 'Em breve';

    const resolvedMediaType: 'movie' | 'tv' =
        mediaType ||
        (item.media_type === 'tv' || item.media_type === 'movie'
            ? item.media_type
            : undefined) ||
        (item.first_air_date && !item.release_date ? 'tv' : 'movie');

    const handleClick = () => onShowInfo(item);

    return (
        <div
            className="group cursor-pointer transition-transform duration-300 hover:scale-105 focus:outline-none focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c] rounded-xl"
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
            aria-label={`Ver detalhes de ${title}`}
        >
            <div className="relative rounded-xl overflow-hidden bg-gray-900">
                {/* Imagem (com pointer-events-none para não interceptar cliques) */}
                <img
                    src={
                        item.poster_path
                            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                            : 'https://via.placeholder.com/500x750?text=Sem+Imagem'
                    }
                    alt={title}
                    className="w-full aspect-[2/3] object-cover pointer-events-none select-none"
                    loading="lazy"
                    draggable={false}
                />

                {/* Overlay de hover — apenas visual, o clique é capturado pelo card */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="bg-indigo-600 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform shadow-lg shadow-indigo-600/50">
                        <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                </div>

                {/* 🏷️ Badge (bandeira) — canto superior esquerdo */}
                {badge && (
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                        {badge}
                    </div>
                )}

                {/* ⭐ Rating — canto superior direito */}
                {item.vote_average !== undefined && item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-white text-xs font-semibold">
                            {item.vote_average.toFixed(1)}
                        </span>
                    </div>
                )}

                {/* 🔖 Watchlist — canto inferior esquerdo, só no hover */}
                <div
                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <WatchlistButton
                        id={item.id}
                        mediaType={resolvedMediaType}
                        title={title}
                        posterPath={item.poster_path}
                        voteAverage={item.vote_average}
                        releaseDate={date}
                        category={category}
                    />
                </div>
            </div>

            <h3 className="text-white font-semibold mt-2 truncate text-sm md:text-base">
                {title}
            </h3>
            <p className="text-gray-400 text-xs">{year}</p>
        </div>
    );
}