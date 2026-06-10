import React from 'react';
import { Star } from 'lucide-react';
import { MediaItem } from '@/types/media';

interface MediaCardProps {
    item: MediaItem;
    onShowInfo: (item: MediaItem) => void;
    badge?: React.ReactNode;
}

export function MediaCard({ item, onShowInfo, badge }: MediaCardProps) {
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date;
    const year = date ? date.split('-')[0] : 'Em breve';

    return (
        <div className="group cursor-pointer transition-transform duration-300 hover:scale-105">
            <div className="relative rounded-xl overflow-hidden bg-gray-900">
                <img
                    src={item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : 'https://via.placeholder.com/500x750?text=Sem+Imagem'
                    }
                    alt={title}
                    className="w-full aspect-[2/3] object-cover"
                    loading="lazy"
                    onClick={() => onShowInfo(item)}
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                        className="bg-indigo-600 cursor-pointer rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShowInfo(item);
                        }}
                    >
                        <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                </div>
                {item.vote_average && item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-white text-xs font-semibold">
              {item.vote_average.toFixed(1)}
            </span>
                    </div>
                )}
                {/* Badge opcional (ex: bandeira) */}
                {badge && (
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                        {badge}
                    </div>
                )}
            </div>
            <h3 className="text-white font-semibold mt-2 truncate text-sm md:text-base">{title}</h3>
            <p className="text-gray-400 text-xs">{year}</p>
        </div>
    );
}