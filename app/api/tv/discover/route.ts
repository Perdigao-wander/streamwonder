import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

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
}

// Opções de ordenação disponíveis
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

    const excludeCountries = searchParams.get('exclude_countries');

    try {
        let url = `${TMDB_BASE_URL}/discover/tv?include_adult=false&include_null_first_air_dates=false&language=pt-BR&page=${page}&sort_by=${sortBy}`;

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

        const data = await response.json();

        let results = data.results;

        if (excludeCountries) {
            const excludedCountriesList = excludeCountries.split(',').map(c => c.trim().toUpperCase());

            results = data.results
                .filter((serie: Serie) => !serie.adult)
                .filter((serie: Serie) => {
                    // Se não tem origin_country, mantém (não conseguimos verificar)
                    if (!serie.origin_country || serie.origin_country.length === 0) {
                        return true;
                    }
                    // Verifica se algum país está na lista de excluídos
                    const hasExcludedCountry = serie.origin_country.some(country =>
                        excludedCountriesList.includes(country)
                    );
                    // Mantém apenas séries que NÃO têm países excluídos
                    return !hasExcludedCountry;
                });
        } else {
            results = data.results.filter((serie: Serie) => !serie.adult);
        }

        const series = results.map((serie: Serie) => ({
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
            page: data.page,
            total_pages: data.total_pages,
            total_results: series.length,
            results: series,
            sort_options: sortOptions,
            current_sort: sortBy,
            filtered: !!excludeCountries, // Indica se foi aplicado filtro
            excluded_countries: excludeCountries ? excludeCountries.split(',') : null,
        });
    } catch (error) {
        console.error('Erro ao buscar séries:', error);
        return NextResponse.json({ error: 'Erro ao buscar séries' }, { status: 500 });
    }
}