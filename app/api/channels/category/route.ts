import { NextResponse } from 'next/server';
import {WAREZCDN_API} from "@/lib/utils";

const BLOCKED_CATEGORIES = ['adulto', 'adult','24-horas','canais-abertos','casa-do-patrao' ];

export async function GET() {
    try {
        const response = await fetch(`${WAREZCDN_API}?category=channel_categories&format=json`);
        console.log(response);

        const data = await response.json();

        if (data.success) {
            // Filtrar categorias adultas
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
            throw new Error('Erro ao buscar categorias');
        }
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 });
    }
}