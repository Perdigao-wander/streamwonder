import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const imdbCache = new Map<string, { imdbId: string | null; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

async function getParamsId(
    params: Promise<{ id: string }> | { id: string }
): Promise<string> {
    const resolvedParams = await params;
    return resolvedParams.id;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const tvId = await getParamsId(params);

        // Verifica cache
        const cached = imdbCache.get(tvId);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return NextResponse.json({
                tmdb_id: parseInt(tvId),
                imdb_id: cached.imdbId
            });
        }

        // Busca os detalhes da série com external_ids
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}?language=pt-BR&append_to_response=external_ids`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({
                error: 'Série não encontrada'
            }, { status: 404 });
        }

        const data = await response.json();
        const imdbId = data.external_ids?.imdb_id || null;

        // Armazena em cache
        imdbCache.set(tvId, { imdbId, timestamp: Date.now() });

        return NextResponse.json({
            tmdb_id: data.id,
            name: data.name,
            imdb_id: imdbId
        });
    } catch (error) {
        console.error('Erro ao buscar IMDb ID:', error);
        return NextResponse.json({
            error: 'Erro ao buscar IMDb ID'
        }, { status: 500 });
    }
}