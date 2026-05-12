'use client';

import React, { useEffect, useState, useCallback} from 'react';
import { BookOpen, Info, AlertCircle } from 'lucide-react';
import ComicInfoModal from './ComicInfoModal';

interface ComicIssue {
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
        small_url: string;
    };
    issue_number: string;
    page_count?: number;
    price?: string;
    publisher?: {
        id: number;
        name: string;
    };
    character_credits?: Array<{
        id: number;
        name: string;
    }>;
    person_credits?: Array<{
        id: number;
        name: string;
        role: string;
    }>;
}

interface ComicsGridProps {
    category?: 'recent' | 'popular' | 'marvel' | 'dc';
    limit?: number;
}

const ComicsGrid = ({ category = 'recent', limit = 10 }: ComicsGridProps) => {
    const [comics, setComics] = useState<ComicIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedComic, setSelectedComic] = useState<ComicIssue | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

    // Buscar HQs baseado na categoria
    const fetchComics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let endpoint = '';
            switch (category) {
                case 'recent':
                    endpoint = '/api/comics/issues?sort=cover_date:desc';
                    break;
                case 'popular':
                    endpoint = '/api/comics/issues?sort=cover_date:desc';
                    break;
                case 'marvel':
                    endpoint = '/api/comics/issues?filter=publisher:Marvel';
                    break;
                case 'dc':
                    endpoint = '/api/comics/issues?filter=publisher:DC%20Comics';
                    break;
                default:
                    endpoint = '/api/comics/issues?sort=cover_date:desc';
            }

            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Limitar número de resultados
            setComics(data.results?.slice(0, limit) || []);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erro ao buscar HQs');
            console.error('Erro ao buscar HQs:', error);
        } finally {
            setLoading(false);
        }
    }, [category, limit]);

    useEffect(() => {
        fetchComics();
    }, [fetchComics]);

    // Handler para abrir modal da HQ
    const handleOpenComic = useCallback((comic: ComicIssue, event?: React.MouseEvent | React.TouchEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        setTimeout(() => {
            setSelectedComic(comic);
            setShowModal(true);
        }, 10);
    }, []);

    // Touch handlers para mobile
    const handleTouchStart = useCallback((e: React.TouchEvent, comic: ComicIssue) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent, comic: ComicIssue) => {
        if (!touchStart) return;

        const touchEnd = e.changedTouches[0];
        const deltaX = Math.abs(touchEnd.clientX - touchStart.x);
        const deltaY = Math.abs(touchEnd.clientY - touchStart.y);

        if (deltaX < 10 && deltaY < 10) {
            e.preventDefault();
            handleOpenComic(comic, e);
        }

        setTouchStart(null);
    }, [touchStart, handleOpenComic]);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setSelectedComic(null);
    }, []);

    // Função para limpar descrição HTML
    const getCleanDescription = (html: string) => {
        if (!html) return '';
        return html
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
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {[...Array(limit)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-800 rounded-xl aspect-[2/3]"></div>
                        <div className="h-4 bg-gray-800 rounded mt-2 w-3/4"></div>
                        <div className="h-3 bg-gray-800 rounded mt-1 w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 mb-4">Erro: {error}</p>
                <button
                    onClick={fetchComics}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    // Empty state
    if (comics.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma HQ encontrada</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {comics.map((comic) => {
                    const title = comic.name;
                    const volumeName = comic.volume?.name || 'HQ';
                    const issueNumber = comic.issue_number;
                    const year = comic.cover_date?.split('-')[0] || 'Data indisponível';
                    const imageUrl = comic.image?.small_url || comic.image?.thumb_url || 'https://via.placeholder.com/500x750?text=Sem+Imagem';
                    const description = getCleanDescription(comic.description || '').substring(0, 100);

                    return (
                        <div
                            key={comic.id}
                            className="group cursor-pointer transition-transform duration-300 active:scale-95 hover:scale-105"
                            onClick={(e) => handleOpenComic(comic, e)}
                            onTouchStart={(e) => handleTouchStart(e, comic)}
                            onTouchEnd={(e) => handleTouchEnd(e, comic)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleOpenComic(comic);
                                }
                            }}
                        >
                            <div className="relative rounded-xl overflow-hidden bg-gray-900">
                                <img
                                    src={imageUrl}
                                    alt={title}
                                    className="w-full aspect-[2/3] object-cover pointer-events-none"
                                    loading="lazy"
                                    draggable="false"
                                />

                                {/* Overlay do info button */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        className="bg-indigo-600 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform pointer-events-none"
                                        aria-label={`Ver detalhes de ${title}`}
                                    >
                                        <Info className="w-6 h-6 text-white" />
                                    </button>
                                </div>

                                {/* Badge do volume/edição */}
                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                                    <span className="text-white text-xs font-semibold">
                                        #{issueNumber}
                                    </span>
                                </div>

                                {/* Badge da editora */}
                                {comic.publisher && (
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                                        <span className="text-indigo-400 text-xs font-semibold">
                                            {comic.publisher.name}
                                        </span>
                                    </div>
                                )}

                                {/* Informações no bottom */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
                                    <div className="space-y-0.5">
                                        <div className="text-white text-xs font-semibold truncate">
                                            {title}
                                        </div>
                                        <div className="text-indigo-400 text-xs">
                                            {volumeName} • {year}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Informações da HQ */}
            {showModal && selectedComic && (
                <ComicInfoModal
                    comic={selectedComic}
                    onClose={handleCloseModal}
                    onWatch={() => {
                        // Para HQs, podemos abrir uma visualização ou redirecionar
                        console.log('Ver HQ:', selectedComic.name);
                    }}
                />
            )}
        </>
    );
};

export default ComicsGrid;