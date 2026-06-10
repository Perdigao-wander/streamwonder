// components/Media/MediaFiltersPanel.tsx
import React from 'react';
import { Filter } from 'lucide-react';
import { Genre } from '@/types/media';

interface MediaFiltersPanelProps {
    showFilters: boolean;
    onToggleFilters: () => void;
    sortBy: string;
    sortOptions: { value: string; label: string }[];
    onSortChange: (value: string) => void;
    selectedYear: string;
    onYearChange: (value: string) => void;
    minRating: string;
    onRatingChange: (value: string) => void;
    genres: Genre[];
    selectedGenres: number[];
    onToggleGenre: (id: number) => void;
    onClearFilters: () => void;
    activeFiltersCount: number;
    yearLabel: string;
}

export function MediaFiltersPanel({
                                      showFilters,
                                      onToggleFilters,
                                      sortBy,
                                      sortOptions,
                                      onSortChange,
                                      selectedYear,
                                      onYearChange,
                                      minRating,
                                      onRatingChange,
                                      genres,
                                      selectedGenres,
                                      onToggleGenre,
                                      onClearFilters,
                                      activeFiltersCount,
                                      yearLabel,
                                  }: MediaFiltersPanelProps) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    return (
        <>
            <div className="flex items-center justify-between">
                <button
                    onClick={onToggleFilters}
                    className={`px-4 py-2 cursor-pointer rounded-xl transition-colors flex items-center gap-2 ${
                        showFilters || activeFiltersCount > 0
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    <Filter className="w-5 h-5" />
                    Filtros
                    {activeFiltersCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
              {activeFiltersCount}
            </span>
                    )}
                </button>
                {activeFiltersCount > 0 && !showFilters && (
                    <button onClick={onClearFilters} className="text-sm text-gray-400 hover:text-white">
                        Limpar filtros
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-semibold">Filtros Avançados</h3>
                        <button onClick={onClearFilters} className="text-sm text-gray-400 hover:text-white">
                            Limpar todos
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-white text-sm block mb-2">Ordenar por</label>
                            <select
                                value={sortBy}
                                onChange={(e) => onSortChange(e.target.value)}
                                className="w-full cursor-pointer px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-white text-sm block mb-2">{yearLabel}</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => onYearChange(e.target.value)}
                                className="w-full cursor-pointer px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">Todos os anos</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-white text-sm block mb-2">Avaliação mínima</label>
                            <select
                                value={minRating}
                                onChange={(e) => onRatingChange(e.target.value)}
                                className="w-full cursor-pointer px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">Todas</option>
                                <option value="5">5+ estrelas</option>
                                <option value="6">6+ estrelas</option>
                                <option value="7">7+ estrelas</option>
                                <option value="8">8+ estrelas</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="text-white text-sm block mb-2">Gêneros</label>
                        <div className="flex flex-wrap gap-2">
                            {genres.map(genre => (
                                <button
                                    key={genre.id}
                                    onClick={() => onToggleGenre(genre.id)}
                                    className={`px-3 py-1.5 cursor-pointer rounded-full text-sm transition-colors ${
                                        selectedGenres.includes(genre.id)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {genre.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}