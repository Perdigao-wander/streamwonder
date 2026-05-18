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

// LISTA DE TÍTULOS BLOQUEADOS (EXATOS OU PARCIAIS)
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

function calculateFilteredTotal(
    originalTotal: number,
    filteredCount: number,
    originalResults: Movie[]
): { filteredTotalResults: number; filteredTotalPages: number } {
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

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        // 1. Buscar filmes da API
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=pt-BR&page=${page}&include_adult=false`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();

        // Converter tipos para consistentes com o filter
        const moviesWithCorrectTypes = data.results.map((movie: any) => ({
            ...movie,
            vote_count: typeof movie.vote_count === 'string' ? parseInt(movie.vote_count) : movie.vote_count,
            vote_average: typeof movie.vote_average === 'string' ? parseFloat(movie.vote_average) : movie.vote_average,
            popularity: typeof movie.popularity === 'string' ? parseFloat(movie.popularity) : movie.popularity,
            genre_ids: Array.isArray(movie.genre_ids) ? movie.genre_ids : [],
        }));

        // 2. Aplicar todos os filtros
        const filteredMovies = filterMovies(moviesWithCorrectTypes);

        // 3. Calcular totais atualizados baseados na filtragem
        const { filteredTotalResults, filteredTotalPages } = calculateFilteredTotal(
            data.total_results,
            filteredMovies.length,
            moviesWithCorrectTypes
        );

        // 4. Mapear para o formato de saída
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

        // 5. Retornar resposta com os totais atualizados
        return NextResponse.json({
            page: parseInt(page),
            total_pages: filteredTotalPages,
            total_results: filteredTotalResults,
            results: movies,
        });

    } catch (error) {
        console.error('Erro na busca:', error);
        return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
    }
}