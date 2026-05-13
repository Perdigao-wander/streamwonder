import { NextRequest, NextResponse } from 'next/server';

const WAREZCDN_API = process.env.NEXT_PUBLIC_WAREZCDN_API;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    const searchParams = request.nextUrl.searchParams;
    const { category } = await params;
    const limit = searchParams.get('limit') || '50';

    try {
        // Mapeamento de categorias para os IDs corretos
        const categoryMap: Record<string, string> = {
            '24-horas': '24-horas',
            'adulto': 'adulto',
            'animes': 'animes',
            'canais-abertos': 'canais-abertos',
            'casa-do-patrao': 'casa-do-patrao',
            'desenhos': 'desenhos',
            'documentarios': 'documentarios',
            'esportes': 'esportes',
            'filmes': 'filmes',
            'gospel': 'gospel',
            'infantil': 'infantil',
            'ingles': 'ingles',
            'internacionais': 'internacionais',
            'miamitv': 'miamitv',
            'noticias': 'noticias',
            'realitys': 'realitys',
            'series': 'series',
            'variedades': 'variedades',
        };

        const genreId = categoryMap[category];
        if (!genreId) {
            return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 });
        }

        const url = `${WAREZCDN_API}?category=canais&format=json&genre=${genreId}&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            return NextResponse.json({
                channels: data.data,
                category: category,
                total: data.total,
            });
        } else {
            throw new Error('Erro ao buscar canais');
        }
    } catch (error) {
        console.error('Erro ao buscar canais por categoria:', error);
        return NextResponse.json({ error: 'Erro ao buscar canais' }, { status: 500 });
    }
}