import { NextResponse } from 'next/server';
import {HOOMAN_CAPTCHA_KEY, HOOMAN_RUCAPTCHA, PROXY_URL, WAREZCDN_API} from "@/lib/utils";
import hooman from 'hooman';
import { HttpsProxyAgent } from 'hpagent'; // Importe o agente

const BLOCKED_CATEGORIES = ['adulto', 'adult','24-horas','canais-abertos','casa-do-patrao'];
export async function GET() {
    try {
        const response = await hooman.get(
            `${WAREZCDN_API}?category=channel_categories&format=json`,
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