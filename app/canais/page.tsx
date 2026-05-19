import { Suspense } from 'react';
import { Metadata } from 'next';
import ChannelsContent from './ChannelsContent';

// Metadados para a página de Canais de TV
export const metadata: Metadata = {
    title: 'Canais de TV | StreamingWonder',
    description: 'Assista os melhores canais de TV online grátis. Canais abertos, filmes, séries, esportes, notícias, animes e muito mais. Atualizado diariamente.',
    keywords: [
        'canais de tv',
        'assistir tv online',
        'tv online grátis',
        'canais abertos',
        'canais de filmes',
        'canais de séries',
        'canais de esportes',
        'canais de notícias',
        'tv brasileira',
        'streaming tv',
        'canais ao vivo',
        'tv grátis'
    ],
    openGraph: {
        title: 'Canais de TV | StreamingWonder',
        description: 'Assista os melhores canais de TV online grátis. Canais abertos, filmes, séries, esportes, notícias, animes e muito mais.',
        url: `https://streamwonder.vercel.app/canais`,
        siteName: 'Plataforma de Streaming',
        images: [
            {
                url: '/canais.jpg',
                width: 1200,
                height: 630,
                alt: 'Canais de TV - Plataforma de Streaming',
            }
        ],
        locale: 'pt_BR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Canais de TV | Assistir TV Online Grátis',
        description: 'Assista os melhores canais de TV online grátis. Canais abertos, filmes, séries, esportes, notícias, animes e muito mais.',
        images: ['/canais.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: `https://streamwonder.vercel.app/canais`,
    },
    applicationName: 'Plataforma de Streaming',
    authors: [{ name: 'Plataforma de Streaming' }],
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    themeColor: '#4f46e5',
    colorScheme: 'dark',
    category: 'entretenimento',
    classification: 'streaming',
    verification: {
        google: 'seu-google-verification-code',
    },
};

export default function ChannelsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-800 rounded-xl aspect-video"></div>
                                <div className="h-4 bg-gray-800 rounded mt-2 w-3/4"></div>
                                <div className="h-3 bg-gray-800 rounded mt-1 w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        }>
            <ChannelsContent />
        </Suspense>
    );
}