import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;


type Serie = {
    id: string;
    title: string;
    name: string;
    poster_path: string;
    adult: boolean;
    backdrop_path: string;
    overview: string;
    first_air_date: string;
    vote_average: string;
    genre_ids: string;
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
            `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&language=pt-BR&page=${page}&include_adult=false`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

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
            genre_ids: serie.genre_ids,
        }));

        return NextResponse.json({
            page: data.page,
            total_pages: data.total_pages,
            total_results: data.total_results,
            results: series,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
    }
}