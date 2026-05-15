import { NextResponse } from 'next/server';

type Movie = {
    id: number;
    title: string;
    poster_path: string;
    adult: boolean;
    backdrop_path: string;
    overview: string;
    imdb_id: string | null;
    release_date: string;
    vote_average: number;
}

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

// Cache simples em memória
let moviesCache: Movie[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 3600000; // 1 hora em milissegundos

export async function GET() {
    try {
        // Verifica se o cache é válido
        if (moviesCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
            console.log('Retornando filmes do cache');
            return NextResponse.json(moviesCache);
        }

        // 1. Buscar filmes populares
        const listResponse = await fetch(
            `${TMDB_BASE_URL}/movie/popular?language=pt-BR&sort_by=vote_count.desc&page=1`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const listData = await listResponse.json();

        // 2. Filtrar filmes adultos
        const filteredMovies = listData.results.filter((movie: any) => !movie.adult);

        // 3. Buscar detalhes em paralelo (limitando a 20 filmes por vez para não sobrecarregar)
        const batchSize = 20;
        const moviesWithImdb: Movie[] = [];

        for (let i = 0; i < filteredMovies.length; i += batchSize) {
            const batch = filteredMovies.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (movie: any) => {
                    try {
                        const detailResponse = await fetch(
                            `${TMDB_BASE_URL}/movie/${movie.id}?language=pt-BR`,
                            {
                                headers: {
                                    Authorization: `Bearer ${TMDB_TOKEN}`,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        const movieDetails = await detailResponse.json();

                        return {
                            id: movie.id,
                            title: movie.title,
                            poster_path: movie.poster_path,
                            backdrop_path: movie.backdrop_path,
                            overview: movie.overview,
                            release_date: movie.release_date,
                            imdb_id: movieDetails.imdb_id || null,
                            vote_average: movie.vote_average,
                        };
                    } catch (error) {
                        console.error(`Erro no filme ${movie.id}:`, error);
                        return {
                            id: movie.id,
                            title: movie.title,
                            poster_path: movie.poster_path,
                            backdrop_path: movie.backdrop_path,
                            overview: movie.overview,
                            release_date: movie.release_date,
                            imdb_id: null,
                            vote_average: movie.vote_average,
                        };
                    }
                })
            );

            moviesWithImdb.push(...batchResults);
        }

        // Atualiza cache
        moviesCache = moviesWithImdb;
        cacheTimestamp = Date.now();

        return NextResponse.json(moviesWithImdb);
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);

        // Em caso de erro, retorna cache antigo se existir
        if (moviesCache) {
            console.log('⚠️ Erro na API, retornando cache antigo');
            return NextResponse.json(moviesCache);
        }

        return NextResponse.json({ error: 'Erro ao buscar filmes' }, { status: 500 });
    }
}