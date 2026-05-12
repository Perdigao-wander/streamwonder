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
    vote_count: string;
    popularity: string;
    genre_ids: string;
    vote_average: string;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=pt-BR&page=${page}&include_adult=false`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        const movies = data.results
            .filter((movie: Movie) => !movie.adult)
            .map((movie: Movie) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            genre_ids: movie.genre_ids,
        }));

        return NextResponse.json({
            page: data.page,
            total_pages: data.total_pages,
            total_results: data.total_results,
            results: movies,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
    }
}