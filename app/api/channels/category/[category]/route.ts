import { NextRequest, NextResponse } from 'next/server';

import {HOOMAN_CAPTCHA_KEY, HOOMAN_RUCAPTCHA, PROXY_URL, WAREZCDN_API} from "@/lib/utils";
import hooman from "hooman";
import {HttpsProxyAgent} from "hpagent";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    const { category } = await params;
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

        console.log(genreId)

        const url = `${WAREZCDN_API}?category=canais&genre=${genreId}&format=json`;
        const response = await hooman.get(url,
            {
                context: {
                    captchaKey: HOOMAN_CAPTCHA_KEY,
                    rucaptcha: HOOMAN_RUCAPTCHA,
                },
                agent: {
                    https: new HttpsProxyAgent({
                        keepAlive: true,
                        keepAliveMsecs: 1000,
                        maxSockets: 256,
                        maxFreeSockets: 256,
                        proxy: PROXY_URL
                    })
                }
            });
        const data = typeof response.body === 'string'
            ? JSON.parse(response.body)
            : response.body;

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