import { NextRequest, NextResponse } from 'next/server';

// Tipos para a API do TMDb
type TMDBGenre = {
    id: number;
    name: string;
};

type TMDBSeason = {
    id: number;
    season_number: number;
    name: string;
    overview: string;
    poster_path: string | null;
    episode_count: number;
    air_date: string | null;
};

type TMDBEpisode = {
    id: number;
    episode_number: number;
    name: string;
    overview: string;
    still_path: string | null;
    runtime: number | null;
    air_date: string | null;
};

type TMDBEpisodesResponse = {
    episodes: TMDBEpisode[];
};

type TMDBTVShowResponse = {
    id: number;
    name: string;
    overview: string;
    backdrop_path: string | null;
    poster_path: string | null;
    first_air_date: string;
    last_air_date: string;
    number_of_seasons: number;
    number_of_episodes: number;
    vote_average: number;
    genres: TMDBGenre[];
    seasons: TMDBSeason[];
};

// Tipo para a temporada processada (sem campos nulos opcionais)
type ProcessedSeason = {
    id: number;
    season_number: number;
    name: string;
    overview: string;
    poster_path: string | null;
    episode_count: number;
    air_date: string | null;
};

// Tipo para o episódio processado
type ProcessedEpisode = {
    id: number;
    episode_number: number;
    name: string;
    overview: string;
    still_path: string | null;
    runtime: number | null;
    air_date: string | null;
};

// Tipo para a resposta final da API
type TVShowAPIResponse = {
    id: number;
    title: string;
    name: string;
    overview: string;
    backdrop_path: string | null;
    poster_path: string | null;
    first_air_date: string;
    last_air_date: string;
    number_of_seasons: number;
    number_of_episodes: number;
    vote_average: number;
    genres: TMDBGenre[];
    seasons: ProcessedSeason[];
    episodes: ProcessedEpisode[];
    media_type: 'tv';
};

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Busca detalhes da série
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${id}?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data: TMDBTVShowResponse = await response.json();

        // Busca as temporadas com tipo correto
        const seasons: ProcessedSeason[] = data.seasons.map((season: TMDBSeason) => ({
            id: season.id,
            season_number: season.season_number,
            name: season.name,
            overview: season.overview,
            poster_path: season.poster_path,
            episode_count: season.episode_count,
            air_date: season.air_date
        }));

        // Busca os episódios da primeira temporada (opcional)
        let episodes: ProcessedEpisode[] = [];
        if (data.seasons && data.seasons.length > 0) {
            const episodesResponse = await fetch(
                `${TMDB_BASE_URL}/tv/${id}/season/1?language=pt-BR`, // ✅ Usar id após await
                {
                    headers: {
                        Authorization: `Bearer ${TMDB_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const episodesData: TMDBEpisodesResponse = await episodesResponse.json();
            episodes = episodesData.episodes?.map((ep: TMDBEpisode) => ({
                id: ep.id,
                episode_number: ep.episode_number,
                name: ep.name,
                overview: ep.overview,
                still_path: ep.still_path,
                runtime: ep.runtime,
                air_date: ep.air_date
            })) || [];
        }

        const responseData: TVShowAPIResponse = {
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
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Erro ao buscar série:', error);
        return NextResponse.json({ error: 'Erro ao buscar série' }, { status: 500 });
    }
}