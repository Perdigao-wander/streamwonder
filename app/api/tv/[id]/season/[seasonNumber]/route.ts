// app/api/tv/[id]/season/[seasonNumber]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

// ==================== TIPAGENS COMPLETAS ====================

type GuestStar = {
    character: string;
    credit_id: string;
    order: number;
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
};

type Crew = {
    job: string;
    department: string;
    credit_id: string;
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
};

type Network = {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
};

type TMDBEpisode = {
    air_date: string | null;
    episode_number: number;
    episode_type: string;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    runtime: number | null;
    season_number: number;
    show_id: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
    crew: Crew[];
    guest_stars: GuestStar[];
};

type TMDBSeasonResponse = {
    _id: string;
    air_date: string | null;
    episodes: TMDBEpisode[];
    name: string;
    overview: string;
    id: number;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
    networks?: Network[];
};

// ==================== TIPAGENS DE RESPOSTA PROCESSADA ====================

type ProcessedGuestStar = {
    character: string;
    name: string;
    original_name: string;
    profile_path: string | null;
};

type ProcessedCrew = {
    job: string;
    department: string;
    name: string;
};

type ProcessedEpisode = {
    id: number;
    episode_number: number;
    episode_type: string;
    name: string;
    overview: string;
    air_date: string | null;
    runtime: number | null;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
    crew: ProcessedCrew[];
    guest_stars: ProcessedGuestStar[];
};

type ProcessedNetwork = {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
};

type SeasonAPIResponse = {
    id: number;
    _id: string;
    name: string;
    overview: string;
    season_number: number;
    air_date: string | null;
    poster_path: string | null;
    vote_average: number;
    networks: ProcessedNetwork[];
    episodes: ProcessedEpisode[];
    total_episodes: number;
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; seasonNumber: string }> | { id: string; seasonNumber: string } }
) {
    try {
        // Resolve os parâmetros (Next.js 15+ usa Promise)
        const resolvedParams = await params;
        const { id, seasonNumber } = resolvedParams;

        const tvId = parseInt(id);
        const seasonNum = parseInt(seasonNumber);

        if (isNaN(tvId) || isNaN(seasonNum)) {
            return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
        }

        // Busca os detalhes da temporada no TMDb
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNum}?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: 'Temporada não encontrada' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Erro ao buscar temporada' }, { status: response.status });
        }

        const data: TMDBSeasonResponse = await response.json();

        // Processa os episódios com dados completos
        const episodes: ProcessedEpisode[] = data.episodes.map((ep: TMDBEpisode) => ({
            id: ep.id,
            episode_number: ep.episode_number,
            episode_type: ep.episode_type || 'standard',
            name: ep.name || `Episódio ${ep.episode_number}`,
            overview: ep.overview || "Sinopse não disponível",
            air_date: ep.air_date,
            runtime: ep.runtime,
            still_path: ep.still_path,
            vote_average: ep.vote_average || 0,
            vote_count: ep.vote_count || 0,
            crew: (ep.crew || []).map((member: Crew) => ({
                job: member.job,
                department: member.department,
                name: member.name
            })),
            guest_stars: (ep.guest_stars || []).map((star: GuestStar) => ({
                character: star.character,
                name: star.name,
                original_name: star.original_name,
                profile_path: star.profile_path
            }))
        }));

        // Processa as networks (canais/emissoras)
        const networks: ProcessedNetwork[] = (data.networks || []).map((network: Network) => ({
            id: network.id,
            name: network.name,
            logo_path: network.logo_path,
            origin_country: network.origin_country
        }));

        const responseData: SeasonAPIResponse = {
            id: data.id,
            _id: data._id,
            name: data.name || `Temporada ${seasonNum}`,
            overview: data.overview || "Sinopse não disponível",
            season_number: data.season_number,
            air_date: data.air_date,
            poster_path: data.poster_path,
            vote_average: data.vote_average || 0,
            networks: networks,
            episodes: episodes,
            total_episodes: episodes.length
        };
        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Erro ao buscar temporada:', error);
        return NextResponse.json({ error: 'Erro interno ao buscar temporada' }, { status: 500 });
    }
}