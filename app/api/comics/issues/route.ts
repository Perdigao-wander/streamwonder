import { NextRequest, NextResponse } from 'next/server';

const COMIC_VINE_API_KEY = process.env.NEXT_PUBLIC_COMIC_VINE_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_COMIC_VINE_API_URL

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const sort = searchParams.get('sort') || 'cover_date:desc';
    const filter = searchParams.get('filter') || '';

    try {
        let url = `${BASE_URL}/issues/?api_key=${COMIC_VINE_API_KEY}&format=json&limit=${limit}&offset=${(parseInt(page) - 1) * parseInt(limit)}&sort=${sort}`;

        if (filter) {
            url += `&filter=${filter}`;
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'StreamWonder/1.0',
            },
        });

        const data = await response.json();

        if (data.error === 'OK') {
            return NextResponse.json({
                results: data.results,
                total_results: data.number_of_total_results,
                total_pages: Math.ceil(data.number_of_total_results / parseInt(limit)),
                page: parseInt(page),
            });
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erro ao buscar HQs:', error);
        return NextResponse.json({ error: 'Erro ao buscar HQs' }, { status: 500 });
    }
}