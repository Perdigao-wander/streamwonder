import { NextRequest, NextResponse } from 'next/server';
import {TMDB_BASE_URL, TMDB_TOKEN} from "@/lib/utils";

type MediaType = 'movie' | 'tv';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

async function fetchTMDB(path: string): Promise<any | null> {
    try {
        const response = await fetch(`${TMDB_BASE_URL}${path}`, {
            headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ mediaType: string; id: string }> }
) {
    const { mediaType, id } = await params;

    // Validação
    if (mediaType !== 'movie' && mediaType !== 'tv') {
        return NextResponse.json(
            { error: 'mediaType deve ser "movie" ou "tv"' },
            { status: 400 }
        );
    }

    const numericId = parseInt(id);
    if (isNaN(numericId)) {
        return NextResponse.json(
            { error: 'ID inválido' },
            { status: 400 }
        );
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '12');
    const cacheKey = `${mediaType}-${numericId}-${limit}`;

    // Cache hit?
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json(cached.data);
    }

    try {
        // 1. Tenta recommendations primeiro
        let data = await fetchTMDB(
            `/${mediaType}/${numericId}/recommendations?language=pt-BR&page=1`
        );

        let source: 'recommendations' | 'similar' = 'recommendations';
        let results = data?.results || [];

        // 2. Fallback para similar se recommendations estiver vazio
        if (results.length === 0) {
            data = await fetchTMDB(
                `/${mediaType}/${numericId}/similar?language=pt-BR&page=1`
            );
            source = 'similar';
            results = data?.results || [];
        }

        // 3. Filtra conteúdo adulto e limita
        const filtered = results
            .filter((item: any) => !item.adult)
            .slice(0, limit)
            .map((item: any) => ({
                id: item.id,
                media_type: mediaType,
                title: item.title || item.name || '',
                name: item.name || item.title || '',
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                overview: item.overview,
                vote_average: item.vote_average,
                vote_count: item.vote_count,
                release_date: item.release_date,
                first_air_date: item.first_air_date,
                genre_ids: item.genre_ids,
            }));

        const payload = {
            source,
            results: filtered,
            total: filtered.length,
        };

        // Salva no cache
        cache.set(cacheKey, { data: payload, timestamp: Date.now() });

        return NextResponse.json(payload);
    } catch (error) {
        console.error(`[recommendations] Erro para ${mediaType}/${numericId}:`, error);
        return NextResponse.json(
            { error: 'Erro ao buscar recomendações' },
            { status: 500 }
        );
    }
}