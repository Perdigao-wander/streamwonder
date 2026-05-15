"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronDown, Play, Loader2 } from 'lucide-react';
import { EpisodeSelectorProps, Episode } from './types';
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";

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

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Suporte a touch para scroll (opcional, mas melhora a experiência)
    const touchStartY = useRef<number>(0);
    const [isTouching, setIsTouching] = useState(false);

    useEffect(() => {
        const fetchAllEpisodes = async () => {
            if (hasLoadedAll || !tvId || !seasons.length) {
                return;
            }

            setIsLoadingEpisodes(true);

            try {
                const cache: Record<number, Episode[]> = {};
                const validSeasons = seasons.filter(season => season.season_number !== 0);

                const fetchPromises = validSeasons.map(async (season) => {
                    try {
                        const response = await fetch(`/api/tv/${tvId}/season/${season.season_number}`);

                        if (response.ok) {
                            const data = await response.json();
                            const episodes: Episode[] = data.episodes?.map((ep: Episode) => ({
                                id: ep.id,
                                episode_number: ep.episode_number,
                                name: ep.name?.replace('Episode ', 'Episódio ') || `Episódio ${ep.episode_number}`,
                                overview: ep.overview || '',
                                still_path: ep.still_path || null,
                                runtime: ep.runtime || null,
                                air_date: ep.air_date || null,
                            })) || [];

                            cache[season.season_number] = episodes;
                        } else {
                            console.log(`Usando dados mock para temporada ${season.season_number}`);
                            const mockEpisodes = generateMockEpisodes(season.episode_count || 10);
                            cache[season.season_number] = mockEpisodes;
                        }
                    } catch (error) {
                        console.error(`Erro na temporada ${season.season_number}:`, error);
                        const mockEpisodes = generateMockEpisodes(season.episode_count || 10);
                        cache[season.season_number] = mockEpisodes;
                    }
                });

                await Promise.all(fetchPromises);
                setEpisodesCache(cache);
                setHasLoadedAll(true);
            } catch (error) {
                console.error('Erro fatal ao buscar episódios:', error);
            } finally {
                setIsLoadingEpisodes(false);
            }
        };

        const generateMockEpisodes = (count: number): Episode[] => {
            return Array.from({ length: count }, (_, i) => ({
                id: i + 1,
                episode_number: i + 1,
                name: `Episódio ${i + 1}`,
                overview: `Sinopse do episódio ${i + 1}`,
                still_path: null,
                runtime: 45 + Math.floor(Math.random() * 15),
                air_date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
            }));
        };

        fetchAllEpisodes();
    }, [tvId, seasons, hasLoadedAll]);

    // Scroll to current episode
    useEffect(() => {
        if (currentEpisode && selectedSeason === currentSeason && scrollContainerRef.current) {
            const timer = setTimeout(() => {
                const element = document.getElementById(`episode-${selectedSeason}-${currentEpisode}`);
                if (element && scrollContainerRef.current) {
                    const containerRect = scrollContainerRef.current.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();
                    const scrollOffset = elementRect.top - containerRect.top + scrollContainerRef.current.scrollTop - 100;

                    scrollContainerRef.current.scrollTo({
                        top: scrollOffset,
                        behavior: 'smooth'
                    });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [selectedSeason, currentEpisode, currentSeason]);

    const currentEpisodes = episodesCache[selectedSeason] || [];
    const validSeasons = seasons.filter(season => season.season_number !== 0);

    // Handlers para touch (scroll nativo, mas útil para debug)
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
        setIsTouching(true);
    };

    const handleTouchEnd = () => {
        setIsTouching(false);
        touchStartY.current = 0;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-white/10 bg-[#0a0a1a]/95 flex flex-col">
                {/* Header - fixo */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Episódios</h2>
                        <p className="text-sm text-indigo-300/80 font-medium">
                            Temporada {selectedSeason} • {currentEpisodes.length} episódios
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full cursor-pointer hover:bg-white/10 text-white"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Season Selector - fixo */}
                <div className="px-6 py-4 flex items-center gap-4 flex-shrink-0 border-b border-white/5">
                    <div className="relative">
                        <Button
                            variant="outline"
                            onClick={() => setIsSeasonOpen(!isSeasonOpen)}
                            className="bg-white/5 cursor-pointer border-white/10 hover:bg-white/10 text-white rounded-md px-5 py- h-auto flex items-center gap-3 transition-all"
                        >
                            <span className="font-semibold">Temporada {selectedSeason}</span>
                            <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isSeasonOpen && "rotate-180")} />
                        </Button>

                        {isSeasonOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsSeasonOpen(false)}
                                />
                                <div className="absolute top-full left-0 mt-3 w-64 bg-[#15152e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                                    <div className="p-3 border-b border-white/5 bg-white/5">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-300/60">
                                          {validSeasons.length} Temporadas
                                        </span>
                                    </div>
                                    <div
                                        className="max-h-60 overflow-auto custom-scrollbar"
                                        data-allow-scroll="true"
                                    >
                                        <div className="p-2 space-y-1">
                                            {validSeasons.map((season) => {
                                                const isSelected = selectedSeason === season.season_number;
                                                return (
                                                    <button
                                                        key={season.id}
                                                        onClick={() => {
                                                            setSelectedSeason(season.season_number);
                                                            setIsSeasonOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full cursor-pointer text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group",
                                                            isSelected
                                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                                                : "text-gray-300 hover:bg-white/5 hover:text-white"
                                                        )}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-bold">Temporada {season.season_number}</span>
                                                            <span className="text-[10px] opacity-60">{season.episode_count} episódios</span>
                                                        </div>
                                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Episodes Grid - Área de scroll NATIVA */}
                <div className="flex-1 min-h-0 px-6 pb-6 pt-4">
                    {isLoadingEpisodes && !hasLoadedAll ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="text-indigo-300/60 font-medium animate-pulse">Carregando episódios...</p>
                        </div>
                    ) : (
                        <div
                            ref={scrollContainerRef}
                            className="max-h-72 overflow-y-auto overflow-x-hidden custom-scrollbar"
                            style={{
                                scrollBehavior: 'smooth',
                                WebkitOverflowScrolling: 'touch',
                            }}
                            data-allow-scroll="true"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 pb-4">
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
                                            className={cn(
                                                "group relative aspect-video rounded-2xl overflow-hidden transition-all duration-300 border-2 cursor-pointer",
                                                isCurrent
                                                    ? "border-indigo-500 ring-4 ring-indigo-500/20 scale-[0.98] shadow-lg shadow-indigo-500/25"
                                                    : "border-white/5 hover:border-white/20 hover:scale-[1.02] hover:shadow-xl"
                                            )}
                                        >
                                            {/* Background Image */}
                                            <div className="absolute inset-0 -z-10">
                                                {ep.still_path ? (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w500${ep.still_path}`}
                                                        alt={ep.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <img
                                                        src="/backgroud.jpg"
                                                        alt="Background"
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            {/* Badge de duração */}
                                            {ep.runtime && ep.runtime > 0 && (
                                                <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
                                                    <span className="text-white text-[10px] font-medium">
                                                        {ep.runtime} min
                                                    </span>
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                                                <div className="flex items-start justify-between">
                                                    <div className={cn(
                                                        "w-8 h-8 absolute top-2 left-2 z-10 rounded-full flex items-center justify-center text-xs font-black shadow-lg",
                                                        isCurrent
                                                            ? "bg-indigo-500 text-white ring-2 ring-white/50"
                                                            : "bg-black/60 backdrop-blur-sm text-indigo-300 border border-white/20"
                                                    )}>
                                                        {ep.episode_number}
                                                    </div>

                                                    {isCurrent && (
                                                        <div className="bg-green-500 absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                                                            Atual
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <p className={cn(
                                                        "text-sm font-bold line-clamp-2 drop-shadow-md",
                                                        isCurrent ? "text-white" : "text-white"
                                                    )}>
                                                        {ep.name?.replace('Episode ', 'Episódio ') || `Episódio ${ep.episode_number}`}
                                                    </p>

                                                    {ep.air_date && (
                                                        <p className="text-[10px] text-gray-300 drop-shadow-md">
                                                            {new Date(ep.air_date).toLocaleDateString('pt-BR', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Hover Overlay com Play */}
                                            <div className="absolute inset-0 z-15 bg-indigo-600/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                                <div className="transform scale-90 group-hover:scale-100 transition-all duration-300">
                                                    <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200">
                                                        <Play className="w-10 h-10 text-indigo-600 fill-indigo-600 ml-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {currentEpisodes.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <X className="w-8 h-8 text-white/20" />
                                    </div>
                                    <p className="text-gray-400 font-medium">Nenhum episódio disponível para esta temporada.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer - fixo */}
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-center flex-shrink-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-300/40">
                        Selecione um episódio para começar a assistir
                    </p>
                </div>
            </div>
        </div>
    );
};