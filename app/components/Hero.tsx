"use client";

import React, { useState, useEffect } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

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
    const [loading, setLoading] = useState(true);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Buscar filmes populares
    useEffect(() => {
        const fetchPopularMovies = async () => {
            try {
                const response = await fetch('/api/movies/popular');
                const data = await response.json();
                // Pega apenas os 5 primeiros filmes
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
            setCurrentSlide((prev) => (prev + 1) % movies.length);
        }, 8000); // Muda a cada 8 segundos

        return () => clearInterval(interval);
    }, [isAutoPlaying, movies.length]);

    // Pausar auto-play quando o usuário interage
    const handleManualNavigation = (callback: () => void) => {
        setIsAutoPlaying(false);
        callback();
        // Retomar auto-play após 10 segundos sem interação
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const nextSlide = () => {
        handleManualNavigation(() => {
            setCurrentSlide((prev) => (prev + 1) % movies.length);
        });
    };

    const prevSlide = () => {
        handleManualNavigation(() => {
            setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length);
        });
    };

    const goToSlide = (index: number) => {
        handleManualNavigation(() => {
            setCurrentSlide(index);
        });
    };

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
    const year = currentMovie.release_date?.split('-')[0] || 'Em breve';

    return (
        <div className="relative h-[40vh] md:h-[80vh] w-full overflow-hidden group">
            {/* Background Image */}
            <div className="absolute inset-0 transition-opacity duration-1000">
                <img
                    src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
                    alt={currentMovie.title}
                    className="w-full h-full object-cover object-center"
                />
                {/* Gradientes para melhor legibilidade */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
            </div>

            {/* Conteúdo */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start space-y-4 md:space-y-6">

                {/* Título */}
                <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white max-w-2xl leading-tight animate-fade-in-up animation-delay-100">
                    {currentMovie.title}
                </h1>

                {/* Informações adicionais */}
                <div className="flex items-center gap-4 text-sm md:text-base animate-fade-in-up animation-delay-200">
                    <span className="text-gray-300">{year}</span>
                    <span className="text-yellow-500 flex items-center gap-1">
                        ★ {currentMovie.vote_average?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-gray-300">HD</span>
                </div>

                {/* Descrição */}
                <p className="text-gray-300 text-sm md:text-lg max-w-xl line-clamp-3 md:line-clamp-4 animate-fade-in-up animation-delay-300">
                    {currentMovie.overview || 'Sinopse não disponível.'}
                </p>

            </div>

            {/* Botões de navegação - Desktop */}
            <button
                onClick={prevSlide}
                className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-indigo-600/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hidden md:block"
                aria-label="Slide anterior"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 cursor-pointer top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-indigo-600/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hidden md:block"
                aria-label="Próximo slide"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores de slide (dots) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {movies.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                            currentSlide === index
                                ? 'w-8 h-2 bg-indigo-500'
                                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Ir para slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Indicador de auto-play (pausa ao hover) */}
            <div
                className="absolute bottom-6 right-4 text-white/50 text-xs hidden md:block"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
            >
                {isAutoPlaying ? '● Auto-play ativo' : '❚❚ Pausado'}
            </div>
        </div>
    );
};

export default Hero;