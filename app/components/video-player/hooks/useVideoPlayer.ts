// components/video-player/hooks/useVideoPlayer.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { PlayerId, PlayerStatus, ContentType } from '../types';
import { PLAYERS_CONFIG } from '../constants';

interface UseVideoPlayerProps {
    movieId: number | null;
    tvId: number | null;
    imdbId: string | null;
    season: number | null;
    episode: number | null;
    autoPlay: boolean;
    autoNext: boolean;
    defaultLanguage: string;
}

export const useVideoPlayer = ({
                                   movieId,
                                   tvId,
                                   imdbId,
                                   season,
                                   episode,
                                   autoPlay,
                                   autoNext,
                                   defaultLanguage
                               }: UseVideoPlayerProps) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId>('warezcdn');
    const [currentSeason, setCurrentSeason] = useState<number | null>(season);
    const [currentEpisode, setCurrentEpisode] = useState<number | null>(episode);
    const [playerStatus, setPlayerStatus] = useState<PlayerStatus>({
        isLoading: true,
        hasError: false,
        currentUrl: '',
        usedIdentifier: 'none',
        fallbackAttempted: false
    });

    const isInitialLoad = useRef<boolean>(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const contentType: ContentType = (tvId !== null || currentSeason !== null || currentEpisode !== null) ? 'tv' : 'movie';
    const tmdbId: number | null = contentType === 'movie' ? movieId ?? null : tvId ?? null;

    const selectedPlayer = PLAYERS_CONFIG.find(p => p.id === selectedPlayerId)!;
    const canUseTmdb = selectedPlayer.supportsTmdb;

    const buildPlayerUrl = useCallback(() => {

        if (canUseTmdb && tmdbId) {
            const url = selectedPlayer.buildUrl({
                imdbId: null,
                tmdbId: tmdbId,
                type: contentType,
                season: currentSeason,
                episode: currentEpisode,
                autoPlay,
                autoNext,
                defaultLanguage
            });

            if (url) {
                return { url, usedIdentifier: 'tmdb' as const };
            }
        }

        // Prioridade 2: Fallback para IMDb ID
        if (imdbId) {
            const url = selectedPlayer.buildUrl({
                imdbId: imdbId,
                tmdbId: null,
                type: contentType,
                season: currentSeason,
                episode: currentEpisode,
                autoPlay,
                autoNext,
                defaultLanguage
            });

            if (url) {
                return { url, usedIdentifier: 'imdb' as const };
            }
        }

        console.error(`❌ Player ${selectedPlayer.name} não conseguiu construir URL para ${contentType}`);
        return { url: '', usedIdentifier: 'none' as const };
    }, [selectedPlayer, canUseTmdb, tmdbId, imdbId, contentType, currentSeason, currentEpisode, autoPlay, autoNext, defaultLanguage]);

    const loadPlayer = useCallback(() => {
        const { url, usedIdentifier } = buildPlayerUrl();

        if (!url) {
            console.error(`❌ URL vazia para ${selectedPlayer.name}`);
            setPlayerStatus({
                isLoading: false,
                hasError: true,
                currentUrl: '',
                usedIdentifier: 'none',
                fallbackAttempted: false
            });
            return;
        }

        const isFallback = usedIdentifier === 'imdb' && canUseTmdb && tmdbId !== null;

        setPlayerStatus({
            isLoading: true,
            hasError: false,
            currentUrl: url,
            usedIdentifier,
            fallbackAttempted: isFallback
        });
    }, [buildPlayerUrl, canUseTmdb, tmdbId, selectedPlayer, contentType]);

    const handleIframeLoad = () => {
        setPlayerStatus(prev => ({
            ...prev,
            isLoading: false,
            hasError: false
        }));
    };

    const handleIframeError = () => {
        console.error(`❌ Erro no iframe do player ${selectedPlayer.name}`);

        if (playerStatus.usedIdentifier === 'tmdb' && imdbId && !playerStatus.fallbackAttempted) {
            setPlayerStatus(prev => ({ ...prev, fallbackAttempted: true }));
            loadPlayer();
            return;
        }

        setPlayerStatus(prev => ({
            ...prev,
            isLoading: false,
            hasError: true
        }));
    };

    const handlePlayerChange = (playerId: PlayerId) => {
        setSelectedPlayerId(playerId);
        setPlayerStatus(prev => ({ ...prev, fallbackAttempted: false }));
    };

    const handleSelectEpisode = (seasonNum: number, episodeNum: number) => {
        setCurrentSeason(seasonNum);
        setCurrentEpisode(episodeNum);
    };

    const handleReload = () => {
        loadPlayer();
    };

    // useEffect PRINCIPAL - responsável por carregar o player
    useEffect(() => {

        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            loadPlayer();
            return;
        }

        if (contentType === 'movie') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadPlayer();
            return;
        }

        if (contentType === 'tv' && currentSeason !== null && currentEpisode !== null) {
            loadPlayer();
            return;
        }

        console.warn("⚠️ Nenhuma condição atendida no useEffect, tentando carregar mesmo assim");
        loadPlayer();

    }, [selectedPlayerId, currentSeason, currentEpisode, contentType, loadPlayer]);

    return {
        // States
        selectedPlayerId,
        selectedPlayer,
        playerStatus,
        currentSeason,
        currentEpisode,
        contentType,
        tmdbId,
        iframeRef,
        // Handlers
        handlePlayerChange,
        handleSelectEpisode,
        handleReload,
        handleIframeLoad,
        handleIframeError,
        // Utils
        loadPlayer
    };
};