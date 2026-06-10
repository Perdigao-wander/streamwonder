// components/Media/MediaSearchBar.tsx
import React from 'react';
import { Search, SearchIcon, X } from 'lucide-react';

interface MediaSearchBarProps {
    placeholder: string;
    tempSearchQuery: string;
    onTempQueryChange: (value: string) => void;
    onSearch: () => void;
    onClear: () => void;
    onKeyPress: (e: React.KeyboardEvent) => void;
}

export function MediaSearchBar({
                                   placeholder,
                                   tempSearchQuery,
                                   onTempQueryChange,
                                   onSearch,
                                   onClear,
                                   onKeyPress,
                               }: MediaSearchBarProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={tempSearchQuery}
                    onChange={(e) => onTempQueryChange(e.target.value)}
                    onKeyPress={onKeyPress}
                    className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {tempSearchQuery && (
                    <button onClick={onClear} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                )}
            </div>
            <button
                onClick={onSearch}
                className="px-6 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto w-full"
            >
                <SearchIcon className="w-5 h-5" />
                Pesquisar
            </button>
        </div>
    );
}