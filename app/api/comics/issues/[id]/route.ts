import { NextRequest, NextResponse } from 'next/server';
import {cleanHtmlText} from "@/app/lib/utils";

const COMIC_VINE_API_KEY = process.env.NEXT_PUBLIC_COMIC_VINE_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_COMIC_VINE_API_URL

// Função para limpar o HTML

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const response = await fetch(
            `${BASE_URL}/issue/4000-${id}/?api_key=${COMIC_VINE_API_KEY}&format=json`,
            {
                headers: {
                    'User-Agent': 'StreamWonder/1.0',
                },
            }
        );

        const data = await response.json();

        if (data.error === 'OK') {
            // Limpa a descrição antes de enviar
            const cleanedComic = {
                ...data.results,
                description: cleanHtmlText(data.results.description || ''),
            };

            return NextResponse.json(cleanedComic);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erro ao buscar HQ:', error);
        return NextResponse.json({ error: 'Erro ao buscar HQ' }, { status: 500 });
    }
}