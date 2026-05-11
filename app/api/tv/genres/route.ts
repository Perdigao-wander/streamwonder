import { NextResponse } from 'next/server';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

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