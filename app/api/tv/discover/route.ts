import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

type Serie = {
    id: string;
    title: string;
    name: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    first_air_date: string;
    release_date: string;
    adult: boolean;
    vote_average: string;
    media_type: string;
    vote_count: string;
    popularity: string;
    genre_ids: string;
    origin_country: string;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get('page') || '1';
    const sortBy = searchParams.get('sort_by') || 'popularity.desc';
    const withGenres = searchParams.get('with_genres') || '';
    const firstAirDateYear = searchParams.get('first_air_date_year') || '';
    const voteAverageGte = searchParams.get('vote_average.gte') || '';
    const withKeywords = searchParams.get('with_keywords') || '';
    // 1. Capturar o novo parâmetro 'with_origin_country'
    const withOriginCountry = searchParams.get('with_origin_country') || '';

    try {
        let url = `${TMDB_BASE_URL}/discover/tv?include_adult=false&include_null_first_air_dates=false&language=pt-BR&page=${page}&sort_by=${sortBy}`;

        if (withGenres) url += `&with_genres=${withGenres}`;
        if (firstAirDateYear) url += `&first_air_date_year=${firstAirDateYear}`;
        if (voteAverageGte) url += `&vote_average.gte=${voteAverageGte}`;
        if (withKeywords) url += `&with_keywords=${withKeywords}`;
        // 2. Adicionar o filtro de país de origem à URL da requisição.
        //    "KR" é o código ISO 3166-1 para a Coreia do Sul.
        if (withOriginCountry) url += `&with_origin_country=${withOriginCountry}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        const series = data.results
            .filter((movie: Serie) => !movie.adult)
            .map((serie: Serie) => ({
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
        }));

        return NextResponse.json({
            page: data.page,
            total_pages: data.total_pages,
            total_results: data.total_results,
            results: series,
        });
    } catch (error) {
        console.error('Erro ao buscar séries:', error);
        return NextResponse.json({ error: 'Erro ao buscar séries' }, { status: 500 });
    }
}