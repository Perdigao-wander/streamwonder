'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Play, Star, Tv, AlertCircle } from 'lucide-react';
import VideoPlayer from '@/app/components/video-player/index';
import { WatchlistButton } from '@/components/WatchlistButton';
import { useRouter } from 'next/navigation';
import { MediaCategory } from '@/types/watchlist';

interface TVShow {
    id: number;
    title: string;
    imdb_id?: string | null;
    name: string;
    poster_path: string;
    backdrop_path?: string;
    overview?: string;
    first_air_date?: string;
    vote_average?: number;
    vote_count?: number;
    media_type?: string;
    origin_country?: string[];
    original_language?: string;
}

interface TVShowWithDetails extends TVShow {
    seasons?: {
        id: number;
        season_number: number;
        name: string;
        overview: string;
        poster_path: string | null;
        episode_count: number;
        air_date: string | null;
    }[];
}

interface TVShowsGridProps {
    category?: 'popular' | 'top_rated' | 'airing_today' | 'on_the_air';
    limit?: number;
    originCountry?: string;
    mediaType?: 'tv' | 'anime';
    year?: number | string;
    mediaCategory?: MediaCategory;   // 🆕 'series' | 'doramas' | 'animes'
}

const TVShowsGrid = ({
                         category = 'popular',
                         limit = 10,
                         originCountry,
                         year,
                         mediaCategory
                     }: TVShowsGridProps) => {
    const [shows, setShows] = useState<TVShow[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedShow, setSelectedShow] = useState<TVShowWithDetails | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
    const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchTVShows = async () => {
            try {
                setLoading(true);
                setError(null);

                const useDiscover = !!(originCountry || year);
                let endpoint = '';

                if (useDiscover) {
                    const params = new URLSearchParams();

                    if (originCountry) {
                        params.set('with_origin_country', originCountry);
                    }

                    // 🎯 FILTRO DE ANIME: se for Japão, restringe a Animação e exclui Reality
                    if (originCountry === 'JP') {
                        params.set('with_genres', '16');       // 16 = Animation
                        params.set('without_genres', '10764'); // 10764 = Reality
                    }

                    if (year) {
                        params.set('first_air_date_year', String(year));
                    }

                    params.set('sort_by', 'vote_count.desc');
                    params.set('limit', String(limit));

                    endpoint = `/api/tv/discover?${params.toString()}`;
                } else {
                    switch (category) {
                        case 'popular':      endpoint = '/api/tv/popular'; break;
                        case 'top_rated':    endpoint = '/api/tv/top-rated'; break;
                        case 'airing_today': endpoint = '/api/tv/airing-today'; break;
                        case 'on_the_air':   endpoint = '/api/tv/on-the-air'; break;
                        default:             endpoint = '/api/tv/popular';
                    }
                }

                const response = await fetch(endpoint);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const results = useDiscover ? data.results : data;
                setShows(results.slice(0, limit));
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Erro ao buscar conteúdo');
                console.error('Erro:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTVShows();
    }, [category, limit, originCountry, year]);

    const handleShowInfo = useCallback(
        async (show: TVShow, event?: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            const mediaType = show.media_type || (show.first_air_date ? 'tv' : 'movie');
            router.push(`/${mediaType}/${show.id}`);
        },
        [router]
    );

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
    }, []);

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent, show: TVShow) => {
            if (!touchStart) return;
            const touchEnd = e.changedTouches[0];
            const deltaX = Math.abs(touchEnd.clientX - touchStart.x);
            const deltaY = Math.abs(touchEnd.clientY - touchStart.y);
            if (deltaX < 10 && deltaY < 10) {
                e.preventDefault();
                handleShowInfo(show, e);
            }
            setTouchStart(null);
        },
        [touchStart, handleShowInfo]
    );

    const handleClosePlayer = useCallback(() => {
        setShowPlayer(false);
        setSelectedShow(null);
        setShowEpisodeSelector(false);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {[...Array(limit)].map((_, i) => (
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
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (shows.length === 0) {
        return (
            <div className="text-center py-12">
                <Tv className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                    {originCountry === 'JP'
                        ? 'Nenhum anime encontrado'
                        : originCountry === 'KR'
                            ? 'Nenhum dorama encontrado'
                            : 'Nenhuma série encontrada'}
                </p>
            </div>
        );
    }

    return (
        <>
            {isLoadingDetails && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-gray-900 rounded-lg p-6 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                        <span className="text-white">Carregando detalhes...</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {shows.map((show) => {
                    const title = show.title || show.name;
                    const year = show.first_air_date?.split('-')[0] || 'Em breve';
                    const posterUrl = show.poster_path
                        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                        : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

                    return (
                        <div
                            key={show.id}
                            className="group cursor-pointer transition-transform duration-300 active:scale-95 hover:scale-105 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]"
                            onClick={(e) => handleShowInfo(show, e)}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={(e) => handleTouchEnd(e, show)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleShowInfo(show, e);
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
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <div className="bg-indigo-600 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform shadow-lg shadow-indigo-600/50">
                                        <Play className="w-6 h-6 text-white fill-current" />
                                    </div>
                                </div>

                                {/* ⭐ Rating — canto superior direito */}
                                {show.vote_average && show.vote_average > 0 && (
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <span className="text-white text-xs font-semibold">
                                            {show.vote_average.toFixed(1)}
                                        </span>
                                    </div>
                                )}

                                {/* 🏷️ Bandeira/ícone — canto superior esquerdo */}
                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                                    {originCountry === 'JP' ? (
                                        <span className="text-orange-400 text-xs">🇯🇵</span>
                                    ) : originCountry === 'KR' ? (
                                        <span className="text-indigo-400 text-xs">🇰🇷</span>
                                    ) : (
                                        <Tv className="w-3 h-3 text-indigo-500" />
                                    )}
                                </div>

                                {/* 🔖 Watchlist — acima da barra de título */}
                                {/* No mobile fica sempre visível; no desktop aparece no hover */}
                                <div
                                    className="absolute bottom-16 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                >
                                    <WatchlistButton
                                        id={show.id}
                                        mediaType="tv"
                                        title={title}
                                        posterPath={show.poster_path}
                                        voteAverage={show.vote_average}
                                        releaseDate={show.first_air_date}
                                        category={mediaCategory}
                                    />
                                </div>

                                {/* 📝 Barra de título — canto inferior */}
                                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center">
                                    <div className="space-y-0.5">
                                        <div className="text-white text-sm font-semibold truncate">
                                            {title}
                                        </div>
                                        <div className="text-indigo-400 text-xs">{year}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showPlayer && selectedShow && (
                <VideoPlayer
                    tvId={selectedShow.id}
                    imdbId={selectedShow.imdb_id}
                    title={selectedShow.title || selectedShow.name}
                    season={selectedSeason}
                    episode={selectedEpisode}
                    seasons={selectedShow.seasons || []}
                    onClose={handleClosePlayer}
                    autoPlay={true}
                />
            )}
        </>
    );
};

export default TVShowsGrid;