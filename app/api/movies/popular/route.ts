import { NextResponse } from 'next/server';

type Movie = {
    id: string;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    release_date: string;
    vote_average: string;
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
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

        // Retorna apenas os dados necessários
        const movies = data.results.map((movie: Movie) => ({
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
        return NextResponse.json({ error: 'Erro ao buscar filmes' }, { status: 500 });
    }
}