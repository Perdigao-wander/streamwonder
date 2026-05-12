'use client';

import React, { useEffect } from 'react';
import {Calendar, BookOpen, Info, User, Building} from 'lucide-react';

interface ComicInfoModalProps {
    comic: {
        id: number;
        name: string;
        volume: {
            id: number;
            name: string;
        };
        cover_date: string;
        description?: string;
        image: {
            super_url: string;
            thumb_url: string;
        };
        issue_number: string;
        page_count?: number;
        price?: string;
        publisher?: {
            id: number;
            name: string;
        };
        person_credits?: Array<{
            id: number;
            name: string;
            role: string;
        }>;
    };
    onClose: () => void;
    onWatch: () => void;
}

const ComicInfoModal = ({ comic, onClose, onWatch }: ComicInfoModalProps) => {
    const year = comic.cover_date?.split('-')[0] || 'Data indisponível';
    const creators = comic.person_credits?.slice(0, 5) || [];

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const getCleanDescription = (html: string) => {
        if (!html) return 'Descrição não disponível para esta HQ.';

        // Remove tags HTML e decodifica entidades
        const text = html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&eacute;/g, 'é')
            .replace(/&aacute;/g, 'á')
            .replace(/&iacute;/g, 'í')
            .replace(/&oacute;/g, 'ó')
            .replace(/&uacute;/g, 'ú')
            .replace(/&ntilde;/g, 'ã')
            .replace(/&ccedil;/g, 'ç');

        return text.trim();
    };

    const description = getCleanDescription(comic.description || '');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div className="relative max-w-4xl w-full max-h-[90vh] bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

                <div className="relative z-10 overflow-y-auto max-h-[90vh]">
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                        <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0 sticky top-0 md:static">
                            <img
                                src={comic.image?.super_url || comic.image?.thumb_url || 'https://via.placeholder.com/500x750?text=Sem+Imagem'}
                                alt={comic.name}
                                className="w-full rounded-xl shadow-lg"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-4rem)] md:max-h-[calc(90vh-6rem)] pr-2 custom-scrollbar">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {comic.name}
                            </h2>

                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{comic.volume?.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                    <span className="font-mono">#{comic.issue_number}</span>
                                </div>
                                {year !== 'Data indisponível' && (
                                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        <span>{year}</span>
                                    </div>
                                )}
                                {comic.publisher && (
                                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                                        <Building className="w-4 h-4" />
                                        <span>{comic.publisher.name}</span>
                                    </div>
                                )}
                            </div>

                            {creators.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-indigo-500" />
                                        Criadores
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {creators.map((creator, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 text-xs rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                                            >
                                                {creator.name} ({creator.role})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <>
                                {comic.page_count && (
                                    <div className="mb-4">
                                        <span className="text-gray-400 text-sm">📄 {comic.page_count} páginas</span>
                                    </div>
                                )}

                                {comic.price && (
                                    <div className="mb-4">
                                        <span className="text-gray-400 text-sm">💰 {comic.price}</span>
                                    </div>
                                )}
                            </>

                            <div className="mb-6">
                                <h3 className="text-white font-semibold mb-2 flex items-center gap-2 sticky top-0  py-2">
                                    <Info className="w-4 h-4 text-indigo-500" />
                                    Sinopse
                                </h3>
                                <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {/* Opção 1: Texto puro (recomendado) */}
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {description}
                                    </p>

                                    {/* Opção 2: Se quiser manter formatação HTML (itálico, etc) */}
                                    {/* <SafeHTML html={comic.description || ''} className="text-gray-300 text-sm leading-relaxed" /> */}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 sticky bottom-0  py-4 -mx-2 px-2 mt-4">
                                <button
                                    onClick={onWatch}
                                    className="px-6 py-2.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    Ver Detalhes
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComicInfoModal;