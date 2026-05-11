'use client';

import React, { useState, useEffect, useRef } from 'react';
import {AlertCircle, X} from 'lucide-react';
interface VideoPlayerProps {
    movieId?: number;
    tvId?: number;
    imdbId?: string;
    title: string;
    season?: number;
    episode?: number;
    onClose: () => void;
    autoPlay?: boolean;
}

const VideoPlayer = ({
                         movieId,
                         tvId,
                         imdbId,
                         title,
                         season,
                         episode,
                         onClose,
                         autoPlay = true
                     }: VideoPlayerProps) => {
    const [playerUrl, setPlayerUrl] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * Construir URL do WarezCdn no formato correto
     * - Filmes: https://warezcdn.site/filme/ID_DO_FILME?autoplay=1
     * - Séries: https://warezcdn.site/serie/ID_TMDB?autoplay=1
     */
    const buildWarezCdnUrl = (): string => {
        // Verificar se é série (tem tvId OU season/episode OU é explicitamente TV)
        const isSerie = !!(tvId || (season !== undefined && episode !== undefined));
        const isMovie = !!movieId;

        let identifier: string | number | undefined;
        let type = '';

        if (isSerie) {
            // Prioridade para séries: tvId > imdbId
            identifier = tvId || imdbId;
            type = 'serie';
            setContentType('Série');
        } else if (isMovie) {
            // Para filmes: movieId > imdbId
            identifier = movieId || imdbId;
            type = 'filme';
            setContentType('Filme');
        } else if (imdbId) {
            // Fallback: se só tem imdbId, tenta como filme primeiro
            identifier = imdbId;
            type = 'filme';
            setContentType('Filme (IMDb)');
        }

        if (!identifier) {
            throw new Error('Nenhum identificador foi fornecido (movieId, tvId ou imdbId)');
        }

        // Monta a URL base conforme o tipo
        let url = `https://warezcdn.site/${type}/${identifier}`;

        // Adiciona autoplay como parâmetro
        if (autoPlay) {
            url += `?autoplay=1`;
        }

        // Log para debug
        console.log(`WarezCdn URL gerada: ${url} (${contentType})`);

        return url;
    };

// Carregar URL do player
    useEffect(() => {
        const url = buildWarezCdnUrl();

        // Só atualiza se a URL realmente mudou
        if (url !== playerUrl) {
            setPlayerUrl(url);
        }
    }, [movieId, tvId, imdbId, autoPlay, season, episode]);


    return (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-black/95">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 cursor-pointer z-30 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors backdrop-blur-sm"
                aria-label="Fechar player"
            >
                <X className="w-6 h-6 text-white" />
            </button>

            <div className="relative w-full h-full">
                {playerUrl ? (
                    <iframe
                        ref={iframeRef}
                        key={playerUrl}
                        src={playerUrl}
                        allow="autoplay *; encrypted-media *; picture-in-picture *; fullscreen *; clipboard-write *; accelerometer *; gyroscope *"
                        allowFullScreen
                        className="w-full h-full"
                        frameBorder="0"
                        scrolling="no"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 0,
                        }}
                        title={`Assistir ${title}`}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-white">
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <p className="text-xl mb-2">Erro ao carregar vídeo</p>
                            <p className="text-gray-400">URL inválida ou indisponível</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;