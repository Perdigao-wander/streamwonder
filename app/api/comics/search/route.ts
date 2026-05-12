import { NextRequest, NextResponse } from 'next/server';

const COMIC_VINE_API_KEY = process.env.NEXT_PUBLIC_COMIC_VINE_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_COMIC_VINE_API_URL

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `${BASE_URL}/issues/?api_key=${COMIC_VINE_API_KEY}&format=json&limit=${limit}&offset=${(parseInt(page) - 1) * parseInt(limit)}&filter=name:${encodeURIComponent(query)}`,
            {
                headers: {
                    'User-Agent': 'StreamWonder/1.0',
                },
            }
        );

        const data = await response.json();

        return NextResponse.json({
            results: data.results,
            total_results: data.number_of_total_results,
            total_pages: Math.ceil(data.number_of_total_results / parseInt(limit)),
            page: parseInt(page),
        });
    } catch (error) {
        console.error('Erro na busca:', error);
        return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
    }
}