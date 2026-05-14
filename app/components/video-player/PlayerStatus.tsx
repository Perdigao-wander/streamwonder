// components/video-player/PlayerStatus.tsx
'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { PlayerStatusProps } from './types';

export const LoadingState: React.FC<{ playerName?: string; usedIdentifier: string; isFallback: boolean }> = ({
                                                                                                                 playerName,
                                                                                                                 usedIdentifier,
                                                                                                                 isFallback
                                                                                                             }) => (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-sm">
                Carregando {playerName}...
            </p>
            <p className="text-gray-400 text-xs mt-2">
                {usedIdentifier !== 'none' ? (
                    `Usando ${usedIdentifier === 'tmdb' ? 'TMDb ID' : 'IMDb ID'} ${isFallback ? '(fallback)' : '(prioritário)'}`
                ) : (
                    'Preparando player...'
                )}
            </p>
        </div>
    </div>
);

export const ErrorState: React.FC<PlayerStatusProps> = ({
                                                            playerStatus,
                                                            selectedPlayer,
                                                            onReload,
                                                            onClose,
                                                            tmdbId,
                                                            imdbId
                                                        }) => {
    const noValidId = !tmdbId && !imdbId;

    return (
        <div className="flex items-center justify-center h-full text-white">
            <div className="text-center max-w-md mx-auto p-6">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-xl mb-2">Erro ao carregar vídeo</p>
                <p className="text-gray-400 mb-4">
                    Não foi possível carregar o vídeo do player {selectedPlayer?.name}.
                    {noValidId && (
                        <span className="block mt-2 text-yellow-500">
                            Nenhum identificador (TMDb ou IMDb) foi fornecido.
                        </span>
                    )}
                    {playerStatus.fallbackAttempted && (
                        <span className="block mt-2 text-yellow-500">
                            ⚠️ O TMDb ID falhou e não há IMDb ID disponível como fallback.
                        </span>
                    )}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onReload}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        type="button"
                    >
                        Tentar novamente
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 cursor-pointer bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        type="button"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};