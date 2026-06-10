// components/Channel/ChannelFiltersPanel.tsx
import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

interface ChannelFiltersPanelProps {
    showFilters: boolean;
    onToggleFilters: () => void;
    selectedCategory: string | null;
    categories: Category[];
    onSelectCategory: (categoryId: string | null) => void;
    activeFiltersCount: number;
    onClearFilters: () => void;
}

export function ChannelFiltersPanel({
                                        showFilters,
                                        onToggleFilters,
                                        selectedCategory,
                                        categories,
                                        onSelectCategory,
                                        activeFiltersCount,
                                        onClearFilters,
                                    }: ChannelFiltersPanelProps) {
    const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

    return (
        <>
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="relative">
                    <button
                        onClick={onToggleFilters}
                        className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
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

                    {showFilters && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 rounded-xl border border-gray-700 shadow-xl z-20 max-h-80 overflow-y-auto">
                            <button
                                onClick={() => onSelectCategory(null)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors ${
                                    !selectedCategory ? 'text-indigo-400 bg-gray-800/50' : 'text-gray-300'
                                }`}
                            >
                                Todas as categorias
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => onSelectCategory(category.id)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors ${
                                        selectedCategory === category.id ? 'text-indigo-400 bg-gray-800/50' : 'text-gray-300'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {(activeFiltersCount > 0) && (
                    <button onClick={onClearFilters} className="text-sm text-gray-400 hover:text-white">
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Badge com a categoria selecionada (opcional) */}
            {selectedCategory && !showFilters && (
                <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full">
            {selectedCategoryName}
          </span>
                </div>
            )}
        </>
    );
}