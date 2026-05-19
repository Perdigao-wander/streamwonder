import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

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