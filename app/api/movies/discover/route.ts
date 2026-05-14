import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

type Movie = {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    adult: boolean;
    release_date: string;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    vote_average: number;
    imdb_id: string | null;
}

// Cache para IMDb IDs (evita múltiplas chamadas para o mesmo filme)
const imdbCache = new Map<number, string | null>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias
const cacheTimestamps = new Map<number, number>();

// Função para buscar IMDb ID de um filme específico
async function fetchImdbId(movieId: number): Promise<string | null> {
    // Verifica cache
    if (imdbCache.has(movieId)) {
        const timestamp = cacheTimestamps.get(movieId);
        if (timestamp && (Date.now() - timestamp) < CACHE_DURATION) {
            return imdbCache.get(movieId) ?? null;
        } else {
            // Cache expirado, remove
            imdbCache.delete(movieId);
            cacheTimestamps.delete(movieId);
        }
    }

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error(`Erro ao buscar IMDb ID para filme ${movieId}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const imdbId = data.imdb_id || null;

        // Armazena em cache
        imdbCache.set(movieId, imdbId);
        cacheTimestamps.set(movieId, Date.now());

        return imdbId;
    } catch (error) {
        console.error(`Erro ao buscar IMDb ID para filme ${movieId}:`, error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get('page') || '1';
    const sortBy = searchParams.get('sort_by') || 'popularity.desc';
    const withGenres = searchParams.get('with_genres') || '';
    const primaryReleaseYear = searchParams.get('primary_release_year') || '';
    const voteAverageGte = searchParams.get('vote_average.gte') || '';
    const withKeywords = searchParams.get('with_keywords') || '';

    try {
        let url = `${TMDB_BASE_URL}/discover/movie?include_adult=false&language=pt-BR&page=${page}&sort_by=${sortBy}`;

        if (withGenres) url += `&with_genres=${withGenres}`;
        if (primaryReleaseYear) url += `&primary_release_year=${primaryReleaseYear}`;
        if (voteAverageGte) url += `&vote_average.gte=${voteAverageGte}`;
        if (withKeywords) url += `&with_keywords=${withKeywords}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        // Filtra filmes adultos primeiro
        const filteredMovies = data.results.filter((movie: Movie) => !movie.adult);

        // Busca IMDb IDs em paralelo para todos os filmes (limitando a 20 por vez)
        const moviesWithImdb = await Promise.all(
            filteredMovies.map(async (movie: Movie) => {
                const imdbId = await fetchImdbId(movie.id);

                return {
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    backdrop_path: movie.backdrop_path,
                    overview: movie.overview,
                    adult: movie.adult,
                    release_date: movie.release_date,
                    vote_average: movie.vote_average,
                    vote_count: movie.vote_count,
                    popularity: movie.popularity,
                    genre_ids: movie.genre_ids,
                    imdb_id: imdbId, // Adiciona o IMDb ID
                };
            })
        );

        return NextResponse.json({
            page: data.page,
            total_pages: data.total_pages,
            total_results: data.total_results,
            results: moviesWithImdb,
        });
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        return NextResponse.json({ error: 'Erro ao buscar filmes' }, { status: 500 });
    }
}