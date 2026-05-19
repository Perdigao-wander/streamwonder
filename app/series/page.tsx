import { Suspense } from 'react';
import { Metadata } from 'next';
import SeriesContent from './SeriesContent';

// Metadados para a página de Séries
export const metadata: Metadata = {
    title: 'Séries | StreamingWonder',
    description: 'Assista as melhores séries online. Descubra séries de ação, drama, comédia, ficção científica, terror e muito mais. Atualizado diariamente.',
    keywords: [
        'séries',
        'assistir séries',
        'séries online',
        'séries grátis',
        'séries 2024',
        'melhores séries',
        'séries populares',
        'séries ação',
        'séries drama',
        'séries comédia',
        'streaming séries',
        'séries tv',
        'seriados'
    ],
    openGraph: {
        title: 'Séries | StreamingWonder',
        description: 'Assista as melhores séries online. Descubra séries de ação, drama, comédia, ficção científica, terror e muito mais.',
        url: `https://streamwonder.vercel.app/series`,
        siteName: 'Plataforma de Streaming',
        images: [
            {
                url: '/series.jpg',
                width: 1200,
                height: 630,
                alt: 'Séries - Plataforma de Streaming',
            }
        ],
        locale: 'pt_BR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Séries | StreamingWonder',
        description: 'Assista as melhores séries online. Descubra séries de ação, drama, comédia, ficção científica, terror e muito mais.',
        images: ['/series.jpg'],
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
        canonical: `https://streamwonder.vercel.app/series`,
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

export default function SeriesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] pt-20">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-800 rounded-xl aspect-[2/3]"></div>
                                <div className="h-4 bg-gray-800 rounded mt-2 w-3/4"></div>
                                <div className="h-3 bg-gray-800 rounded mt-1 w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        }>
            <SeriesContent />
        </Suspense>
    );
}