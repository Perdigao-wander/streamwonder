'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MediaCard } from '@/components/MediaCard';
import { MediaItem } from '@/types/media';

interface RecommendationsSectionProps {
    mediaType: 'movie' | 'tv';
    mediaId: number;
    mediaCategory?: 'series' | 'doramas' | 'animes';
    title?: string;
    limit?: number;
}

export function RecommendationsSection({
                                           mediaType,
                                           mediaId,
                                           mediaCategory,
                                           title = 'Você também pode gostar',
                                           limit = 12,
                                       }: RecommendationsSectionProps) {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [source, setSource] = useState<string>('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/recommendations/${mediaType}/${mediaId}?limit=${limit}`
                );

                // Detecta HTML (erro de API) antes de tentar parsear JSON
                const contentType = response.headers.get('content-type');
                if (!contentType?.includes('application/json')) {
                    throw new Error('Resposta inválida do servidor');
                }

                const data = await response.json();
                if (data.error) throw new Error(data.error);

                setItems(data.results || []);
                setSource(data.source || '');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar recomendações');
                console.error('Erro ao buscar recomendações:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [mediaType, mediaId, limit]);

    const handleShowInfo = (item: MediaItem) => {
        const type = item.media_type || mediaType;
        window.location.href = `/${type}/${item.id}`;
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth * 0.8;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    // Skeleton
    if (loading) {
        return (
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                        {title}
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-800 rounded-xl aspect-[2/3]" />
                            <div className="h-4 bg-gray-800 rounded mt-2 w-3/4" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Erro ou vazio → não renderiza nada (a página de detalhe continua funcional)
    if (error || items.length === 0) {
        return null;
    }

    return (
        <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                        {title}
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                    </h2>
                    {source === 'similar' && (
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                            similares
                        </span>
                    )}
                </div>

                {/* Controles de scroll (desktop) */}
                <div className="hidden md:flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        aria-label="Rolar para a esquerda"
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        aria-label="Rolar para a direita"
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Carrossel horizontal */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none' }}
            >
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="min-w-[150px] sm:min-w-[180px] md:min-w-[200px] snap-start"
                    >
                        <MediaCard
                            item={item}
                            onShowInfo={handleShowInfo}
                            mediaType={mediaType}
                            category={mediaCategory}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}