// components/video-player/EpisodeSelector.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Play } from 'lucide-react';
import { EpisodeSelectorProps, Episode } from './types';
import { useScrollLock } from "@/app/components/video-player/hooks/useScrollLock";

export const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({
                                                                    seasons,
                                                                    currentSeason,
                                                                    currentEpisode,
                                                                    onSelectEpisode,
                                                                    tvId,
                                                                    onClose
                                                                }) => {
    const [selectedSeason, setSelectedSeason] = useState<number>(currentSeason || seasons[0]?.season_number || 1);
    const [isSeasonOpen, setIsSeasonOpen] = useState(false);
    const [episodesCache, setEpisodesCache] = useState<Record<number, Episode[]>>({});
    const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
    const [hasLoadedAll, setHasLoadedAll] = useState(false);
    const isInitialMount = useRef(true);
    const episodeListRef = useRef<HTMLDivElement>(null);
    const seasonListRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); // 🔴 Adicione esta linha

    //useScrollLock(containerRef, [episodeListRef, seasonListRef]);

    useEffect(() => {
        const fetchAllEpisodes = async () => {
            if (hasLoadedAll || !tvId || !seasons.length) return;

            setIsLoadingEpisodes(true);

            try {
                const cache: Record<number, Episode[]> = {};
                const fetchPromises = seasons.map(async (season) => {
                    try {
                        const response = await fetch(`/api/tv/${tvId}/season/${season.season_number}`);
                        if (response.ok) {
                            const data = await response.json();
                            cache[season.season_number] = data.episodes || [];
                        } else {
                            cache[season.season_number] = [];
                        }
                    } catch (error) {
                        console.error(`Erro ao buscar episódios da temporada ${season.season_number}:`, error);
                        cache[season.season_number] = [];
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

        if (!hasLoadedAll && !isInitialMount.current) {
            fetchAllEpisodes();
        }

        isInitialMount.current = false;
        if (!hasLoadedAll) {
            fetchAllEpisodes();
        }
    }, [tvId, seasons, hasLoadedAll]);

    useEffect(() => {
        if (currentEpisode && episodeListRef.current) {
            const episodeElement = document.getElementById(`episode-${selectedSeason}-${currentEpisode}`);
            if (episodeElement) {
                episodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [selectedSeason, currentEpisode]);

    // Scroll para a temporada selecionada quando o dropdown abre
    useEffect(() => {
        if (isSeasonOpen && seasonListRef.current) {
            const selectedElement = document.getElementById(`season-${selectedSeason}`);
            if (selectedElement) {
                selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isSeasonOpen, selectedSeason]);

    const currentEpisodes = episodesCache[selectedSeason] || [];

    // Filtrar temporadas válidas (excluir temporada 0 - especiais)
    const validSeasons = seasons.filter(season => season.season_number !== 0);

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <div className="relative z-10 w-full max-w-5xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden border border-white/50">

                <div className="absolute inset-0 z-0">
                    <img
                        src="/backgroud.jpg"
                        alt="Universo"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/90 via-[#0a0a1a]/95 to-[#0f0f13]/95" />
                </div>

                {/* Header */}
                <div className="relative flex items-center justify-between p-5 border-b border-white/50">
                    <div>
                        <h2 className="text-xl font-bold text-white">Episódios</h2>
                        <p className="text-sm text-gray-300 mt-1">
                            Temporada {selectedSeason}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Seletor de temporada com scroll */}
                <div className="relative p-5 pb-0">
                    <div className="relative inline-block">
                        <button
                            onClick={() => setIsSeasonOpen(!isSeasonOpen)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer border border-white/50"
                        >
                            <span className="text-white text-sm">
                                Temporada {selectedSeason}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-white transition-transform ${isSeasonOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSeasonOpen && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-black/90 backdrop-blur-md rounded-lg shadow-lg border border-white/50 overflow-hidden z-50">
                                {/* Header do dropdown com contagem */}
                                <div className="px-3 py-2 border-b border-white/10 bg-white/5">
                                    <span className="text-xs text-gray-400">
                                        {validSeasons.length} temporadas disponíveis
                                    </span>
                                </div>

                                {/* Lista de temporadas com scroll */}
                                <div
                                    ref={seasonListRef}
                                    className="max-h-64 overflow-y-auto"
                                    style={{
                                        WebkitOverflowScrolling: 'touch'
                                    }}
                                    onWheel={(e) => {
                                        e.stopPropagation();
                                    }}
                                    onTouchMove={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {validSeasons.map((season) => {
                                        const episodeCount = episodesCache[season.season_number]?.length || season.episode_count;
                                        const isSelected = selectedSeason === season.season_number;

                                        return (
                                            <button
                                                id={`season-${season.season_number}`}
                                                key={season.id}
                                                onClick={() => {
                                                    setSelectedSeason(season.season_number);
                                                    setIsSeasonOpen(false);
                                                }}
                                                className={`
                                                    w-full text-left px-4 py-3 text-sm transition-all duration-150 cursor-pointer
                                                    ${isSelected
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-gray-300 hover:bg-white/10'
                                                }
                                                    border-b border-white/5 last:border-0
                                                `}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium">
                                                            Temporada {season.season_number}
                                                        </span>
                                                        {season.name && season.name !== `Season ${season.season_number}` && (
                                                            <p className="text-xs opacity-70 mt-0.5 line-clamp-1">
                                                                {season.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs opacity-70 bg-white/10 px-2 py-0.5 rounded-full">
                                                            {episodeCount} eps
                                                        </span>
                                                        {isSelected && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista de episódios */}
                <div className="p-5 pt-4">
                    {isLoadingEpisodes && !hasLoadedAll ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div
                            ref={episodeListRef}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar"
                            style={{
                                scrollbarWidth: 'thin',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                WebkitOverflowScrolling: 'touch'
                            }}
                            onWheel={(e) => {
                                e.stopPropagation();
                            }}
                            onTouchMove={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            {currentEpisodes.map((ep) => {
                                const isCurrent = currentEpisode === ep.episode_number && selectedSeason === currentSeason;

                                return (
                                    <button
                                        id={`episode-${selectedSeason}-${ep.episode_number}`}
                                        key={ep.id}
                                        onClick={() => {
                                            onSelectEpisode(selectedSeason, ep.episode_number);
                                            onClose();
                                        }}
                                        className={`
                                            group relative p-3 rounded-lg text-center transition-all cursor-pointer backdrop-blur-sm
                                            ${isCurrent
                                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                                            : 'bg-white/10 hover:bg-white/20 text-gray-200'
                                        }
                                        `}
                                    >
                                        <div className={`
                                            text-base font-bold mb-1
                                            ${isCurrent ? 'text-white' : 'text-indigo-300'}
                                        `}>
                                            E{ep.episode_number}
                                        </div>

                                        <div className="text-xs line-clamp-2 min-h-[2rem]">
                                            {ep.name?.replace('Episode ', 'Episódio ') || `Episódio ${ep.episode_number}`}
                                        </div>

                                        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="w-6 h-6 text-white" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {!isLoadingEpisodes && currentEpisodes.length === 0 && hasLoadedAll && (
                        <div className="text-center py-12">
                            <p className="text-gray-400 relative text-sm">Nenhum episódio disponível</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 relative border-t border-white/50 bg-black/20">
                    <p className="text-center text-xs text-gray-400">
                        {currentEpisodes.length} episódios disponíveis
                    </p>
                </div>
            </div>
        </div>
    );
};