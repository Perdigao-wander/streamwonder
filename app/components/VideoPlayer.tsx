'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, X, Server, RefreshCw, Check, Film, Tv } from 'lucide-react';

// ==================== TIPAGENS FORTES ====================

type ContentType = 'movie' | 'tv';

type PlayerId =
    | 'warezcdn'
    | 'vidsrc-cc'
    | 'vidsrc-to'
    | '2embed'

interface PlayerConfig {
    id: PlayerId;
    name: string;
    buildUrl: (params: PlayerUrlParams) => string;
    supportsTmdb: boolean;
}

interface PlayerUrlParams {
    imdbId: string | null;
    tmdbId: number | null;
    type: ContentType;
    season: number | null;
    episode: number | null;
    autoPlay: boolean;
    autoNext?: boolean;
    defaultLanguage?: string;
}

interface VideoPlayerProps {
    movieId?: number | null;
    tvId?: number | null;
    imdbId?: string | null;
    title: string;
    season?: number | null;
    episode?: number | null;
    onClose: () => void;
    autoPlay?: boolean;
    autoNext?: boolean;
    defaultLanguage?: string;
}

interface PlayerStatus {
    isLoading: boolean;
    hasError: boolean;
    currentUrl: string;
    usedIdentifier: 'imdb' | 'tmdb' | 'none';
}

// ==================== CONFIGURAÇÃO DOS PLAYERS ====================

const PLAYERS_CONFIG: readonly PlayerConfig[] = [
    {
        id: 'warezcdn',
        name: 'WarezCDN',
        supportsTmdb: true,
        buildUrl: ({ imdbId, tmdbId, type, season, episode, autoPlay }): string => {
            const identifier = imdbId ?? tmdbId;
            if (!identifier) return '';

            const path = type === 'movie' ? 'filme' : 'serie';

            const url = `https://warezcdn.site/${path}/${identifier}`;

            const params = new URLSearchParams();
            if (autoPlay) params.set('autoplay', '1');
            if (type === 'tv' && season !== null && episode !== null) {
                params.set('s', String(season));
                params.set('e', String(episode));
            }

            const queryString = params.toString();
            return queryString ? `${url}?${queryString}` : url;
        }
    },
    {
        id: 'vidsrc-cc',
        name: 'VidSrc CC',
        supportsTmdb: false,
        buildUrl: ({ imdbId, type, season, episode, autoPlay }): string => {
            if (!imdbId) return '';

            let url = `https://vidsrc.cc/v2/embed/${type === 'movie' ? 'movie' : 'tv'}/${imdbId}`;

            if (type === 'tv' && season !== null && episode !== null) {
                url += `/${season}/${episode}`;
            }

            if (autoPlay) url += `?autoplay=1`;
            return url;
        }
    },
    {
        id: 'vidsrc-to',
        name: 'Vidsrc.to',
        supportsTmdb: false,
        buildUrl: ({ imdbId, type, season, episode, autoPlay }): string => {
            if (!imdbId) return '';

            let url = `https://vidsrc.to/embed/${type === 'movie' ? 'movie' : 'tv'}/${imdbId}`;

            if (type === 'tv' && season !== null && episode !== null) {
                url += `/${season}/${episode}`;
            }

            if (autoPlay) url += `?autoplay=1`;
            return url;
        }
    },
    {
        id: '2embed',
        name: '2Embed',
        supportsTmdb: true,
        buildUrl: ({ imdbId, tmdbId, type, season, episode, autoPlay }): string => {
            if (type === 'movie') {
                // Filmes: funciona com ambos IDs
                const identifier = imdbId ?? tmdbId;
                if (!identifier) return '';
                let url = `https://www.2embed.online/embed/movie/${identifier}`;
                if (autoPlay) url += `?autoplay=1`;
                return url;
            }

            // Séries: priorizar TMDb ID (testado e funcionou)
            if (type === 'tv') {
                const identifier = tmdbId ?? imdbId;
                if (!identifier || season === null || episode === null) return '';
                // Formato: /tv/{id}/{season}/{episode}
                return `https://www.2embed.online/embed/tv/${identifier}/${season}/${episode}`;
            }

            return '';
        }
    }
] as const;

// ==================== COMPONENTE PRINCIPAL ====================

