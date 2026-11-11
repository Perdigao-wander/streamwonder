import { NextRequest, NextResponse } from 'next/server';

import {TMDB_BASE_URL, TMDB_TOKEN} from "@/lib/utils";


const ITEMS_PER_PAGE = 20;
const MAX_EXTRA_PAGES = 3; // reduzido: com without_keywords o fill quase nunca precisa

// 🎯 Keywords de conteúdo adulto na TMDB — excluídas ANTES da paginação
// Fonte: https://www.themoviedb.org/keyword/155477-sex  (e correlatas)
const ADULT_KEYWORDS = [
    '155477',  // sex
    '155774',  // erotic
    '10595',   // nudity
    '229236',  // adult
    '157384',  // nsfw
    '171997',  // sexual
    '192771',  // sex scene
    '199513',  // porn
    '155567',  // hentai
    '157912',  // softcore
    '195069',  // sex comedy
    '242598',  // erotic movie
].join('|');

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
};

const BLOCKED_TITLES = ['Tayuan', 'Rita', 'Hot Girls'];

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
    return adultIndicators.some(indicator => normalizedTitle.includes(indicator));
}

function isTitleBlocked(title: string): boolean {
    const normalizedTitle = title.toLowerCase().trim();
    return BLOCKED_TITLES.some(blockedTitle =>
        normalizedTitle.includes(blockedTitle.toLowerCase().trim())
    );
}

function hasZeroVotes(movie: Movie): boolean {
    return movie.vote_average === 0 && movie.vote_count === 0;
}

function filterMovies(movies: Movie[]): Movie[] {
    return movies.filter(movie => {
        if (hasZeroVotes(movie)) return false;
        if (movie.adult) return false;
        if (isAdultContent(movie.title)) return false;
        if (isTitleBlocked(movie.title)) return false;
        return true;
    });
}

// Cache para IMDb IDs
const imdbCache = new Map<number, string | null>();
const cacheTimestamps = new Map<number, number>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

async function fetchImdbId(movieId: number): Promise<string | null> {
    if (imdbCache.has(movieId)) {
        const timestamp = cacheTimestamps.get(movieId);
        if (timestamp && (Date.now() - timestamp) < CACHE_DURATION) {
            return imdbCache.get(movieId) ?? null;
        } else {
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

        if (!response.ok) return null;

        const data = await response.json();
        const imdbId = data.imdb_id || null;

        imdbCache.set(movieId, imdbId);
        cacheTimestamps.set(movieId, Date.now());

        return imdbId;
    } catch {
        return null;
    }
}

// Busca UMA página da TMDB e filtra (com fallback de segurança)
async function fetchAndFilterPage(
    baseUrl: string,
    page: number
): Promise<{ movies: Movie[]; totalPages: number; totalResults: number } | null> {
    try {
        const url = `${baseUrl}&page=${page}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) return null;

        const data = await response.json();
        return {
            movies: filterMovies(data.results),
            totalPages: data.total_pages,
            totalResults: data.total_results,
        };
    } catch {
        return null;
    }
}

// Preenche a página lógica com até ITEMS_PER_PAGE filmes filtrados
async function fetchPageWithFill(
    baseUrl: string,
    startPage: number
): Promise<{
    movies: Movie[];
    reachedEnd: boolean;
    lastTmdbPageFetched: number;
    originalTotalPages: number;
    originalTotalResults: number;
}> {
    const collected: Movie[] = [];
    let currentPage = startPage;
    let extras = 0;
    let reachedEnd = false;
    let originalTotalPages = 1;
    let originalTotalResults = 0;

    while (collected.length < ITEMS_PER_PAGE && extras <= MAX_EXTRA_PAGES) {
        const result = await fetchAndFilterPage(baseUrl, currentPage);
        if (!result) break;

        originalTotalPages = result.totalPages;
        originalTotalResults = result.totalResults;

        collected.push(...result.movies);

        if (currentPage >= result.totalPages) {
            reachedEnd = true;
            break;
        }

        currentPage++;
        extras++;
    }

    return {
        movies: collected.slice(0, ITEMS_PER_PAGE),
        reachedEnd,
        lastTmdbPageFetched: currentPage,
        originalTotalPages,
        originalTotalResults,
    };
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sort_by') || 'vote_count.desc';
    const withGenres = searchParams.get('with_genres') || '';
    const primaryReleaseYear = searchParams.get('primary_release_year') || '';
    const voteAverageGte = searchParams.get('vote_average.gte') || '';
    const withKeywords = searchParams.get('with_keywords') || '';

    try {
        // 1. Construir URL base (sem page — controlado pelo fill)
        let baseUrl = `${TMDB_BASE_URL}/discover/movie?include_adult=false&language=pt-BR&sort_by=${sortBy}`;

        // 🎯 CORREÇÃO DEFINITIVA: exclui keywords adultas NA PRÓPRIA TMDB
        //    Isso faz a filtragem local quase não remover nada → sem buracos → sem overlap
        baseUrl += `&without_keywords=${ADULT_KEYWORDS}`;

        if (withGenres) baseUrl += `&with_genres=${withGenres}`;
        if (primaryReleaseYear) baseUrl += `&primary_release_year=${primaryReleaseYear}`;
        if (voteAverageGte) baseUrl += `&vote_average.gte=${voteAverageGte}`;
        if (withKeywords) baseUrl += `&with_keywords=${withKeywords}`;

        // 2. Buscar com fill (raramente vai precisar de página extra agora)
        const {
            movies,
            reachedEnd,
            lastTmdbPageFetched,
            originalTotalPages,
        } = await fetchPageWithFill(baseUrl, page);

        // 3. Buscar IMDb IDs em paralelo (com cache)
        const moviesWithImdb = await Promise.all(
            movies.map(async (movie) => {
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

        // 4. Estima total_pages considerando o fill
        const pagesConsumedRatio = lastTmdbPageFetched / page;
        const estimatedTotalPages = Math.max(
            1,
            Math.ceil(originalTotalPages / Math.max(1, pagesConsumedRatio)) - 1
        );

        return NextResponse.json({
            page,
            total_pages: reachedEnd ? page : estimatedTotalPages,
            total_results: estimatedTotalPages * ITEMS_PER_PAGE,
            has_more: !reachedEnd && movies.length === ITEMS_PER_PAGE,
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