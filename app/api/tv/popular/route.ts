import { NextResponse } from 'next/server';

type TVShow = {
    id: string;
    name: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    adult: boolean;
    genre_ids: number[];
    origin_country: string[];
    original_language: string;
    original_name: string;
    first_air_date: string;
    vote_average: string;
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const EXCLUDED_COUNTRIES = ['JP', 'KR'];

export async function GET() {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/tv?language=pt-BR&sort_by=vote_count.desc`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();


        // Retorna apenas os dados necessários
        const tvShows = data.results
            .filter((movie: TVShow) => !movie.adult)
            .filter((serie: TVShow) => {
                if (!serie.origin_country || serie.origin_country.length === 0) {
                    return true;
                }
                const hasExcludedCountry = serie.origin_country.some(country =>
                    EXCLUDED_COUNTRIES.includes(country)
                );
                return !hasExcludedCountry;
            })
            .map((show: TVShow) => ({
            id: show.id,
            title: show.name,
            name: show.name,
            poster_path: show.poster_path,
            backdrop_path: show.backdrop_path,
            overview: show.overview,
            first_air_date: show.first_air_date,
            release_date: show.first_air_date, // Para compatibilidade
            vote_average: show.vote_average,
            media_type: 'tv'
        }));

        return NextResponse.json(tvShows);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar séries' }, { status: 500 });
    }
}