'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Play, Star, Tv, AlertCircle } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface TVShow {
    id: number;
    title: string;
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

interface TVShowsGridProps {
    category?: 'popular' | 'top_rated' | 'airing_today' | 'on_the_air';
    limit?: number;
}

const TVShowsGrid = ({ category = 'popular', limit = 10 }: TVShowsGridProps) => {
    const [shows, setShows] = useState<TVShow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
    const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

    // Remova o useCallback e a função fetchTVShows externa

    useEffect(() => {
        const fetchTVShows = async () => {
            try {
                setLoading(true);
                setError(null);

                let endpoint = '';
                switch (category) {
                    case 'popular':
                        endpoint = '/api/tv/popular';
                        break;
                    case 'top_rated':
                        endpoint = '/api/tv/top-rated';
                        break;
                    case 'airing_today':
                        endpoint = '/api/tv/airing-today';
                        break;
                    case 'on_the_air':
                        endpoint = '/api/tv/on-the-air';
                        break;
                    default:
                        endpoint = '/api/tv/popular';
                }

                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setShows(data.slice(0, limit));
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Erro ao buscar séries');
                console.error('Erro ao buscar séries:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTVShows();
    }, [category, limit]); // ✅ Dependências diretas

    // Handler para assistir série
    const handleWatchShow = useCallback((show: TVShow, season?: number, episode?: number, event?: React.MouseEvent | React.TouchEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        setTimeout(() => {
            setSelectedShow(show);
            if (season) setSelectedSeason(season);
            if (episode) setSelectedEpisode(episode);
            setShowPlayer(true);
            setShowEpisodeSelector(false);
        }, 10);
    }, []);


    // Touch handlers para mobile
    const handleTouchStart = useCallback((e: React.TouchEvent, show: TVShow) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent, show: TVShow) => {
        if (!touchStart) return;

        const touchEnd = e.changedTouches[0];
        const deltaX = Math.abs(touchEnd.clientX - touchStart.x);
        const deltaY = Math.abs(touchEnd.clientY - touchStart.y);

        if (deltaX < 10 && deltaY < 10) {
            e.preventDefault();
            handleWatchShow(show, 1, 1, e);
        }

        setTouchStart(null);
    }, [touchStart, handleWatchShow]);

    const handleClosePlayer = useCallback(() => {
        setShowPlayer(false);
        setSelectedShow(null);
        setShowEpisodeSelector(false);
    }, []);

    // Loading skeleton
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

    // Error state
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

    // Empty state
    if (shows.length === 0) {
        return (
            <div className="text-center py-12">
                <Tv className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma série encontrada</p>
            </div>
        );
    }

    return (
        <>
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
                            className="group cursor-pointer transition-transform duration-300 active:scale-95 hover:scale-105"
                            onClick={(e) => handleWatchShow(show, 1, 1, e)}
                            onTouchStart={(e) => handleTouchStart(e, show)}
                            onTouchEnd={(e) => handleTouchEnd(e, show)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleWatchShow(show, 1, 1);
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

                                {/* Overlay do play button */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        className="bg-indigo-600 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform pointer-events-none"
                                        aria-label={`Assistir ${title}`}
                                    >
                                        <Play className="w-6 h-6 text-white fill-current" />
                                    </button>
                                </div>

                                {/* Badge de avaliação */}
                                {show.vote_average && show.vote_average > 0 && (
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <span className="text-white text-xs font-semibold">
                                            {show.vote_average.toFixed(1)}
                                        </span>
                                    </div>
                                )}

                                {/* Badge de tipo */}
                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                                    <Tv className="w-3 h-3 text-indigo-500" />
                                </div>

                                {/* Badge de episódios (placeholder) */}
                                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center">
                                    <div className="space-y-0.5">
                                        <div className="text-white text-sm font-semibold truncate">
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

            {/* Seletor de episódios (simplificado - você pode expandir depois) */}
            {showEpisodeSelector && selectedShow && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
                        <h3 className="text-white text-xl font-bold mb-4">
                            {selectedShow.title || selectedShow.name}
                        </h3>
                        <p className="text-gray-400 mb-4">
                            Selecione a temporada e episódio
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-white text-sm block mb-2">Temporada</label>
                                <select
                                    value={selectedSeason}
                                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(season => (
                                        <option key={season} value={season}>
                                            Temporada {season}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-white text-sm block mb-2">Episódio</label>
                                <select
                                    value={selectedEpisode}
                                    onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2"
                                >
                                    {[...Array(24)].map((_, episode) => (
                                        <option key={episode + 1} value={episode + 1}>
                                            Episódio {episode + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => handleWatchShow(selectedShow, selectedSeason, selectedEpisode)}
                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Assistir
                                </button>
                                <button
                                    onClick={() => setShowEpisodeSelector(false)}
                                    className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Player */}
            {showPlayer && selectedShow && (
                <VideoPlayer
                    tvId={selectedShow.id}
                    title={selectedShow.title || selectedShow.name}
                    season={selectedSeason}
                    episode={selectedEpisode}
                    onClose={handleClosePlayer}
                    autoPlay={true}
                />
            )}
        </>
    );
};

export default TVShowsGrid;