import { NextRequest, NextResponse } from 'next/server';
import {TMDB_BASE_URL, TMDB_TOKEN} from "@/lib/utils";


const ADULT_KEYWORDS = [
    '199513',  // porn
    '155567',  // hentai
    '155774',  // erotic
    '157912',  // softcore
    '242598',  // erotic movie
    '229236',  // adult
    '157384',  // nsfw
].join('|');

type Serie = {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    first_air_date: string;
    adult: boolean;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    origin_country: string[];
    original_language: string;
    original_name: string;
};

const sortOptions = {
    'popularity.desc': 'popularity.desc',
    'popularity.asc': 'popularity.asc',
    'vote_average.desc': 'vote_average.desc',
    'vote_average.asc': 'vote_average.asc',
    'first_air_date.desc': 'first_air_date.desc',
    'first_air_date.asc': 'first_air_date.asc',
    'vote_count.desc': 'vote_count.desc',
    'vote_count.asc': 'vote_count.asc',
    'original_title.desc': 'original_title.desc',
    'original_title.asc': 'original_title.asc',
    'name.desc': 'name.desc',
    'name.asc': 'name.asc',
};

const BLOCKED_TITLES = ['Tayuan', 'Rita', 'Hot Girls'];

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
        'hentai', 'ecchi', 'yaoi', 'yuri',
    ];
    return adultIndicators.some(indicator => normalizedTitle.includes(indicator));
}

function isTitleBlocked(title: string): boolean {
    const normalizedTitle = title.toLowerCase().trim();
    return BLOCKED_TITLES.some(blockedTitle =>
        normalizedTitle.includes(blockedTitle.toLowerCase().trim())
    );
}

function hasZeroVotes(serie: Serie): boolean {
    return serie.vote_average === 0 && serie.vote_count === 0;
}

function filterTVShows(shows: Serie[], excludeCountries?: string | null): Serie[] {
    let excludedCountriesList: string[] | null = null;

    if (excludeCountries) {
        excludedCountriesList = excludeCountries.split(',').map(c => c.trim().toUpperCase());
    }

    return shows.filter(show => {
        if (hasZeroVotes(show)) return false;
        if (show.adult) return false;
        if (isAdultContent(show.name)) return false;
        if (isTitleBlocked(show.name)) return false;

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

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get('page') || '1';
    const sortBy = searchParams.get('sort_by') || 'vote_count.desc';
    const withGenres = searchParams.get('with_genres') || '';
    const firstAirDateYear = searchParams.get('first_air_date_year') || '';
    const voteAverageGte = searchParams.get('vote_average.gte') || '';
    const voteAverageLte = searchParams.get('vote_average.lte') || '';
    const withKeywords = searchParams.get('with_keywords') || '';
    const withOriginCountry = searchParams.get('with_origin_country') || '';
    const withoutGenres = searchParams.get('without_genres') || '';
    const withRuntimeGte = searchParams.get('with_runtime.gte') || '';
    const withRuntimeLte = searchParams.get('with_runtime.lte') || '';
    const withTextQuery = searchParams.get('with_text_query') || '';
    const excludeCountries = searchParams.get('exclude_countries');

    try {
        let url;
        let data;

        if (withTextQuery) {
            // 🔍 Busca por texto: /search/tv (não suporta without_keywords)
            url = `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(withTextQuery)}&language=pt-BR&page=${page}&include_adult=false&sort_by=${sortBy}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            data = await response.json();
        } else {
            // 🎬 Discover: aplica without_keywords NA PRÓPRIA TMDB
            url = `${TMDB_BASE_URL}/discover/tv?include_adult=false&include_null_first_air_dates=false&language=pt-BR&page=${page}&sort_by=${sortBy}`;

            // 🎯 CORREÇÃO DEFINITIVA: exclui keywords adultas antes da paginação
            url += `&without_keywords=${ADULT_KEYWORDS}`;

            if (withGenres) url += `&with_genres=${withGenres}`;
            if (firstAirDateYear) url += `&first_air_date_year=${firstAirDateYear}`;
            if (voteAverageGte) url += `&vote_average.gte=${voteAverageGte}`;
            if (voteAverageLte) url += `&vote_average.lte=${voteAverageLte}`;
            if (withKeywords) url += `&with_keywords=${withKeywords}`;
            if (withOriginCountry) url += `&with_origin_country=${withOriginCountry}`;
            if (withoutGenres) url += `&without_genres=${withoutGenres}`;
            if (withRuntimeGte) url += `&with_runtime.gte=${withRuntimeGte}`;
            if (withRuntimeLte) url += `&with_runtime.lte=${withRuntimeLte}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            data = await response.json();
        }

        // Converter tipos para garantir que vote_average e vote_count são números
        const seriesWithCorrectTypes = data.results.map((serie: Serie) => ({
            ...serie,
            vote_average: typeof serie.vote_average === 'string' ? parseFloat(serie.vote_average) : serie.vote_average,
            vote_count: typeof serie.vote_count === 'string' ? parseInt(serie.vote_count) : serie.vote_count,
        }));

        const filteredByContent = filterTVShows(seriesWithCorrectTypes, excludeCountries);

        // Calcular totais atualizados baseados na filtragem
        const { filteredTotalResults, filteredTotalPages } = calculateFilteredTotal(
            data.total_results,
            filteredByContent.length,
            data.results
        );

        // Mapear para o formato de saída
        const series = filteredByContent.map((serie: Serie) => ({
            id: serie.id,
            title: serie.name,
            name: serie.name,
            adult: serie.adult,
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
        }));

        return NextResponse.json({
            page: parseInt(page),
            total_pages: filteredTotalPages,
            total_results: filteredTotalResults,
            results: series,
            sort_options: sortOptions,
            current_sort: sortBy,
            filtered: !!excludeCountries || filteredByContent.length !== data.results.length,
            excluded_countries: excludeCountries ? excludeCountries.split(',') : null,
            is_search: !!withTextQuery,
        });

    } catch (error) {
        console.error('Erro ao buscar séries:', error);
        return NextResponse.json({ error: 'Erro ao buscar séries' }, { status: 500 });
    }
}