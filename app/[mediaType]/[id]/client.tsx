'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Star, Info, Film, Clock, ChevronDown, Play, Loader2, Tv, ArrowLeft } from 'lucide-react';
import { cn } from "@/app/lib/utils";
import VideoPlayer from "@/app/components/video-player";

interface Genre {
    id: number;
    name: string;
}

interface Season {
    id: number;
    season_number: number;
    name: string;
    overview: string;
    poster_path: string | null;
    episode_count: number;
    air_date: string | null;
}

interface Episode {
    id: number;
    episode_number: number;
    name: string;
    overview: string;
    still_path: string | null;
    runtime: number | null;
    air_date: string | null;
}

interface MovieDetails {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path?: string;
    overview?: string;
    release_date?: string;
    imdb_id?: string;
    vote_average?: number;
    vote_count?: number;
    genre_ids?: number[];
    genres?: Genre[];
    runtime?: number;
}

interface TVDetails {
    id: number;
    name: string;
    title?: string;
    poster_path: string;
    backdrop_path?: string;
    overview?: string;
    first_air_date?: string;
    imdb_id?: string;
    vote_average?: number;
    vote_count?: number;
    genre_ids?: number[];
    genres?: Genre[];
    seasons?: Season[];
    number_of_seasons?: number;
    number_of_episodes?: number;
    status?: string;
}

interface Props {
    initialData: any ;
    mediaType: string;
    id: string;
}

