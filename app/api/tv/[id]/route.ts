import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;


export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Busca detalhes da série
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${params.id}?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        // Busca as temporadas
        const seasons = data.seasons.map((season: any) => ({
            id: season.id,
            season_number: season.season_number,
            name: season.name,
            overview: season.overview,
            poster_path: season.poster_path,
            episode_count: season.episode_count,
            air_date: season.air_date
        }));

        // Busca os episódios da primeira temporada (opcional)
        let episodes = [];
        if (data.seasons && data.seasons.length > 0) {
            const episodesResponse = await fetch(
                `${TMDB_BASE_URL}/tv/${params.id}/season/1?language=pt-BR`,
                {
                    headers: {
                        Authorization: `Bearer ${TMDB_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const episodesData = await episodesResponse.json();
            episodes = episodesData.episodes?.map((ep: any) => ({
                id: ep.id,
                episode_number: ep.episode_number,
                name: ep.name,
                overview: ep.overview,
                still_path: ep.still_path,
                runtime: ep.runtime,
                air_date: ep.air_date
            })) || [];
        }

        return NextResponse.json({
            id: data.id,
            title: data.name,
            name: data.name,
            overview: data.overview,
            backdrop_path: data.backdrop_path,
            poster_path: data.poster_path,
            first_air_date: data.first_air_date,
            last_air_date: data.last_air_date,
            number_of_seasons: data.number_of_seasons,
            number_of_episodes: data.number_of_episodes,
            vote_average: data.vote_average,
            genres: data.genres,
            seasons: seasons,
            episodes: episodes,
            media_type: 'tv'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar série' }, { status: 500 });
    }
}