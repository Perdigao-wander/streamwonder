import { NextResponse } from 'next/server';

type Show = {
    id: string;
    title: string;
    name: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    first_air_date: string;
    release_date: string;
    vote_average: string;
    media_type: string;
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export async function GET() {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/airing_today?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        const tvShows = data.results.map((show: Show) => ({
            id: show.id,
            title: show.name,
            name: show.name,
            poster_path: show.poster_path,
            backdrop_path: show.backdrop_path,
            overview: show.overview,
            first_air_date: show.first_air_date,
            release_date: show.first_air_date,
            vote_average: show.vote_average,
            media_type: 'tv'
        }));

        return NextResponse.json(tvShows);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar séries' }, { status: 500 });
    }
}