export default function MediaInfoClient({ initialData, mediaType, id }: Props) {
    const router = useRouter();

    const [movieData, setMovieData] = useState<MovieDetails | null>(
        mediaType === 'movie' && initialData?.id ? initialData : null
    );
    const [tvData, setTvData] = useState<TVDetails | null>(
        mediaType === 'tv' && initialData?.id ? initialData : null
    );
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(!initialData);
    const [loadingGenres, setLoadingGenres] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para episódios (séries)
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [isSeasonOpen, setIsSeasonOpen] = useState(false);
    const [episodesCache, setEpisodesCache] = useState<Record<number, Episode[]>>({});
    const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
    const [hasLoadedAll, setHasLoadedAll] = useState(false);

    // Estado para o player
    const [showPlayer, setShowPlayer] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
    const [selectedTV, setSelectedTV] = useState<TVDetails | null>(null);
    const [selectedEpisodeNum, setSelectedEpisodeNum] = useState<number>(1);

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const generateMockEpisodes = (count: number): Episode[] => {
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            episode_number: i + 1,
            name: `Episódio ${i + 1}`,
            overview: `Sinopse do episódio ${i + 1}`,
            still_path: null,
            runtime: 45,
            air_date: new Date().toISOString().split('T')[0],
        }));
    };

    // Buscar gêneros baseado no tipo de mídia
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const endpoint = mediaType === 'movie' ? '/api/movies/genres' : '/api/tv/genres';
                const response = await fetch(endpoint);
                const data = await response.json();

                if (data && Array.isArray(data)) {
                    setGenres(data);
                } else {
                    setGenres([]);
                }
            } catch (error) {
                console.error('Erro ao buscar gêneros:', error);
                setGenres([]);
            } finally {
                setLoadingGenres(false);
            }
        };

        if (mediaType) {
            fetchGenres();
        }
    }, [mediaType]);

    useEffect(() => {
        const fetchMediaDetails = async () => {
            // Se já temos dados iniciais, não precisa buscar
            if ((mediaType === 'movie' && movieData) || (mediaType === 'tv' && tvData)) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                if (mediaType === 'movie') {
                    const response = await fetch(`/api/movies/${id}`);
                    const data = await response.json();

                    if (data.id) {
                        setMovieData(data);
                    } else {
                        throw new Error('Filme não encontrado');
                    }
                }
                else if (mediaType === 'tv') {
                    const response = await fetch(`/api/tv/${id}`);
                    const data = await response.json();

                    if (data.id) {
                        setTvData(data);

                        // Definir temporada inicial
                        if (data.seasons && data.seasons.length > 0) {
                            const firstRealSeason = data.seasons.find((s: Season) => s.season_number !== 0);
                            if (firstRealSeason) {
                                setSelectedSeason(firstRealSeason.season_number);
                            }
                        }
                    } else {
                        throw new Error('Série não encontrada');
                    }
                }
                else {
                    throw new Error('Tipo de mídia inválido');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar informações');
                console.error('Erro:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id && mediaType) {
            fetchMediaDetails();
        }
    }, [id, mediaType, movieData, tvData]);

    // Buscar episódios para séries
    useEffect(() => {
        if (mediaType !== 'tv' || !tvData?.seasons?.length || hasLoadedAll) return;

        const fetchAllEpisodes = async () => {
            setIsLoadingEpisodes(true);
            try {
                const cache: Record<number, Episode[]> = {};
                const validSeasons = tvData.seasons!.filter(
                    (season: Season) => season.season_number !== 0
                );

                const fetchPromises = validSeasons.map(async (season: Season) => {
                    try {
                        const response = await fetch(`/api/tv/${tvData.id}/season/${season.season_number}`);
                        if (response.ok) {
                            const data = await response.json();
                            const episodes: Episode[] = data.episodes?.map((ep: Episode) => ({
                                id: ep.id,
                                episode_number: ep.episode_number,
                                name: ep.name?.replace('Episode ', 'Episódio ') || `Episódio ${ep.episode_number}`,
                                overview: ep.overview || '',
                                still_path: ep.still_path || null,
                                runtime: ep.runtime || null,
                                air_date: ep.air_date || null,
                            })) || [];
                            cache[season.season_number] = episodes;
                        } else {
                            cache[season.season_number] = generateMockEpisodes(season.episode_count);
                        }
                    } catch (error) {
                        console.error(`Erro na temporada ${season.season_number}:`, error);
                        cache[season.season_number] = generateMockEpisodes(season.episode_count);
                    }
                });

                await Promise.all(fetchPromises);
                setEpisodesCache(cache);
                setHasLoadedAll(true);
            } catch (error) {
                console.error('Erro ao buscar episódios:', error);
            } finally {
                setIsLoadingEpisodes(false);
            }
        };

        fetchAllEpisodes();
    }, [mediaType, tvData, hasLoadedAll]);

    const getGenreNames = (): string[] => {
        let genresList: string[] = [];

        if (mediaType === 'movie' && movieData?.genres && Array.isArray(movieData.genres)) {
            genresList = movieData.genres.map((g: Genre) => g.name);
        }
        else if (mediaType === 'tv' && tvData?.genres && Array.isArray(tvData.genres)) {
            genresList = tvData.genres.map((g: Genre) => g.name);
        }
        else if (mediaType === 'movie' && movieData?.genre_ids && Array.isArray(movieData.genre_ids)) {
            genresList = movieData.genre_ids
                .map((id: number) => genres.find((g: Genre) => g.id === id)?.name)
                .filter((name): name is string => Boolean(name));
        }
        else if (mediaType === 'tv' && tvData?.genre_ids && Array.isArray(tvData.genre_ids)) {
            genresList = tvData.genre_ids
                .map((id: number) => genres.find((g: Genre) => g.id === id)?.name)
                .filter((name): name is string => Boolean(name));
        }

        return genresList.length > 0 ? genresList : ['Geral'];
    };

    const genreNames = getGenreNames();

    // Dados do filme
    const movieTitle = movieData?.title;
    const movieYear = movieData?.release_date?.split('-')[0] || 'Em breve';
    const movieRating = movieData?.vote_average?.toFixed(1) || 'N/A';
    const movieVoteCount = movieData?.vote_count?.toLocaleString() || '0';
    const movieRuntime = movieData?.runtime;
    const movieOverview = movieData?.overview;
    const moviePoster = movieData?.poster_path;
    const movieBackdrop = movieData?.backdrop_path;

    // Dados da série
    const tvTitle = tvData?.name || tvData?.title;
    const tvYear = tvData?.first_air_date?.split('-')[0] || 'Em breve';
    const tvRating = tvData?.vote_average?.toFixed(1) || 'N/A';
    const tvVoteCount = tvData?.vote_count?.toLocaleString() || '0';
    const tvOverview = tvData?.overview;
    const tvPoster = tvData?.poster_path;
    const tvBackdrop = tvData?.backdrop_path;
    const tvStatus = tvData?.status;
    const tvSeasons = tvData?.seasons?.filter((s: Season) => s.season_number !== 0) || [];
    const currentEpisodes = episodesCache[selectedSeason] || [];

    const formatRuntime = (minutes?: number) => {
        if (!minutes) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}min`;
        return `${hours}h ${mins}min`;
    };

    const handleWatch = () => {
        if (mediaType === 'movie' && movieData) {
            setSelectedMovie(movieData);
            setShowPlayer(true);
        }
    };

    const handleWatchEpisode = (seasonNum: number, episodeNum: number) => {
        if (tvData) {
            setSelectedTV(tvData);
            setSelectedSeason(seasonNum);
            setSelectedEpisodeNum(episodeNum);
            setShowPlayer(true);
        }
    };

    const handleClosePlayer = () => {
        setShowPlayer(false);
        setSelectedMovie(null);
        setSelectedTV(null);
    };

    const handleBack = () => {
        router.back();
    };

    if (loading || loadingGenres) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Carregando informações...</p>
                </div>
            </div>
        );
    }

    if (error || (mediaType === 'movie' && !movieData) || (mediaType === 'tv' && !tvData)) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">!</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Erro ao carregar</h2>
                    <p className="text-gray-400 mb-6">{error || 'Conteúdo não encontrado'}</p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    // Renderizar filme
    if (mediaType === 'movie' && movieData) {
        return (
            <>
                <div className="min-h-screen">
                    {movieBackdrop && (
                        <div className="fixed inset-0 opacity-20 pointer-events-none">
                            <img
                                src={`https://image.tmdb.org/t/p/original${movieBackdrop}`}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
                        </div>
                    )}

                    <div className="sticky top-0 z-20 bg-black/50 backdrop-blur-md border-b border-white/10">
                        <div className="container mx-auto px-4 py-3">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Voltar</span>
                            </button>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-shrink-0 w-56 lg:w-64 mx-auto lg:mx-0">
                                <img
                                    src={moviePoster
                                        ? `https://image.tmdb.org/t/p/w500${moviePoster}`
                                        : 'https://via.placeholder.com/500x750?text=Sem+Imagem'
                                    }
                                    alt={movieTitle}
                                    className="w-full rounded-xl shadow-lg"
                                />
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                                    {movieTitle}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    {movieYear !== 'Em breve' && (
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{movieYear}</span>
                                        </div>
                                    )}
                                    {formatRuntime(movieRuntime) && (
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatRuntime(movieRuntime)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        <span>{movieRating}</span>
                                        <span className="text-gray-500">({movieVoteCount} votos)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Film className="w-4 h-4" />
                                        <span>Filme</span>
                                    </div>
                                </div>

                                {genreNames.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {genreNames.map((genre, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 text-xs rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                                            >
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-indigo-500" />
                                        Sinopse
                                    </h2>
                                    <p className="text-gray-300 text-base leading-relaxed">
                                        {movieOverview || 'Sinopse não disponível.'}
                                    </p>
                                </div>

                                <button
                                    onClick={handleWatch}
                                    className="px-8 py-3 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Assistir Agora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Player */}
                {showPlayer && selectedMovie && (
                    <VideoPlayer
                        movieId={selectedMovie.id}
                        imdbId={selectedMovie.imdb_id}
                        title={selectedMovie.title}
                        onClose={handleClosePlayer}
                        autoPlay={true}
                    />
                )}
            </>
        );
    }

    // Renderizar série
    if (mediaType === 'tv' && tvData) {
        return (
            <>
                <div className="min-h-screen">
                    {tvBackdrop && (
                        <div className="fixed inset-0 opacity-20 pointer-events-none">
                            <img
                                src={`https://image.tmdb.org/t/p/original${tvBackdrop}`}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
                        </div>
                    )}

                    <div className="sticky top-0 z-20 bg-black/50 backdrop-blur-md border-b border-white/10">
                        <div className="container mx-auto px-4 py-3">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Voltar</span>
                            </button>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col lg:flex-row gap-8 mb-8">
                            <div className="flex-shrink-0 w-56 lg:w-64 mx-auto lg:mx-0">
                                <img
                                    src={tvPoster
                                        ? `https://image.tmdb.org/t/p/w500${tvPoster}`
                                        : 'https://via.placeholder.com/500x750?text=Sem+Imagem'
                                    }
                                    alt={tvTitle}
                                    className="w-full rounded-xl shadow-lg"
                                />
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                                    {tvTitle}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    {tvYear !== 'Em breve' && (
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{tvYear}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        <span>{tvRating}</span>
                                        <span className="text-gray-500">({tvVoteCount} votos)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Tv className="w-4 h-4" />
                                        <span>Série</span>
                                    </div>
                                    {tvData.number_of_seasons && (
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Film className="w-4 h-4" />
                                            <span>{tvData.number_of_seasons} temporadas</span>
                                        </div>
                                    )}
                                </div>

                                {tvStatus && (
                                    <div className="mb-4">
                                        <span className={cn(
                                            "px-2 py-1 text-xs rounded-full",
                                            tvStatus === 'Returning Series'
                                                ? "bg-green-600/20 text-green-400 border border-green-500/30"
                                                : "bg-gray-600/20 text-gray-400 border border-gray-500/30"
                                        )}>
                                            {tvStatus === 'Returning Series' ? 'Em exibição' : tvStatus}
                                        </span>
                                    </div>
                                )}

                                {genreNames.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {genreNames.map((genre, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 text-xs rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                                            >
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-indigo-500" />
                                        Sinopse
                                    </h2>
                                    <p className="text-gray-300 text-base leading-relaxed">
                                        {tvOverview || 'Sinopse não disponível.'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsSeasonOpen(!isSeasonOpen)}
                                            className="bg-indigo-500/50 border cursor-pointer border-white/10 hover:bg-indigo-500/70 text-white rounded-md px-5 py-2.5 flex items-center gap-3 transition-all"
                                        >
                                            <span className="font-semibold">Temporada {selectedSeason}</span>
                                            <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isSeasonOpen && "rotate-180")} />
                                        </button>

                                        {isSeasonOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsSeasonOpen(false)}
                                                />
                                                <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                                    <div className="p-3 border-b border-white/5 bg-white/5">
                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-300/60">
                                                            {tvSeasons.length} Temporadas
                                                        </span>
                                                    </div>
                                                    <div className="max-h-60 overflow-auto custom-scrollbar">
                                                        <div className="p-2 space-y-1">
                                                            {tvSeasons.map((season: Season) => (
                                                                <button
                                                                    key={season.id}
                                                                    onClick={() => {
                                                                        setSelectedSeason(season.season_number);
                                                                        setIsSeasonOpen(false);
                                                                    }}
                                                                    className={cn(
                                                                        "w-full cursor-pointer text-left px-4 py-3 rounded-xl text-sm transition-all",
                                                                        selectedSeason === season.season_number
                                                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                                                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                                                                    )}
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-bold">Temporada {season.season_number}</span>
                                                                        <span className="text-[10px] opacity-60">{season.episode_count} eps</span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Episódios */}
                        {tvSeasons.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-white/10">
                                {isLoadingEpisodes && !hasLoadedAll ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                        <p className="text-indigo-300/60">Carregando episódios...</p>
                                    </div>
                                ) : (
                                    <div
                                        ref={scrollContainerRef}
                                        className="overflow-y-hidden overflow-x-hidden custom-scrollbar"
                                    >
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                            {currentEpisodes.map((episode) => (
                                                <button
                                                    key={episode.id}
                                                    onClick={() => handleWatchEpisode(selectedSeason, episode.episode_number)}
                                                    className="group cursor-pointer relative aspect-video rounded-xl overflow-hidden transition-all duration-300 border-2 border-white/5 hover:border-indigo-500/50 hover:scale-[1.02] hover:shadow-lg"
                                                >
                                                    <div className="absolute inset-0">
                                                        {episode.still_path ? (
                                                            <img
                                                                src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                                                                alt={episode.name}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                                                <Tv className="w-8 h-8 text-gray-600" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="absolute inset-0 cursor-pointer bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                                        <div className="bg-white rounded-full p-2 transform scale-90 group-hover:scale-100 transition-all">
                                                            <Play className="w-6 h-6 text-indigo-600 fill-indigo-600 ml-0.5" />
                                                        </div>
                                                    </div>

                                                    <div className="absolute top-2 left-2 bg-black/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">
                                                            {episode.episode_number}
                                                        </span>
                                                    </div>
                                                    {episode.runtime && (
                                                        <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm rounded-full px-2 py-1">
                                                            <span className="text-white text-xs font-medium">
                                                                {episode.runtime} min
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                                        <p className="text-white text-xs font-medium truncate">
                                                            {episode.name}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {currentEpisodes.length === 0 && (
                                            <div className="text-center py-12">
                                                <p className="text-gray-400">Nenhum episódio disponível para esta temporada.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Player for TV Show */}
                {showPlayer && selectedTV && (
                    <VideoPlayer
                        tvId={selectedTV.id}
                        imdbId={selectedTV.imdb_id}
                        title={selectedTV.name || selectedTV.title || "Série"}
                        season={selectedSeason}
                        episode={selectedEpisodeNum}
                        seasons={selectedTV.seasons || []}
                        onClose={handleClosePlayer}
                        autoPlay={true}
                    />
                )}
            </>
        );
    }

    return null;
}