import { NextResponse } from 'next/server';

type Movie = {
    id: string;
    title: string;
    poster_path: string;
    adult: boolean;
    backdrop_path: string;
    overview: string;
    release_date: string;
    vote_average: string;
}

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export async function GET() {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/popular?language=pt-BR`,
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
            }));

        return NextResponse.json(movies);
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        return NextResponse.json({ error: 'Erro ao buscar filmes' }, { status: 500 });
    }
}