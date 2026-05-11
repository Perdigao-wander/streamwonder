'use client';

import React, { useEffect, useState } from 'react';
import { X, Calendar, Star, Info, Tv, Award, Clock } from 'lucide-react';

interface Genre {
    id: number;
    name: string;
}

interface SeriesInfoModalProps {
    show: {
        id: number;
        title: string;
        name: string;
        poster_path: string;
        backdrop_path?: string;
        overview?: string;
        first_air_date?: string;
        vote_average?: number;
        vote_count?: number;
        genre_ids?: number[];
    };
    onClose: () => void;
    onWatch: () => void;
}

const SeriesInfoModal = ({ show, onClose, onWatch }: SeriesInfoModalProps) => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loadingGenres, setLoadingGenres] = useState(true);

    // Buscar gêneros para exibir os nomes
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch('/api/tv/genres');
                const data = await response.json();
                setGenres(data);
            } catch (error) {
                console.error('Erro ao buscar gêneros:', error);
            } finally {
                setLoadingGenres(false);
            }
        };
        fetchGenres();
    }, []);

    // Mapear IDs dos gêneros para nomes
    const getGenreNames = () => {
        if (!show.genre_ids || show.genre_ids.length === 0) return ['Geral'];
        return show.genre_ids
            .map(id => genres.find(g => g.id === id)?.name)
            .filter(Boolean);
    };

    const genreNames = getGenreNames();
    const year = show.first_air_date?.split('-')[0] || 'Em breve';
    const rating = show.vote_average?.toFixed(1) || 'N/A';
    const voteCount = show.vote_count?.toLocaleString() || '0';

    // Impedir scroll do body quando modal estiver aberto
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Fechar ao clicar no overlay
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Fechar ao pressionar ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div className="relative max-w-4xl w-full max-h-[90vh] bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Background com backdrop da série */}
                {show.backdrop_path && (
                    <div className="absolute inset-0 opacity-20">
                        <img
                            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
                    </div>
                )}


                {/* Conteúdo com scroll */}
                <div className="relative z-10 overflow-y-auto max-h-[90vh]">
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                        {/* Poster - Fixo no topo em mobile */}
                        <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0 sticky top-0 md:static">
                            <img
                                src={show.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                                    : 'https://via.placeholder.com/500x750?text=Sem+Imagem'
                                }
                                alt={show.title}
                                className="w-full rounded-xl shadow-lg"
                            />
                        </div>

                        {/* Informações com scroll interno */}
                        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-4rem)] md:max-h-[calc(90vh-6rem)] pr-2 custom-scrollbar">
                            {/* Título */}
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {show.title}
                            </h2>

                            {/* Metadados */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {year !== 'Em breve' && (
                                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        <span>{year}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span>{rating}</span>
                                    <span className="text-gray-500">({voteCount} votos)</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                    <Tv className="w-4 h-4" />
                                    <span>Série</span>
                                </div>
                            </div>

                            {/* Gêneros */}
                            {!loadingGenres && genreNames.length > 0 && (
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

                            {/* Resumo com altura máxima e scroll */}
                            <div className="mb-6">
                                <h3 className="text-white font-semibold mb-2 flex items-center gap-2 sticky top-0  py-2">
                                    <Info className="w-4 h-4 text-indigo-500" />
                                    Sinopse
                                </h3>
                                <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {show.overview || 'Sinopse não disponível para esta série.'}
                                    </p>
                                </div>
                            </div>

                            {/* Botões de ação - Fixos no final */}
                            <div className="flex flex-wrap gap-3 sticky bottom-0  py-4 -mx-2 px-2 mt-4">
                                <button
                                    onClick={onWatch}
                                    className="px-6 py-2.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                    Assistir Agora
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeriesInfoModal;