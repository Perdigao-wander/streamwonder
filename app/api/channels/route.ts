import { NextRequest, NextResponse } from 'next/server';
import {HOOMAN_CAPTCHA_KEY, HOOMAN_RUCAPTCHA, PROXY_URL, WAREZCDN_API} from "@/lib/utils";
import hooman from 'hooman';
import {HttpsProxyAgent} from "hpagent";

const BLOCKED_CATEGORIES = ['adulto', 'adult'];
const BLOCKED_KEYWORDS = ['xxx', 'sex', 'adult', 'porn', 'hot', 'dreamsex'];

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const genre = searchParams.get('genre');
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '200';


    try {
        let url = `${WAREZCDN_API}?category=canais&format=json&limit=${limit}`;

        if (query) {
            url += `&q=${encodeURIComponent(query)}`;
        }

        if (genre) {
            url += `&genre=${encodeURIComponent(genre)}`;
        }
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

        console.log(JSON.parse(response.body))

        if (data.success) {
            // Filtrar canais adultos
            const filteredChannels = data.data.filter((channel: any) => {
                // Verificar se a categoria é bloqueada
                const isBlockedCategory = BLOCKED_CATEGORIES.some(
                    cat => channel.category?.toLowerCase().includes(cat)
                );

                // Verificar se o nome contém palavras bloqueadas
                const isBlockedName = BLOCKED_KEYWORDS.some(
                    keyword => channel.name?.toLowerCase().includes(keyword)
                );

                // Verificar se o ID contém palavras bloqueadas
                const isBlockedId = BLOCKED_KEYWORDS.some(
                    keyword => channel.id?.toLowerCase().includes(keyword)
                );

                return !isBlockedCategory && !isBlockedName && !isBlockedId;
            });

            return NextResponse.json({
                channels: filteredChannels,
                total: filteredChannels.length,
                originalTotal: data.total,
            });
        } else {
            throw new Error('Erro ao buscar canais');
        }
    } catch (error) {
        console.error('Erro ao buscar canais:', error);
        return NextResponse.json({ error: 'Erro ao buscar canais' }, { status: 500 });
    }
}