const VideoPlayer: React.FC<VideoPlayerProps> = ({
                                                     movieId = null,
                                                     tvId = null,
                                                     imdbId = null,
                                                     title,
                                                     season = null,
                                                     episode = null,
                                                     onClose,
                                                     autoPlay = true,
                                                     autoNext = false,
                                                     defaultLanguage = 'pt'
                                                 }) => {
    // ==================== ESTADOS TIPADOS ====================
    const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId>('warezcdn');
    const [playerStatus, setPlayerStatus] = useState<PlayerStatus>({
        isLoading: true,
        hasError: false,
        currentUrl: '',
        usedIdentifier: 'none'
    });
    const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

    // ==================== REFS ====================
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ==================== DADOS DERIVADOS ====================
    const contentType: ContentType = (tvId !== null || season !== null || episode !== null) ? 'tv' : 'movie';
    const tmdbId: number | null = contentType === 'movie' ? movieId ?? null : tvId ?? null;

    // Player selecionado
    const selectedPlayer: PlayerConfig | undefined = PLAYERS_CONFIG.find(p => p.id === selectedPlayerId);

    // Verifica se o player pode usar TMDb ID
    const canUseTmdb = selectedPlayer?.supportsTmdb ?? false;

    // Determina qual identificador usar (prioriza IMDb)
    const getIdentifier = (): { value: string | number | null; type: 'imdb' | 'tmdb' | 'none' } => {
        if (imdbId) {
            return { value: imdbId, type: 'imdb' };
        }
        if (canUseTmdb && tmdbId) {
            return { value: tmdbId, type: 'tmdb' };
        }
        return { value: null, type: 'none' };
    };

    // ==================== FUNÇÕES ====================
    const buildCurrentPlayerUrl = (): { url: string; usedIdentifier: 'imdb' | 'tmdb' | 'none' } => {
        if (!selectedPlayer) {
            return { url: '', usedIdentifier: 'none' };
        }

        const identifier = getIdentifier();

        if (identifier.type === 'none') {
            return { url: '', usedIdentifier: 'none' };
        }

        const url = selectedPlayer.buildUrl({
            imdbId: identifier.type === 'imdb' ? String(identifier.value) : null,
            tmdbId: identifier.type === 'tmdb' ? Number(identifier.value) : null,
            type: contentType,
            season,
            episode,
            autoPlay,
            autoNext,
            defaultLanguage
        });

        return { url, usedIdentifier: identifier.type };
    };

    const loadPlayer = (): void => {
        const { url, usedIdentifier } = buildCurrentPlayerUrl();

        if (!url) {
            setPlayerStatus({
                isLoading: false,
                hasError: true,
                currentUrl: '',
                usedIdentifier: 'none'
            });
            return;
        }

        setPlayerStatus({
            isLoading: true,
            hasError: false,
            currentUrl: url,
            usedIdentifier
        });
    };

    const handleIframeLoad = (): void => {
        setPlayerStatus(prev => ({
            ...prev,
            isLoading: false,
            hasError: false
        }));
    };

    const handleIframeError = (): void => {
        setPlayerStatus(prev => ({
            ...prev,
            isLoading: false,
            hasError: true
        }));
    };

    const handlePlayerChange = (playerId: PlayerId): void => {
        setSelectedPlayerId(playerId);
        setIsSelectorOpen(false);
    };

    const handleReload = (): void => {
        loadPlayer();
    };

    // ==================== EFECTOS ====================
    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPlayer();
    }, [selectedPlayerId, imdbId, tmdbId, season, episode]);

    // ==================== RENDER ====================
    const renderIdentifierBadge = (): React.ReactElement | null => {
        if (playerStatus.usedIdentifier === 'none') return null;

        return (
            <div className="absolute bottom-4 right-4 z-20 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
                {playerStatus.usedIdentifier === 'imdb' ? (
                    <>
                        <Film className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">IMDb ID</span>
                        <span className="text-gray-400">{imdbId}</span>
                    </>
                ) : (
                    <>
                        <Tv className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-400">TMDb ID</span>
                        <span className="text-gray-400">{tmdbId}</span>
                    </>
                )}
            </div>
        );
    };

    const renderPlayerSelector = (): React.ReactElement => (
        <div className="relative">
            <button
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors text-sm"
                type="button"
            >
                <Server className="w-4 h-4" />
                <span>{selectedPlayer?.name ?? 'Selecionar Player'}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isSelectorOpen && (
                <div className="absolute top-full left-0 mt-2 bg-black/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-800 w-64 max-h-96 overflow-y-auto z-50">
                    {PLAYERS_CONFIG.map((player) => {
                        const isSelected = player.id === selectedPlayerId;
                        const supportsTmdb = player.supportsTmdb;
                        const hasImdb = !!imdbId;
                        const hasTmdb = !!tmdbId;
                        const willWork = hasImdb || (supportsTmdb && hasTmdb);

                        return (
                            <button
                                key={player.id}
                                onClick={() => handlePlayerChange(player.id)}
                                className={`
                                    w-full text-left px-4 py-2 text-sm transition-colors
                                    hover:bg-white/10 cursor-pointer
                                    ${isSelected ? 'text-indigo-400 bg-white/5' : 'text-white'}
                                    ${!willWork ? 'opacity-50' : ''}
                                `}
                                type="button"
                                title={!willWork ? `Este player requer IMDb ID ou TMDb ID compatível` : player.name}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col items-start">
                                        <span>{player.name}</span>
                                        {!hasImdb && supportsTmdb && hasTmdb && (
                                            <span className="text-xs text-gray-500">Funciona com TMDb ID</span>
                                        )}
                                        {!hasImdb && !supportsTmdb && (
                                            <span className="text-xs text-red-500">Requer IMDb ID</span>
                                        )}
                                    </div>
                                    {isSelected && <Check className="w-4 h-4" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderErrorState = (): React.ReactElement => {
        const missingImdb = !imdbId && selectedPlayer && !selectedPlayer.supportsTmdb;

        return (
            <div className="flex items-center justify-center h-full text-white">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-xl mb-2">Erro ao carregar vídeo</p>
                    <p className="text-gray-400 mb-4">
                        Não foi possível carregar o vídeo do player {selectedPlayer?.name}.
                        {missingImdb && (
                            <span className="block mt-2 text-yellow-500">
                                ⚠️ Este player requer um IMDb ID, mas o filme não possui um.
                                <br />
                                <span className="text-sm">
                                    Tente usar VidSrc Embed, WarezCDN ou MultiEmbed que suportam TMDb ID.
                                </span>
                            </span>
                        )}
                        {!imdbId && !tmdbId && (
                            <span className="block mt-2 text-yellow-500">
                                Nenhum identificador (IMDb ou TMDb) foi fornecido.
                            </span>
                        )}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleReload}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            type="button"
                        >
                            Tentar novamente
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 cursor-pointer cursor-pointer bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            type="button"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderLoadingState = (): React.ReactElement => (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-sm">
                    Carregando {selectedPlayer?.name}...
                </p>
                <p className="text-gray-400 text-xs mt-2">
                    Usando {playerStatus.usedIdentifier === 'imdb' ? 'IMDb ID' : 'TMDb ID'}
                </p>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-black/95">
            {/* Header com controles */}
            <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {renderPlayerSelector()}

                        <button
                            onClick={handleReload}
                            className="p-1.5 cursor-pointer bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors"
                            title="Recarregar player"
                            type="button"
                        >
                            <RefreshCw className={`w-4 h-4 ${playerStatus.isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="text-white text-sm font-medium truncate max-w-md">
                        {title}
                        {contentType === 'tv' && season !== null && episode !== null && (
                            <span className="text-gray-400 ml-2">
                                T{season} E{episode}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-full cursor-pointer bg-black/50 hover:bg-black/70 transition-colors backdrop-blur-sm"
                        aria-label="Fechar player"
                        type="button"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Player ou estados de erro/loading */}
            <div className="relative w-full h-full">
                {playerStatus.hasError && renderErrorState()}

                {playerStatus.isLoading && !playerStatus.hasError && renderLoadingState()}

                {playerStatus.currentUrl && !playerStatus.hasError && (
                    <iframe
                        ref={iframeRef}
                        key={playerStatus.currentUrl}
                        src={playerStatus.currentUrl}
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        allow="autoplay *; encrypted-media *; picture-in-picture *; fullscreen *; clipboard-write *; accelerometer *; gyroscope *; web-share *"
                        allowFullScreen
                        className="w-full h-full"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 0,
                        }}
                        frameBorder="0"
                        title={`Assistir ${title}`}
                    />
                )}
            </div>

            {/* Badge indicador de qual ID está sendo usado
            {renderIdentifierBadge()}*/}
        </div>
    );
};

export default VideoPlayer;