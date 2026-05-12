"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Movie {
    id: number;
    title: string;
    overview: string;
    backdrop_path: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
}

const Hero = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [nextSlide, setNextSlide] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    const handlePrevSlide = () => {
        if (isTransitioning) return;
        setDirection('left');
        setIsTransitioning(true);
        const newIndex = (currentSlide - 1 + movies.length) % movies.length;
        setNextSlide(newIndex);

        setTimeout(() => {
            setCurrentSlide(newIndex);
            setNextSlide(null);
            setIsTransitioning(false);
        }, 500);

        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 500);
    };

    const handleNextSlide = () => {
        if (isTransitioning) return;
        setDirection('right');
        setIsTransitioning(true);
        const newIndex = (currentSlide + 1) % movies.length;
        setNextSlide(newIndex);

        setTimeout(() => {
            setCurrentSlide(newIndex);
            setNextSlide(null);
            setIsTransitioning(false);
        }, 500);

        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 500);
    };

    const goToSlide = (index: number) => {
        if (isTransitioning || index === currentSlide) return;
        setDirection(index > currentSlide ? 'right' : 'left');
        setIsTransitioning(true);
        setNextSlide(index);

        setTimeout(() => {
            setCurrentSlide(index);
            setNextSlide(null);
            setIsTransitioning(false);
        }, 500);

        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    // Buscar filmes populares
    useEffect(() => {
        const fetchPopularMovies = async () => {
            try {
                const response = await fetch('/api/movies/popular');
                const data = await response.json();
                setMovies(data.slice(0, 5));
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar filmes:', error);
                setLoading(false);
            }
        };
        fetchPopularMovies();
    }, []);


    // Auto-play do carrossel
    useEffect(() => {
        if (!isAutoPlaying || movies.length === 0) return;

        const interval = setInterval(() => {
            handleNextSlide();
        }, 8000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, movies.length]);

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

    const currentMovie = movies[currentSlide];
    const nextMovie = nextSlide !== null ? movies[nextSlide] : null;
    const year = currentMovie.release_date?.split('-')[0] || 'Em breve';

    return (
        <div className="relative h-[40vh] md:h-[80vh] w-full overflow-hidden group">
            {/* Container de imagens com efeito de transição */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Imagem atual */}
                <div
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        isTransitioning
                            ? direction === 'right'
                                ? '-translate-x-full opacity-0 scale-105'
                                : 'translate-x-full opacity-0 scale-105'
                            : 'translate-x-0 opacity-100 scale-100'
                    }`}
                >
                    <img
                        src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
                        alt={currentMovie.title}
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                {/* Próxima imagem (para transição suave) */}
                {nextMovie && (
                    <div
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                            isTransitioning
                                ? direction === 'right'
                                    ? 'translate-x-0 opacity-100 scale-100'
                                    : 'translate-x-0 opacity-100 scale-100'
                                : direction === 'right'
                                    ? 'translate-x-full opacity-0 scale-95'
                                    : '-translate-x-full opacity-0 scale-95'
                        }`}
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/original${nextMovie.backdrop_path}`}
                            alt={nextMovie.title}
                            className="w-full h-full object-cover object-center"
                        />
                    </div>
                )}

                {/* Gradientes sobrepostos */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
            </div>

            {/* Conteúdo com animação de fade e slide */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start space-y-4 md:space-y-6">
                <div
                    key={`content-${currentSlide}`}
                    className="animate-fade-in-up"
                >
                    {/* Badge com animação */}
                    <div className="inline-block px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm animate-fade-in-up animation-delay-100">
                        Destaque da Semana
                    </div>

                    {/* Título com animação */}
                    <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white max-w-2xl leading-tight mt-4 animate-fade-in-up animation-delay-200">
                        {currentMovie.title}
                    </h1>

                    {/* Informações com animação */}
                    <div className="flex items-center gap-4 text-sm md:text-base mt-4 animate-fade-in-up animation-delay-300">
                        <span className="text-gray-300">{year}</span>
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-gray-300">{currentMovie.vote_average?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <span className="text-gray-300">HD</span>
                        <div className="flex items-center gap-1">
                            <span className="text-indigo-400">●</span>
                            <span className="text-gray-300">4K</span>
                        </div>
                    </div>

                    {/* Descrição com animação */}
                    <p className="text-gray-300 text-sm md:text-lg max-w-xl line-clamp-3 md:line-clamp-4 mt-4 animate-fade-in-up animation-delay-400">
                        {currentMovie.overview || 'Sinopse não disponível.'}
                    </p>
                </div>
            </div>

            {/* Botões de navegação com efeito de hover melhorado */}
            <button
                onClick={handlePrevSlide}
                disabled={isTransitioning}
                className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-indigo-600/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hidden md:block z-20"
                aria-label="Slide anterior"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                onClick={handleNextSlide}
                disabled={isTransitioning}
                className="absolute right-4 cursor-pointer top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-indigo-600/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hidden md:block z-20"
                aria-label="Próximo slide"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores de slide com animação */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {movies.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        disabled={isTransitioning}
                        className={`transition-all duration-500 rounded-full ${
                            currentSlide === index
                                ? 'w-10 h-2 bg-indigo-500 shadow-lg shadow-indigo-500/50'
                                : 'w-2 h-2 bg-white/40 hover:bg-white/80 hover:scale-125'
                        } ${isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        aria-label={`Ir para slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Indicador de auto-play */}
            <div
                className="absolute bottom-6 right-4 text-white/60 text-xs hidden md:flex items-center gap-2 z-20 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full cursor-pointer hover:bg-black/70 transition-all duration-300"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            >
                <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span>{isAutoPlaying ? 'Auto-play ativo' : 'Pausado'}</span>
            </div>
        </div>
    );
};

export default Hero;