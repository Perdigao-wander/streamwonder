// app/api/tv/[id]/route.ts
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

// Tipo para a temporada processada
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
    imdb_id: string | null;
};

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

// Função para buscar IMDb ID reutilizando o endpoint interno
async function fetchImdbId(tvId: number): Promise<string | null> {
    try {
        // Chama o endpoint interno de IMDb
        const imdbResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tv/${tvId}/imdb`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!imdbResponse.ok) {
            console.error(`Erro ao buscar IMDb ID para série ${tvId}: ${imdbResponse.status}`);
            return null;
        }

        const imdbData = await imdbResponse.json();
        return imdbData.imdb_id;
    } catch (error) {
        console.error(`Erro ao buscar IMDb ID para série ${tvId}:`, error);
        return null;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tvId = parseInt(id);

        // Busca detalhes da série (sem external_ids para não duplicar chamadas)
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Série não encontrada' }, { status: 404 });
        }

        const data: TMDBTVShowResponse = await response.json();

        // Verifica se a série existe
        if (!data.id) {
            return NextResponse.json({ error: 'Série não encontrada' }, { status: 404 });
        }

        // Busca as temporadas
        const seasons: ProcessedSeason[] = data.seasons.map((season: TMDBSeason) => ({
            id: season.id,
            season_number: season.season_number,
            name: season.name,
            overview: season.overview,
            poster_path: season.poster_path,
            episode_count: season.episode_count,
            air_date: season.air_date
        }));

        // Busca os episódios da primeira temporada
        let episodes: ProcessedEpisode[] = [];
        if (data.seasons && data.seasons.length > 0) {
            const firstSeason = data.seasons.find(s => s.season_number === 1);
            if (firstSeason) {
                const episodesResponse = await fetch(
                    `${TMDB_BASE_URL}/tv/${tvId}/season/1?language=pt-BR`,
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
        }

        // Busca o IMDb ID reutilizando o endpoint específico
        const imdbId = await fetchImdbId(tvId);

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
            media_type: 'tv',
            imdb_id: imdbId,
        };

        console.log(`✅ Série carregada: ${data.name} (TMDb: ${data.id}, IMDb: ${imdbId || 'N/A'})`);

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Erro ao buscar série:', error);
        return NextResponse.json({ error: 'Erro ao buscar série' }, { status: 500 });
    }
}