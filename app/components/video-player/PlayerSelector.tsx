// components/video-player/PlayerSelector.tsx
'use client';

import React, { useState } from 'react';
import { Server, Check, Film, Tv } from 'lucide-react';
import { PlayerSelectorProps } from './types';
import { PLAYERS_CONFIG } from './constants';

export const PlayerSelector: React.FC<PlayerSelectorProps> = ({
                                                                  selectedPlayerId,
                                                                  onPlayerChange,
                                                                  tmdbId,
                                                                  imdbId,
                                                                  contentType // Receber o tipo
                                                              }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedPlayer = PLAYERS_CONFIG.find(p => p.id === selectedPlayerId);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors text-sm"
                type="button"
            >
                <Server className="w-4 h-4" />
                <span>{selectedPlayer?.name ?? 'Selecionar Player'}</span>
                {/* Ícone indicando se é filme ou série */}
                {contentType === 'movie' ? (
                    <Film className="w-3 h-3 text-blue-400" />
                ) : (
                    <Tv className="w-3 h-3 text-green-400" />
                )}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-black/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-800 w-64 max-h-96 overflow-y-auto z-50">
                    <div className="px-3 py-2 border-b border-gray-700">
                        <p className="text-xs text-gray-400">
                            Tipo: {contentType === 'movie' ? '🎬 Filme' : '📺 Série'}
                        </p>
                    </div>
                    {PLAYERS_CONFIG.map((player) => {
                        const isSelected = player.id === selectedPlayerId;
                        const hasTmdb = !!tmdbId;
                        const hasImdb = !!imdbId;
                        const willWork = hasTmdb || hasImdb;

                        return (
                            <button
                                key={player.id}
                                onClick={() => {
                                    if (willWork) {
                                        onPlayerChange(player.id);
                                        setIsOpen(false);
                                    }
                                }}
                                className={`
                                    w-full text-left px-4 py-2 text-sm transition-colors
                                    hover:bg-white/10 cursor-pointer
                                    ${isSelected ? 'text-indigo-400 bg-white/5' : 'text-white'}
                                    ${!willWork ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                type="button"
                                disabled={!willWork}
                                title={!willWork ? `Nenhum ID disponível para este ${contentType}` : player.name}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col items-start">
                                        <span>{player.name}</span>
                                        <div className="flex gap-2 mt-1">
                                            {hasTmdb && (
                                                <span className="text-[10px] text-blue-400">✓ TMDb</span>
                                            )}
                                            {hasImdb && !hasTmdb && (
                                                <span className="text-[10px] text-green-400">✓ IMDb</span>
                                            )}
                                            {!hasTmdb && !hasImdb && (
                                                <span className="text-[10px] text-red-400">✗ Sem ID para {contentType}</span>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};