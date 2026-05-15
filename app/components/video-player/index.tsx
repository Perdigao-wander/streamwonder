// components/video-player/index.tsx
'use client';

import React, { useRef, useState } from 'react';
import { X, RefreshCw, Tv } from 'lucide-react';
import { VideoPlayerProps } from './types';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { useScrollLock } from './hooks/useScrollLock';
import { PlayerSelector } from './PlayerSelector';
import { EpisodeSelector } from './EpisodeSelector';
import { LoadingState, ErrorState } from './PlayerStatus';

const VideoPlayer: React.FC<VideoPlayerProps> = ({
                                                     movieId = null,
                                                     tvId = null,
                                                     imdbId = null,
                                                     title,
                                                     season = null,
                                                     episode = null,
                                                     seasons = [],
                                                     onClose,
                                                     autoPlay = true,
                                                     autoNext = false,
                                                     defaultLanguage = 'pt'
                                                 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    useScrollLock(containerRef);

    const {
        selectedPlayerId,
        selectedPlayer,
        playerStatus,
        currentSeason,
        currentEpisode,
        contentType,
        tmdbId,
        iframeRef,
        handlePlayerChange,
        handleSelectEpisode,
        handleReload,
        handleIframeLoad,
        handleIframeError
    } = useVideoPlayer({
        movieId,
        tvId,
        imdbId,
        season,
        episode,
        autoPlay,
        autoNext,
        defaultLanguage
    });

    const hasSeasons = seasons.length > 0;
    const isWarezCdn = selectedPlayerId === 'warezcdn';
    const shouldShowEpisodeButton = contentType === 'tv' && !isWarezCdn && hasSeasons;


    return (
        <div ref={containerRef} className="fixed inset-0 z-50 ">
            {/* Header */}
            <div className="absolute top-0 left-40 right-0 z-30  p-4">
                <div className="flex items-start justify-between">
                    {/* Lado esquerdo vazio */}
                    <div className="w-32"></div>

                    {/* PlayerSelector no centro */}
                    <div className="flex justify-center">
                        <PlayerSelector
                            selectedPlayerId={selectedPlayerId}
                            onPlayerChange={handlePlayerChange}
                            tmdbId={tmdbId}
                            imdbId={imdbId}
                            contentType={contentType}
                        />
                        {shouldShowEpisodeButton && (
                            <button
                                onClick={() => setShowEpisodeSelector(!showEpisodeSelector)}
                                className="px-3 cursor-pointer py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg backdrop-blur-sm transition-colors text-sm flex items-center gap-2"
                                type="button"
                            >
                                <Tv className="w-4 h-4" />
                                <span>Episódios</span>
                            </button>
                        )}
                    </div>




                    <div className="flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-3">
{/*                            <button
                                onClick={handleReload}
                                className="p-1.5 cursor-pointer bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors"
                                title="Recarregar player"
                                type="button"
                            >
                                <RefreshCw className={`w-4 h-4 ${playerStatus.isLoading ? 'animate-spin' : ''}`} />
                            </button>*/}
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
                </div>
            </div>

            {/* Episode Selector */}
            {showEpisodeSelector && tvId && (
                <EpisodeSelector
                    seasons={seasons}
                    currentSeason={currentSeason}
                    currentEpisode={currentEpisode}
                    onSelectEpisode={(seasonNum, episodeNum) => {
                        handleSelectEpisode(seasonNum, episodeNum);
                        setShowEpisodeSelector(false);
                    }}
                    tvId={tvId}
                    onClose={() => setShowEpisodeSelector(false)}
                />
            )}

            {/* Video Area */}
            <div className="relative w-full h-full">
                {playerStatus.hasError && (
                    <ErrorState
                        playerStatus={playerStatus}
                        selectedPlayer={selectedPlayer}
                        onReload={handleReload}
                        onClose={onClose}
                        tmdbId={tmdbId}
                        imdbId={imdbId}
                    />
                )}

                {playerStatus.isLoading && !playerStatus.hasError && (
                    <LoadingState
                        playerName={selectedPlayer?.name}
                        usedIdentifier={playerStatus.usedIdentifier}
                        isFallback={playerStatus.fallbackAttempted}
                    />
                )}

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
        </div>
    );
};

export default VideoPlayer;