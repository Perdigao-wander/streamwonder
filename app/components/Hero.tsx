'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Info, Pause } from 'lucide-react';
import VideoPlayer from '@/app/components/video-player/index';
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Movie {
    id: number;
    title: string;
    overview: string;
    backdrop_path: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    imdb_id?: string | null;
}

const AUTOPLAY_DELAY = 6000;
const TRANSITION_DURATION = 600;

const Hero = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(0);
    const [autoplayActive, setAutoplayActive] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [progressWidth, setProgressWidth] = useState(0);
    const [isTouching, setIsTouching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);

    // Estados para o player
    const [showPlayer, setShowPlayer] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const router = useRouter();
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Buscar filmes
    useEffect(() => {
        const fetchPopularMovies = async () => {
            try {
                const response = await fetch('/api/movies/popular');
                const data = await response.json();
                setMovies(data.slice(0, 8));
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar filmes:', error);
                setLoading(false);
            }
        };
        fetchPopularMovies();
    }, []);

    // Efeito para animação de zoom
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAnimate(false);
        const t = setTimeout(() => setAnimate(true), 50);
        return () => clearTimeout(t);
    }, [currentIndex]);

    // Resetar barra de progresso
    const resetProgress = useCallback(() => {
        setProgressWidth(0);
        if (progressInterval.current) clearInterval(progressInterval.current);
    }, []);

    // Navegação para um slide específico
    const goToSlide = useCallback((index: number, slideDirection: 'left' | 'right' = 'right') => {
        if (index === currentIndex || isTransitioning || movies.length === 0) return;

        setIsTransitioning(true);
        setDirection(slideDirection);
        setPreviousIndex(currentIndex);
        setCurrentIndex(index);
        resetProgress();

        setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    }, [currentIndex, isTransitioning, movies.length, resetProgress]);

    // Próximo slide
    const nextSlide = useCallback(() => {
        if (movies.length <= 1 || isTransitioning) return;
        const newIndex = (currentIndex + 1) % movies.length;
        goToSlide(newIndex, 'right');
    }, [currentIndex, movies.length, goToSlide, isTransitioning]);

    // Slide anterior
    const prevSlide = useCallback(() => {
        if (movies.length <= 1 || isTransitioning) return;
        const newIndex = (currentIndex - 1 + movies.length) % movies.length;
        goToSlide(newIndex, 'left');
    }, [currentIndex, movies.length, goToSlide, isTransitioning]);

    // Autoplay com barra de progresso
    useEffect(() => {
        if (autoplayActive && movies.length > 0 && !isTouching && !isTransitioning) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            resetProgress();
            const interval = 16;
            const increment = 100 / (AUTOPLAY_DELAY / interval);

            progressInterval.current = setInterval(() => {
                setProgressWidth(prev => {
                    if (prev >= 100) {
                        nextSlide();
                        return 0;
                    }
                    return prev + increment;
                });
            }, interval);
        }
        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, [autoplayActive, currentIndex, movies.length, isTouching, isTransitioning, nextSlide, resetProgress]);

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        setIsTouching(true);
        resetProgress();
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        setIsTouching(false);
        const touchDiff = touchStartX.current - touchEndX.current;
        if (Math.abs(touchDiff) > 50) {
            if (touchDiff > 0) nextSlide();
            else prevSlide();
        }
    };

    // Ações dos botões
    const handleWatchMovie = useCallback(async (movie: Movie) => {
        setIsLoadingDetails(true);
        try {
            const response = await fetch(`/api/movies/${movie.id}`);
            if (!response.ok) throw new Error('Erro ao buscar detalhes');
            const data = await response.json();
            setSelectedMovie({ ...movie, imdb_id: data.imdb_id });
        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
            setSelectedMovie({ ...movie, imdb_id: null });
        } finally {
            setShowPlayer(true);
            setIsLoadingDetails(false);
        }
    }, []);

    const handleShowInfo = useCallback((movie: Movie, event?: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        router.push(`/movie/${movie.id}`);
    }, [router]);

    // Determinar posição do slide para animação
    const getSlidePosition = (index: number) => {
        if (index === currentIndex) return 'center';
        if (index === (currentIndex + 1) % movies.length) return 'right';
        if (index === (currentIndex - 1 + movies.length) % movies.length) return 'left';
        return 'offscreen';
    };

    // Loading
    if (loading) {
        return (
            <div className="relative h-[40vh] md:h-[80vh] w-full overflow-hidden bg-gradient-to-r from-gray-900 to-gray-950 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (movies.length === 0) return null;

    const currentMovie = movies[currentIndex];
    const year = currentMovie.release_date?.split('-')[0] || 'Em breve';

    return (
        <>
            <section
                className="relative w-full h-[40vh] md:h-[80vh] overflow-hidden shadow-2xl group mt-20"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Barra de Progresso */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 z-30">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-100 ease-linear"
                        style={{ width: `${progressWidth}%` }}
                    />
                </div>

                {/* Controles Superiores (dots + autoplay) */}
                <div className="absolute top-4 right-4 z-30 flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                    <div className="flex gap-1.5 items-center">
                        {movies.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index, index > currentIndex ? 'right' : 'left')}
                                className={cn(
                                    "transition-all duration-300 rounded-full",
                                    index === currentIndex
                                        ? "w-8 h-2 bg-indigo-500"
                                        : "w-2 h-2 bg-white/50 hover:bg-white/80"
                                )}
                                aria-label={`Slide ${index + 1}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => setAutoplayActive(!autoplayActive)}
                        className="text-white hover:text-indigo-400 transition-colors"
                    >
                        {autoplayActive ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                </div>

                {/* Container dos Slides */}
                <div className="relative w-full h-full">
                    {movies.map((movie, index) => {
                        const isCurrent = index === currentIndex;
                        const isPrevious = index === previousIndex;
                        const position = getSlidePosition(index);

                        if (position === 'offscreen' && !isPrevious) return null;

                        let animationClass = '';
                        if (isCurrent && previousIndex !== currentIndex) {
                            animationClass = direction === 'right'
                                ? 'animate-slide-from-right'
                                : 'animate-slide-from-left';
                        } else if (isPrevious && previousIndex !== currentIndex) {
                            animationClass = direction === 'right'
                                ? 'animate-slide-to-left'
                                : 'animate-slide-to-right';
                        }

                        return (
                            <div
                                key={movie.id}
                                className={cn(
                                    "absolute inset-0 w-full h-full transition-opacity duration-700",
                                    isCurrent ? "z-20 opacity-100" : "z-10 opacity-0",
                                    animationClass
                                )}
                            >
                                <div className="relative w-full h-full overflow-hidden">
                                    <img
                                        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                                        alt={movie.title}
                                        className={cn(
                                            "w-full h-full object-cover object-center transition-transform duration-[10000ms] ease-out",
                                            animate && isCurrent ? "scale-110" : "scale-100"
                                        )}
                                        draggable={false}
                                    />
                                    {/* Gradientes sobrepostos */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
                                </div>

                                {/* Conteúdo do Slide */}
                                <div className="absolute inset-0 flex flex-col justify-center">
                                    <div className="container mx-auto px-6 md:px-12 text-white z-20">
                                        <div
                                            className={cn(
                                                "w-full transition-all duration-1000 delay-300",
                                                isCurrent ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                                            )}
                                        >
                                            {/* Badge */}
                                            <div className="inline-block px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm mb-4">
                                                Destaque da Semana
                                            </div>

                                            {/* Título */}
                                            <h2 className="text-2xl md:text-6xl lg:text-6xl font-black max-w-2xl leading-tight">
                                                {movie.title}
                                            </h2>

                                            {/* Informações */}
                                            <div className="flex items-center gap-4 text-sm md:text-base mt-4">
                                                <span className="text-gray-300">{year}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-yellow-500">★</span>
                                                    <span className="text-gray-300">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                                                </div>
                                                <span className="text-gray-300">HD</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-indigo-400">●</span>
                                                    <span className="text-gray-300">4K</span>
                                                </div>
                                            </div>

                                            {/* Descrição */}
                                            <p className="text-gray-300 text-sm md:text-lg max-w-xl line-clamp-2 md:line-clamp-4 mt-4">
                                                {movie.overview || 'Sinopse não disponível.'}
                                            </p>

                                            {/* Botões */}
                                            <div className="flex gap-4 mt-6 md:mt-8">
                                                <button
                                                    onClick={() => handleWatchMovie(movie)}
                                                    className="group relative px-6 md:px-8 py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                    <div className="relative flex items-center gap-2 text-white font-semibold text-sm md:text-base">
                                                        <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                                                        Assistir Agora
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={(e) => handleShowInfo(movie, e)}
                                                    className="group relative px-6 md:px-8 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden border border-white/20"
                                                >
                                                    <div className="relative flex items-center gap-2 text-white font-semibold text-sm md:text-base">
                                                        <Info className="w-4 h-4 md:w-5 md:h-5" />
                                                        Mais Informações
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Setas de Navegação */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 hidden md:flex"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 hidden md:flex"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </section>

            {/* Video Player e Loading */}
            {showPlayer && selectedMovie && (
                <VideoPlayer
                    movieId={selectedMovie.id}
                    imdbId={selectedMovie.imdb_id}
                    title={selectedMovie.title}
                    onClose={() => {
                        setShowPlayer(false);
                        setSelectedMovie(null);
                    }}
                    autoPlay={true}
                />
            )}
            {isLoadingDetails && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-gray-900 rounded-lg p-6 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                        <span className="text-white">Carregando detalhes...</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default Hero;