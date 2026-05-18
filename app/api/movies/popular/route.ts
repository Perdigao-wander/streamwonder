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
    vote_count: number;
}

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const BLOCKED_TITLES = [
    'Tayuan',
    'Rita',
    'Hot Girls'
];

let moviesCache: Movie[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 3600000; // 1 hora em milissegundos

// Função para verificar se o título contém conteúdo adulto
function isAdultContent(title: string): boolean {
    const normalizedTitle = title.toLowerCase().trim();

    const adultIndicators = [
        'ninfomaniaca', 'ninfomaníaca', 'nymphomaniac', 'Hot Girls',
        '50 tons', 'fifty shades',
        '365 dias', '365 days',
        'caligula', 'emmanuelle',
        'salo', 'sodoma',
        'irreversible', 'cannibal',
        'centopeia', 'serbian',
        'porn', 'erotic', 'adult',
        'sexy', 'sensual', 'xxx'
    ];

    return adultIndicators.some(indicator =>
        normalizedTitle.includes(indicator)
    );
}

function isTitleBlocked(title: string): boolean {
    const normalizedTitle = title.toLowerCase().trim();

    return BLOCKED_TITLES.some(blockedTitle => {
        const normalizedBlocked = blockedTitle.toLowerCase().trim();
        return normalizedTitle.includes(normalizedBlocked);
    });
}

// Função para verificar se o filme tem votação zerada
function hasZeroVotes(movie: Movie): boolean {
    return movie.vote_average === 0 && movie.vote_count === 0;
}

function filterMovies(movies: Movie[]): Movie[] {
    return movies.filter(movie => {
        // Filtra filmes sem votação
        if (hasZeroVotes(movie)) return false;

        // Filtra filmes adultos
        if (movie.adult) return false;

        // Filtra por conteúdo adulto no título
        if (isAdultContent(movie.title)) return false;

        // Filtra títulos bloqueados
        if (isTitleBlocked(movie.title)) return false;

        return true;
    });
}

// Função para calcular o total de resultados considerando a filtragem
function calculateFilteredTotal(
    originalTotal: number,
    filteredCount: number,
    originalResults: Movie[]
): { filteredTotalResults: number; filteredTotalPages: number } {
    const filterRatio = originalResults.length > 0
        ? filteredCount / originalResults.length
        : 1;

    const filteredTotalResults = Math.floor(originalTotal * filterRatio);
    const ITEMS_PER_PAGE = 20;
    const filteredTotalPages = Math.ceil(filteredTotalResults / ITEMS_PER_PAGE);

    return { filteredTotalResults, filteredTotalPages };
}

export async function GET() {
    try {
        // Verifica se o cache é válido
        if (moviesCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
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

        // 2. Aplicar filtros (sem votação + adulto + conteúdo adulto + títulos bloqueados)
        const filteredMovies = filterMovies(listData.results);

        // 3. Calcular totais atualizados baseados na filtragem
        const { filteredTotalResults, filteredTotalPages } = calculateFilteredTotal(
            listData.total_results,
            filteredMovies.length,
            listData.results
        );

        // 4. Buscar detalhes em paralelo (limitando a 20 filmes por vez para não sobrecarregar)
        const batchSize = 20;
        const moviesWithImdb: Movie[] = [];

        for (let i = 0; i < filteredMovies.length; i += batchSize) {
            const batch = filteredMovies.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (movie: Movie) => {
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
                            adult: movie.adult,
                            poster_path: movie.poster_path,
                            backdrop_path: movie.backdrop_path,
                            overview: movie.overview,
                            release_date: movie.release_date,
                            imdb_id: movieDetails.imdb_id || null,
                            vote_average: movie.vote_average,
                            vote_count: movie.vote_count,
                        };
                    } catch (error) {
                        console.error(`Erro no filme ${movie.id}:`, error);
                        return {
                            id: movie.id,
                            title: movie.title,
                            adult: movie.adult,
                            poster_path: movie.poster_path,
                            backdrop_path: movie.backdrop_path,
                            overview: movie.overview,
                            release_date: movie.release_date,
                            imdb_id: null,
                            vote_average: movie.vote_average,
                            vote_count: movie.vote_count,
                        };
                    }
                })
            );

            moviesWithImdb.push(...batchResults);
        }

        moviesCache = moviesWithImdb;
        cacheTimestamp = Date.now();

        return NextResponse.json(moviesCache);
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);

        // Em caso de erro, retorna cache antigo se existir
        if (moviesCache) {
            return NextResponse.json(moviesCache);
        }

        return NextResponse.json({ error: 'Erro ao buscar filmes' }, { status: 500 });
    }
}