import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get('page') || '1';
    const sortBy = searchParams.get('sort_by') || 'popularity.desc';
    const withGenres = searchParams.get('with_genres') || '';
    const primaryReleaseYear = searchParams.get('primary_release_year') || '';
    const voteAverageGte = searchParams.get('vote_average.gte') || '';
    const withKeywords = searchParams.get('with_keywords') || '';

    try {
        let url = `${TMDB_BASE_URL}/discover/movie?include_adult=false&language=pt-BR&page=${page}&sort_by=${sortBy}`;

        if (withGenres) url += `&with_genres=${withGenres}`;
        if (primaryReleaseYear) url += `&primary_release_year=${primaryReleaseYear}`;
        if (voteAverageGte) url += `&vote_average.gte=${voteAverageGte}`;
        if (withKeywords) url += `&with_keywords=${withKeywords}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        const movies = data.results.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            popularity: movie.popularity,
            genre_ids: movie.genre_ids,
        }));

        return NextResponse.json({
            page: data.page,
            total_pages: data.total_pages,
            total_results: data.total_results,
            results: movies,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar filmes' }, { status: 500 });
    }
}