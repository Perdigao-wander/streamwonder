import { NextRequest, NextResponse } from 'next/server';
import {TMDB_BASE_URL, TMDB_TOKEN} from "@/lib/utils";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const movieResponse = await fetch(
            `${TMDB_BASE_URL}/movie/${id}?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const movieData = await movieResponse.json();

        console.log(movieData)

        // Busca vídeos (trailers, etc)
        const videosResponse = await fetch(
            `${TMDB_BASE_URL}/movie/${id}/videos?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const videosData = await videosResponse.json();

        // Gera URL do embed usando WarezCdn
        const embedUrl = `https://warezcdn.site/filme/${id}?autoplay=1`;

        return NextResponse.json({
            ...movieData,
            videos: videosData.results,
            embedUrl,
        });
    } catch (error) {
        console.error('Erro ao buscar filme:', error);
        return NextResponse.json({ error: 'Erro ao buscar filme' }, { status: 500 });
    }
}