import { NextResponse } from 'next/server';
import {TMDB_BASE_URL, TMDB_TOKEN} from "@/lib/utils";


export async function GET() {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/genre/tv/list?language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();
        return NextResponse.json(data.genres);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar gêneros' }, { status: 500 });
    }
}