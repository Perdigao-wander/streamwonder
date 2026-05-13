'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface ChannelPlayerProps {
    channelId: string;
    channelName: string;
    embedUrl: string;
    onClose: () => void;
}

const ChannelPlayer = ({ channelId, channelName, embedUrl, onClose }: ChannelPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Usar embed_url do canal
    const channelUrl = embedUrl || `https://warezcdn.site/canal/${channelId}`;

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (!document.fullscreenElement) {
                containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleReload = () => {
        setIsLoading(true);
        setHasError(false);
        if (iframeRef.current) {
            iframeRef.current.src = channelUrl;
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
            <div className="relative w-full max-w-7xl mx-4">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white text-xl font-bold">{channelName}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                            <p className="text-white">Carregando canal...</p>
                        </div>
                    </div>
                )}

                {/* Botão flutuante de fechar */}
                <button
                    onClick={onClose}
                    className="fixed top-4 cursor-pointer right-4 z-20 p-3 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-110 shadow-lg"
                    aria-label="Fechar player"
                >
                    <X className="w-6 h-6 text-white" />
                </button>

                {/* Error */}
                {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-red-500 text-3xl">!</span>
                            </div>
                            <p className="text-white mb-2">Não foi possível carregar o canal</p>
                            <p className="text-gray-400 text-sm mb-4">Tente novamente mais tarde</p>
                            <button
                                onClick={handleReload}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Tentar Novamente
                            </button>
                        </div>
                    </div>
                )}

                {/* Iframe Player */}
                <iframe
                    ref={iframeRef}
                    src={channelUrl}
                    className="w-full rounded-xl"
                    style={{ aspectRatio: '16/9', minHeight: '400px' }}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                    allowFullScreen
                    allow="autoplay; encrypted-media;"
                />

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChannelPlayer;