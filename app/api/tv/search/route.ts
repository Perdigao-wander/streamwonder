import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

type Serie = {
    id: number;
    title: string;
    name: string;
    poster_path: string;
    adult: boolean;
    backdrop_path: string;
    overview: string;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    origin_country: string[];
    original_language: string;
    original_name: string;
    imdb_id: string | null;
}

// Cache para IMDb IDs de séries
const imdbCache = new Map<number, { imdbId: string | null; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

// Função para buscar IMDb ID de uma série específica
async function fetchImdbId(tvId: number): Promise<string | null> {
    // Verifica cache
    const cached = imdbCache.get(tvId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.imdbId;
    }

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error(`Erro ao buscar IMDb ID para série ${tvId}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const imdbId = data.external_ids?.imdb_id || null;

        // Armazena em cache
        imdbCache.set(tvId, { imdbId, timestamp: Date.now() });

        await new Promise(resolve => setTimeout(resolve, 50));

        return imdbId;
    } catch (error) {
        console.error(`Erro ao buscar IMDb ID para série ${tvId}:`, error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&language=pt-BR&page=${page}&include_adult=false`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        // Filtra séries adultas primeiro
        const filteredSeries = data.results.filter((serie: Serie) => !serie.adult);

        // Busca IMDb IDs em paralelo para todas as séries
        const seriesWithImdb = await Promise.all(
            filteredSeries.map(async (serie: Serie) => {
                const imdbId = await fetchImdbId(serie.id);

                return {
                    id: serie.id,
                    title: serie.name,
                    name: serie.name,
                    poster_path: serie.poster_path,
                    backdrop_path: serie.backdrop_path,
                    overview: serie.overview,
                    first_air_date: serie.first_air_date,
                    vote_average: serie.vote_average,
                    vote_count: serie.vote_count,
                    popularity: serie.popularity,
                    genre_ids: serie.genre_ids,
                    origin_country: serie.origin_country,
                    original_language: serie.original_language,
                    original_name: serie.original_name,
                    imdb_id: imdbId, // Adiciona o IMDb ID
                };
            })
        );

        return NextResponse.json({
            page: data.page,
            total_pages: data.total_pages,
            total_results: data.total_results,
            results: seriesWithImdb,
        });
    } catch (error) {
        console.error('Erro na busca de séries:', error);
        return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
    }
}