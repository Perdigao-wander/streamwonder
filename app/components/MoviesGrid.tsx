'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Play, Star, Film, AlertCircle } from 'lucide-react';
import VideoPlayer from '@/app/components/video-player/index';
import {useRouter} from "next/navigation";

interface Movie {
    id: number;
    title: string;
    imdb_id: string;
    name?: string;
    poster_path: string;
    backdrop_path?: string;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    media_type?: 'movie' | 'tv';
    original_language?: string;
}

interface MoviesGridProps {
    type?: 'movie' | 'tv' | 'all';
    initialCategory?: 'popular' | 'top_rated' | 'now_playing' | 'upcoming';
    limit?: number;
}

const MoviesGrid = ({ type = 'movie', initialCategory = 'upcoming', limit = 10 }: MoviesGridProps) => {
    const [items, setItems] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<Movie | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const router = useRouter();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                setError(null);

                let endpoint = '';

                if (type === 'movie') {
                    switch (initialCategory) {
                        case 'popular':
                            endpoint = '/api/movies/popular';
                            break;
                        case 'top_rated':
                            endpoint = '/api/movies/top-rated';
                            break;
                        case 'now_playing':
                            endpoint = '/api/movies/now-playing';
                            break;
                        case 'upcoming':
                            endpoint = '/api/movies/upcoming';
                            break;
                        default:
                            endpoint = '/api/movies/popular';
                    }
                } else if (type === 'tv') {
                    endpoint = `/api/tv/${initialCategory}`;
                } else {
                    endpoint = `/api/trending/all/week`;
                }

                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setItems(data.slice(0, limit));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar');
                console.error('Erro:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [type, initialCategory, limit]); // ✅ Dependências corretas


    const handleShowInfo = useCallback(async (movie: Movie, event?: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const mediaType = 'movie';

        router.push(`/${mediaType}/${movie.id}`);
    }, [router]);

    // Handler para touch start (identificar scroll vs clique)
    const handleTouchStart = useCallback((e: React.TouchEvent, item: Movie) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
    }, []);

    // Handler para touch end (detectar se foi clique ou scroll)
    const handleTouchEnd = useCallback((e: React.TouchEvent, item: Movie) => {
        if (!touchStart) return;

        const touchEnd = e.changedTouches[0];
        const deltaX = Math.abs(touchEnd.clientX - touchStart.x);
        const deltaY = Math.abs(touchEnd.clientY - touchStart.y);

        if (deltaX < 10 && deltaY < 10) {
            e.preventDefault();
            handleShowInfo(item, e);
        }

        setTouchStart(null);
    }, [touchStart, handleShowInfo]);

    // Fechar player com segurança
    const handleClosePlayer = useCallback(() => {
        setShowPlayer(false);
        setSelectedItem(null);
    }, []);

    // Formatar data
    const formatYear = (dateString?: string) => {
        if (!dateString) return 'Em breve';
        return dateString.split('-')[0];
    };

    // Formatar nota
    const formatRating = (rating?: number) => {
        if (!rating || rating === 0) return null;
        return rating.toFixed(1);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-800 rounded-xl aspect-[2/3]"></div>
                        <div className="h-4 bg-gray-800 rounded mt-2 w-3/4"></div>
                        <div className="h-3 bg-gray-800 rounded mt-1 w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 mb-4">Erro: {error}</p>
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <Film className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum filme encontrado</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {items.map((item) => {
                    const title = item.title || item.name || 'Sem título';
                    const year = formatYear(item.release_date || item.first_air_date);
                    const rating = formatRating(item.vote_average);
                    const posterUrl = item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

                    return (
                        <div
                            key={item.id}
                            ref={el => { cardRefs.current[item.id] = el; }}
                            className="group cursor-pointer transition-transform duration-300 active:scale-95 hover:scale-105"
                            onClick={(e) => handleShowInfo(item, e)}
                            onTouchStart={(e) => handleTouchStart(e, item)}
                            onTouchEnd={(e) => handleTouchEnd(e, item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleShowInfo(item, e);
                                }
                            }}
                        >
                            <div className="relative rounded-xl overflow-hidden bg-gray-900">
                                <img
                                    src={posterUrl}
                                    alt={title}
                                    className="w-full aspect-[2/3] object-cover pointer-events-none"
                                    loading="lazy"
                                    draggable="false"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://via.placeholder.com/500x750?text=Erro+Imagem';
                                    }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        className="bg-indigo-600 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform pointer-events-none"
                                        aria-label={`Assistir ${title}`}
                                    >
                                        <Play className="w-6 h-6 text-white fill-current" />
                                    </button>
                                </div>

                                {rating && (
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <span className="text-white text-xs font-semibold">
                                            {rating}
                                        </span>
                                    </div>
                                )}

                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                                    <Film className="w-3 h-3 text-indigo-500" />
                                </div>

                                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center">
                                    <div className="space-y-0.5">
                                        <div className="text-white text-xs font-semibold truncate">
                                            {title}
                                        </div>
                                        <div className="text-indigo-400 text-xs">
                                            {year}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showPlayer && selectedItem && (
                <VideoPlayer
                    movieId={selectedItem.id}
                    imdbId={selectedItem.imdb_id}
                    title={selectedItem.title || selectedItem.name || ''}
                    onClose={handleClosePlayer}
                    autoPlay={true}
                />
            )}
        </>
    );
};

export default MoviesGrid;