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

// Tipo para a resposta final da API (sem episódios para não sobrecarregar)
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
    media_type: 'tv';
    imdb_id: string | null;
};

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

// Função para buscar IMDb ID reutilizando o endpoint interno
async function fetchImdbId(tvId: number): Promise<string | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        const imdbResponse = await fetch(
            `${baseUrl}/api/tv/${tvId}/imdb`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                // Adiciona cache para não chamar repetidamente
                next: { revalidate: 3600 } // Cache de 1 hora
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

        if (isNaN(tvId)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        // Busca detalhes da série
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 3600 } // Cache de 1 hora no Next.js
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: 'Série não encontrada' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Erro ao buscar série' }, { status: response.status });
        }

        const data: TMDBTVShowResponse = await response.json();

        // Verifica se a série existe
        if (!data.id) {
            return NextResponse.json({ error: 'Série não encontrada' }, { status: 404 });
        }

        // Processa as temporadas (filtra apenas temporadas com episódios)
        const seasons: ProcessedSeason[] = data.seasons
            .filter((season: TMDBSeason) => season.season_number > 0 && season.episode_count > 0)
            .map((season: TMDBSeason) => ({
                id: season.id,
                season_number: season.season_number,
                name: season.name || `Temporada ${season.season_number}`,
                overview: season.overview || "Sinopse não disponível",
                poster_path: season.poster_path,
                episode_count: season.episode_count,
                air_date: season.air_date
            }));

        // Busca o IMDb ID reutilizando o endpoint específico
        const imdbId = await fetchImdbId(tvId);

        const responseData: TVShowAPIResponse = {
            id: data.id,
            title: data.name,
            name: data.name,
            overview: data.overview || "Sinopse não disponível",
            backdrop_path: data.backdrop_path,
            poster_path: data.poster_path,
            first_air_date: data.first_air_date,
            last_air_date: data.last_air_date,
            number_of_seasons: data.number_of_seasons,
            number_of_episodes: data.number_of_episodes,
            vote_average: data.vote_average,
            genres: data.genres,
            seasons: seasons,
            media_type: 'tv',
            imdb_id: imdbId,
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Erro ao buscar série:', error);
        return NextResponse.json({ error: 'Erro interno ao buscar série' }, { status: 500 });
    }
}