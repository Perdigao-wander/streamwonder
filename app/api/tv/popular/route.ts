import { NextResponse } from 'next/server';

type TVShow = {
    id: string;
    name: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    adult: boolean;
    genre_ids: number[];
    origin_country: string[];
    original_language: string;
    original_name: string;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const EXCLUDED_COUNTRIES = ['JP', 'KR'];

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
function hasZeroVotes(show: TVShow): boolean {
    return show.vote_average === 0 && show.vote_count === 0;
}

// Função principal de filtragem de séries
function filterTVShows(shows: TVShow[]): TVShow[] {
    return shows.filter(show => {
        // Filtra séries sem votação
        if (hasZeroVotes(show)) return false;

        // Filtra séries adultas (flag da API)
        if (show.adult) return false;

        // Filtra por conteúdo adulto no título
        if (isAdultContent(show.name)) return false;

        // Filtra títulos específicos da lista bloqueada
        if (isTitleBlocked(show.name)) return false;

        // Filtra por país de origem excluído
        if (show.origin_country && show.origin_country.length > 0) {
            const hasExcludedCountry = show.origin_country.some(country =>
                EXCLUDED_COUNTRIES.includes(country)
            );
            if (hasExcludedCountry) return false;
        }

        return true;
    });
}

// Função para calcular o total de resultados considerando a filtragem
function calculateFilteredTotal(
    originalTotal: number,
    filteredCount: number,
    originalResults: TVShow[]
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
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/tv?language=pt-BR&sort_by=vote_count.desc&page=1`,
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

        // Converter tipos para consistentes
        const showsWithCorrectTypes = data.results.map((show: TVShow) => ({
            ...show,
            vote_average: typeof show.vote_average === 'string' ? parseFloat(show.vote_average) : show.vote_average,
            vote_count: typeof show.vote_count === 'string' ? parseInt(show.vote_count) : show.vote_count,
        }));

        // Aplicar todos os filtros
        const filteredShows = filterTVShows(showsWithCorrectTypes);

        // Calcular totais atualizados baseados na filtragem
        const { filteredTotalResults, filteredTotalPages } = calculateFilteredTotal(
            data.total_results,
            filteredShows.length,
            showsWithCorrectTypes
        );

        // Mapear para o formato de saída
        const tvShows = filteredShows.map((show: TVShow) => ({
            id: show.id,
            title: show.name,
            name: show.name,
            poster_path: show.poster_path,
            backdrop_path: show.backdrop_path,
            overview: show.overview,
            first_air_date: show.first_air_date,
            release_date: show.first_air_date,
            vote_average: show.vote_average,
            vote_count: show.vote_count,
            media_type: 'tv',
            origin_country: show.origin_country,
        }));

        return NextResponse.json(tvShows);

    } catch (error) {
        console.error('Erro ao buscar séries:', error);
        return NextResponse.json({ error: 'Erro ao buscar séries' }, { status: 500 });
    }
}