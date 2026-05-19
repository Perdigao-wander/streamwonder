import { Metadata } from 'next';
import MediaInfoClient from './client';

interface PageProps {
    params: Promise<{
        mediaType: string;
        id: string;
    }>;
}

// Função para buscar dados no servidor
async function fetchMediaData(mediaType: string, id: string) {
    try {
        const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
        const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

        const url = mediaType === 'movie'
            ? `${TMDB_BASE_URL}/movie/${id}?language=pt-BR`
            : `${TMDB_BASE_URL}/tv/${id}?language=pt-BR`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            next: { revalidate: 86400 }
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return null;
    }
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    // Desembrulhar a Promise com await
    const { mediaType, id } = await params;
    const data = await fetchMediaData(mediaType, id);

    if (!data) {
        return {
            title: 'Conteúdo não encontrado | Plataforma de Streaming',
            description: 'O conteúdo que você procura não está disponível.',
        };
    }

    const title = mediaType === 'movie' ? data.title : data.name;
    const year = mediaType === 'movie'
        ? data.release_date?.split('-')[0]
        : data.first_air_date?.split('-')[0];
    const overview = data.overview || 'Sinopse não disponível.';
    const rating = data.vote_average?.toFixed(1) || 'N/A';
    const posterUrl = data.poster_path
        ? `https://image.tmdb.org/t/p/original${data.poster_path}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/og-image.jpg`;
    const backdropUrl = data.backdrop_path
        ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
        : posterUrl;

    const mediaTypeText = mediaType === 'movie' ? 'Filme' : 'Série';

    return {
        title: `${title} (${year}) | Assistir ${mediaTypeText} Online | Plataforma de Streaming`,
        description: `${mediaTypeText}: ${title} (${year}). ${overview.substring(0, 160)} ${rating !== 'N/A' ? `Nota: ${rating}/10.` : ''}`,

        openGraph: {
            title: `${title} (${year}) - ${rating !== 'N/A' ? `${rating}/10` : ''}`,
            description: overview.substring(0, 200),
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/${mediaType}/${id}`,
            siteName: 'Plataforma de Streaming',
            images: [
                {
                    url: backdropUrl,
                    width: 1200,
                    height: 630,
                    alt: `${title} - Banner`,
                },
                {
                    url: posterUrl,
                    width: 500,
                    height: 750,
                    alt: `${title} - Poster`,
                }
            ],
            locale: 'pt_BR',
            type: mediaType === 'movie' ? 'video.movie' : 'video.tv_show',
        },

        twitter: {
            card: 'summary_large_image',
            title: `${title} (${year})`,
            description: overview.substring(0, 200),
            images: [backdropUrl],
        },

        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${mediaType}/${id}`,
        },
    };
}

export default async function MediaInfoPage({ params }: PageProps) {
    const { mediaType, id } = await params;

    const initialData = await fetchMediaData(mediaType, id);

    return <MediaInfoClient initialData={initialData} mediaType={mediaType} id={id} />;
}