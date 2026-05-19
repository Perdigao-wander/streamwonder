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

const BLOCKED_TITLES = [
    'Tayuan',
    'Rita',
    'Hot Girls'
];

function isAdultContent(title: string): boolean {
    const normalizedTitle = title.toLowerCase().trim();

    const adultIndicators = [
        'ninfomaniaca','ninfomaníaca', 'nymphomaniac','Hot Girls',
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
        // Bloqueio parcial (se o título CONTER alguma palavra proibida)
        return normalizedTitle.includes(normalizedBlocked);
    });
}

function hasZeroVotes(movie: Movie): boolean {
    return movie.vote_average === 0 && movie.vote_count === 0;
}

function filterMovies(movies: Movie[]): Movie[] {
    let adultFlagCount = 0;
    let adultContentCount = 0;
    let blockedTitleCount = 0;
    let zeroVotesCount = 0;

    const filtered = movies.filter(movie => {
        // 1. Filtra filmes sem votação (vote_average = 0 e vote_count = 0)
        if (hasZeroVotes(movie)) {
            zeroVotesCount++;
            return false;
        }

        // 2. Filtra filmes adultos (flag da API)
        if (movie.adult) {
            adultFlagCount++;
            return false;
        }

        // 3. Filtra por conteúdo adulto no título
        if (isAdultContent(movie.title)) {
            adultContentCount++;
            return false;
        }

        // 4. Filtra títulos específicos da lista bloqueada
        if (isTitleBlocked(movie.title)) {
            blockedTitleCount++;
            return false;
        }

        return true;
    });

    return filtered;
}

async function calculateFilteredTotal(
    originalTotal: number,
    filteredCount: number,
    originalResults: Movie[]
): Promise<{ filteredTotalResults: number; filteredTotalPages: number }> {
    // Calcula a proporção de filmes que passaram pelo filtro
    const filterRatio = originalResults.length > 0
        ? filteredCount / originalResults.length
        : 1;

    // Aplica a mesma proporção ao total de resultados
    const filteredTotalResults = Math.floor(originalTotal * filterRatio);

    // Calcula o novo total de páginas (assumindo 20 filmes por página, padrão da API)
    const ITEMS_PER_PAGE = 20;
    const filteredTotalPages = Math.ceil(filteredTotalResults / ITEMS_PER_PAGE);

    return { filteredTotalResults, filteredTotalPages };
}

// Cache para IMDb IDs
const imdbCache = new Map<number, string | null>();
const cacheTimestamps = new Map<number, number>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

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

// Endpoint principal
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get('page') || '1';
    const sortBy = searchParams.get('sort_by') || 'vote_count.desc';
    const withGenres = searchParams.get('with_genres') || '';
    const primaryReleaseYear = searchParams.get('primary_release_year') || '';
    const voteAverageGte = searchParams.get('vote_average.gte') || '';
    const withKeywords = searchParams.get('with_keywords') || '';

    try {
        // 1. Construir URL da API
        let url = `${TMDB_BASE_URL}/discover/movie?include_adult=false&language=pt-BR&page=${page}&sort_by=${sortBy}`;

        if (withGenres) url += `&with_genres=${withGenres}`;
        if (primaryReleaseYear) url += `&primary_release_year=${primaryReleaseYear}`;
        if (voteAverageGte) url += `&vote_average.gte=${voteAverageGte}`;
        if (withKeywords) url += `&with_keywords=${withKeywords}`;

        // 2. Buscar filmes da API
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();

        // 3. Aplicar filtros (sem votação + adulto + conteúdo adulto + títulos bloqueados)
        const filteredMovies = filterMovies(data.results);

        // 4. Calcular totais atualizados baseados na filtragem
        const { filteredTotalResults, filteredTotalPages } = await calculateFilteredTotal(
            data.total_results,
            filteredMovies.length,
            data.results
        );

           // 5. Buscar IMDb IDs para todos os filmes filtrados
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
                    imdb_id: imdbId,
                };
            })
        );

        // 6. Retornar resposta com os totais atualizados
        return NextResponse.json({
            page: parseInt(page),
            total_pages: filteredTotalPages,
            total_results: filteredTotalResults,
            results: moviesWithImdb,
        });

    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar filmes. Tente novamente mais tarde.' },
            { status: 500 }
        );
    }
}