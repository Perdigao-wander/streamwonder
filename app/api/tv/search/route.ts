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

// LISTA DE TÍTULOS BLOQUEADOS
const BLOCKED_TITLES = [
    'Tayuan',
    'Rita',
    'Hot Girls'
];

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
        'sexy', 'sensual', 'xxx',
        'hentai', 'ecchi', 'yaoi', 'yuri'
    ];

    return adultIndicators.some(indicator =>
        normalizedTitle.includes(indicator)
    );
}

// Função para verificar se o título está na lista de bloqueio
function isTitleBlocked(title: string): boolean {
    const normalizedTitle = title.toLowerCase().trim();

    return BLOCKED_TITLES.some(blockedTitle => {
        const normalizedBlocked = blockedTitle.toLowerCase().trim();
        return normalizedTitle.includes(normalizedBlocked);
    });
}

// Função para verificar se a série tem votação zerada
function hasZeroVotes(serie: Serie): boolean {
    return serie.vote_average === 0 && serie.vote_count === 0;
}

// Função principal de filtragem de séries
function filterTVShows(shows: Serie[], excludeCountries?: string | null): Serie[] {
    let excludedCountriesList: string[] | null = null;

    if (excludeCountries) {
        excludedCountriesList = excludeCountries.split(',').map(c => c.trim().toUpperCase());
    }

    return shows.filter(show => {
        // Filtra séries sem votação
        if (hasZeroVotes(show)) return false;

        // Filtra séries adultas (flag da API)
        if (show.adult) return false;

        // Filtra por conteúdo adulto no título
        if (isAdultContent(show.name)) return false;

        // Filtra títulos específicos da lista bloqueada
        if (isTitleBlocked(show.name)) return false;

        // Filtra por país de origem excluído (se especificado)
        if (excludedCountriesList && excludedCountriesList.length > 0) {
            if (show.origin_country && show.origin_country.length > 0) {
                const hasExcludedCountry = show.origin_country.some(country =>
                    excludedCountriesList!.includes(country)
                );
                if (hasExcludedCountry) return false;
            }
        }

        return true;
    });
}

// Função para calcular o total de resultados considerando a filtragem
function calculateFilteredTotal(
    originalTotal: number,
    filteredCount: number,
    originalResults: Serie[]
): { filteredTotalResults: number; filteredTotalPages: number } {
    const filterRatio = originalResults.length > 0
        ? filteredCount / originalResults.length
        : 1;

    const filteredTotalResults = Math.floor(originalTotal * filterRatio);
    const ITEMS_PER_PAGE = 20;
    const filteredTotalPages = Math.ceil(filteredTotalResults / ITEMS_PER_PAGE);

    return { filteredTotalResults, filteredTotalPages };
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
    const excludeCountries = searchParams.get('exclude_countries');

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

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();

        // Converter tipos para garantir que vote_average e vote_count são números
        const seriesWithCorrectTypes = data.results.map((serie: Serie) => ({
            ...serie,
            vote_average: typeof serie.vote_average === 'string' ? parseFloat(serie.vote_average) : serie.vote_average,
            vote_count: typeof serie.vote_count === 'string' ? parseInt(serie.vote_count) : serie.vote_count,
        }));

        // Aplicar todos os filtros (incluindo países excluídos)
        const filteredSeries = filterTVShows(seriesWithCorrectTypes, excludeCountries);

        // Calcular totais atualizados baseados na filtragem
        const { filteredTotalResults, filteredTotalPages } = calculateFilteredTotal(
            data.total_results,
            filteredSeries.length,
            seriesWithCorrectTypes
        );

        // Buscar IMDb IDs em paralelo para todas as séries filtradas
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
                    imdb_id: imdbId,
                };
            })
        );

        // Retornar resposta com totais atualizados
        return NextResponse.json({
            page: parseInt(page),
            total_pages: filteredTotalPages,
            total_results: filteredTotalResults,
            results: seriesWithImdb,
            filter_stats: {
                original_total: data.total_results,
                original_results_count: data.results.length,
                filtered_results_count: filteredSeries.length,
                removed_count: data.results.length - filteredSeries.length,
                excluded_countries: excludeCountries ? excludeCountries.split(',') : null
            }
        });

    } catch (error) {
        console.error('Erro na busca de séries:', error);
        return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
    }
}