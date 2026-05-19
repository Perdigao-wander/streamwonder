// api/movies/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

type Movie = {
    id: string;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    release_date: string;
    adult: boolean;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    vote_average: number;
    imdb_id?: string | null;
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
    return adultIndicators.some(indicator => normalizedTitle.includes(indicator));
}

function isTitleBlocked(title: string): boolean {
    const normalizedTitle = title.toLowerCase().trim();
    return BLOCKED_TITLES.some(blockedTitle => {
        const normalizedBlocked = blockedTitle.toLowerCase().trim();
        return normalizedTitle.includes(normalizedBlocked);
    });
}

function hasZeroVotes(movie: Movie): boolean {
    return movie.vote_average === 0 && movie.vote_count === 0;
}

// Função para aplicar filtros adicionais (gêneros, ano, rating)
function applyAdditionalFilters(
    movies: Movie[],
    withGenres: string,
    primaryReleaseYear: string,
    voteAverageGte: string
): Movie[] {
    return movies.filter(movie => {
        // Filtrar por gêneros
        if (withGenres) {
            const genreIds = withGenres.split(',').map(Number);
            const hasGenre = genreIds.some(genreId =>
                movie.genre_ids?.includes(genreId)
            );
            if (!hasGenre) return false;
        }

        // Filtrar por ano de lançamento
        if (primaryReleaseYear && movie.release_date) {
            const movieYear = movie.release_date.split('-')[0];
            if (movieYear !== primaryReleaseYear) return false;
        }

        // Filtrar por avaliação mínima
        if (voteAverageGte && movie.vote_average) {
            if (movie.vote_average < parseFloat(voteAverageGte)) return false;
        }

        return true;
    });
}

function filterMovies(movies: Movie[]): Movie[] {
    const filtered = movies.filter(movie => {
        if (hasZeroVotes(movie)) return false;
        if (movie.adult) return false;
        if (isAdultContent(movie.title)) return false;
        if (isTitleBlocked(movie.title)) return false;
        return true;
    });
    return filtered;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';

    // Receber filtros da URL
    const sortBy = searchParams.get('sort_by') || 'popularity.desc';
    const withGenres = searchParams.get('with_genres') || '';
    const primaryReleaseYear = searchParams.get('primary_release_year') || '';
    const voteAverageGte = searchParams.get('vote_average.gte') || '';

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        // Construir URL base da busca (sem filtros, pois a API de search não suporta)
        let url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=pt-BR&page=${page}&include_adult=false`;

        url += `&sort_by=${sortBy}`;

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

        const moviesWithCorrectTypes = data.results.map((movie: Movie) => ({
            ...movie,
            vote_count: typeof movie.vote_count === 'string' ? parseInt(movie.vote_count) : movie.vote_count,
            vote_average: typeof movie.vote_average === 'string' ? parseFloat(movie.vote_average) : movie.vote_average,
            popularity: typeof movie.popularity === 'string' ? parseFloat(movie.popularity) : movie.popularity,
            genre_ids: Array.isArray(movie.genre_ids) ? movie.genre_ids : [],
        }));

        // Primeiro aplicar filtros básicos (conteúdo adulto, etc.)
        let filteredMovies = filterMovies(moviesWithCorrectTypes);

        // Depois aplicar filtros adicionais (gêneros, ano, rating)
        filteredMovies = applyAdditionalFilters(
            filteredMovies,
            withGenres,
            primaryReleaseYear,
            voteAverageGte
        );

        const movies = filteredMovies.map((movie: Movie) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            genre_ids: movie.genre_ids,
        }));

        // Calcular total de páginas baseado nos filmes filtrados
        const ITEMS_PER_PAGE = 20;
        const filteredTotalPages = Math.ceil(movies.length / ITEMS_PER_PAGE);

        return NextResponse.json({
            page: parseInt(page),
            total_pages: filteredTotalPages,
            total_results: movies.length,
            results: movies,
        });

    } catch (error) {
        console.error('Erro na busca:', error);
        return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
    }
}