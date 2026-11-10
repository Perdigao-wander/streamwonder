'use client';

import Link from 'next/link';
import { Play, X, ChevronRight } from 'lucide-react';
import { useContinueWatching } from '@/hooks/useContinueWatching';

export function ContinueWatchingSection() {
    const { items, isHydrated, removeProgress } = useContinueWatching();

    if (!isHydrated || items.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                        Continuar Assistindo
                        <Play className="w-6 h-6 text-indigo-500 fill-current" />
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {items.map(item => {
                    const percentage = item.duration > 0
                        ? Math.min(100, (item.progress / item.duration) * 100)
                        : 0;

                    const href = `/${item.mediaType}/${item.id}${item.season !== undefined
                        ? `?season=${item.season}&episode=${item.episode}`
                        : ''}`;

                    return (
                        <div key={`${item.mediaType}-${item.id}-${item.season}-${item.episode}`} className="group relative">
                            <Link href={href} className="block">
                                <div className="relative rounded-xl overflow-hidden bg-gray-900">
                                    <img
                                        src={item.posterPath
                                            ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
                                            : 'https://via.placeholder.com/500x750?text=Sem+Imagem'}
                                        alt={item.title}
                                        className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />

                                    {/* Overlay com play */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-indigo-600 rounded-full p-3">
                                            <Play className="w-6 h-6 text-white fill-current" />
                                        </div>
                                    </div>

                                    {/* Barra de progresso */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                        <div
                                            className="h-full bg-indigo-500 transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <div className="text-white text-sm font-semibold truncate drop-shadow-lg">
                                            {item.title}
                                        </div>
                                        {item.season !== undefined && (
                                            <div className="text-indigo-400 text-xs">
                                                T{item.season} • E{item.episode}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>

                            {/* Botão remover */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    removeProgress(item.id, item.mediaType, item.season, item.episode);
                                }}
                                aria-label="Remover da lista"
                                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}