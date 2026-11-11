import { NextResponse } from 'next/server';
import { HOOMAN_CAPTCHA_KEY, HOOMAN_RUCAPTCHA, WAREZCDN_API } from "@/lib/utils";
import hooman from 'hooman';

const BLOCKED_CATEGORIES = ['adulto', 'adult', '24-horas', 'canais-abertos', 'casa-do-patrao'];

export async function GET() {
    try {
        const response = await hooman.get(
            `${WAREZCDN_API}?category=channel_categories&format=json`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Referer': 'https://warezcdn.sbs/',
                },
                context: {
                    cloudflareRetry: 5,
                    captchaKey: HOOMAN_CAPTCHA_KEY,
                    rucaptcha: HOOMAN_RUCAPTCHA,
                },
            }
        );

        // hooman por padrão já pode retornar o body parseado se for JSON
        const data = typeof response.body === 'string'
            ? JSON.parse(response.body)
            : response.body;

        if (data?.success) {
            const filteredCategories = data.data.filter((category: any) => {
                const isBlocked = BLOCKED_CATEGORIES.some(
                    blocked => category.id?.toLowerCase() === blocked ||
                        category.name?.toLowerCase().includes(blocked)
                );
                return !isBlocked;
            });

            return NextResponse.json({
                categories: filteredCategories,
                total: filteredCategories.length,
                originalTotal: data.total,
            });
        } else {
            throw new Error('Erro ao buscar categorias: Payload inválido');
        }
    } catch (error: any) {
        console.error('Erro ao buscar categorias:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar categorias', details: error.message },
            { status: 500 }
        );
    }
}