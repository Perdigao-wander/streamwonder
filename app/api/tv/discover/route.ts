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

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get('page') || '1';
    const sortBy = searchParams.get('sort_by') || 'popularity.desc';
    const withGenres = searchParams.get('with_genres') || '';
    const firstAirDateYear = searchParams.get('first_air_date_year') || '';
    const voteAverageGte = searchParams.get('vote_average.gte') || '';
    const withKeywords = searchParams.get('with_keywords') || '';
    const withOriginCountry = searchParams.get('with_origin_country') || '';

    try {
        let url = `${TMDB_BASE_URL}/discover/tv?include_adult=false&include_null_first_air_dates=false&language=pt-BR&page=${page}&sort_by=${sortBy}`;

        if (withGenres) url += `&with_genres=${withGenres}`;
        if (firstAirDateYear) url += `&first_air_date_year=${firstAirDateYear}`;
        if (voteAverageGte) url += `&vote_average.gte=${voteAverageGte}`;
        if (withKeywords) url += `&with_keywords=${withKeywords}`;
        if (withOriginCountry) url += `&with_origin_country=${withOriginCountry}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        const series = data.results
            .filter((serie: Serie) => !serie.adult)
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
                original_language: serie.original_language,
                original_name: serie.original_name,
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