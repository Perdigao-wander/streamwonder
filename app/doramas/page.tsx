import { Suspense } from 'react';
import { Metadata } from 'next';
import DoramasContent from './DoramasContent';

// Metadados estáticos para a página de Doramas
export const metadata: Metadata = {
    title: 'Doramas | StreamingWonder',
    description: 'Assista os melhores Doramas coreanos online. Descubra séries coreanas emocionantes, romances, comédias e muito mais. Atualizado diariamente.',
    keywords: [
        'doramas',
        'doramas coreanos',
        'séries coreanas',
        'k-dramas',
        'assistir doramas',
        'doramas online',
        'Korean dramas',
        'romance coreano',
        'séries coreanas online'
    ],
    openGraph: {
        title: 'Doramas | StreamingWonder',
        description: 'Assista os melhores Doramas coreanos online. Descubra séries coreanas emocionantes, romances, comédias e muito mais.',
        url: `https://streamwonder.vercel.app/doramas`,
        siteName: 'Plataforma de Streaming',
        images: [
            {
                url: '/Dorama.jpg',
                width: 1200,
                height: 630,
                alt: 'Doramas - Séries Coreanas',
            }
        ],
        locale: 'pt_BR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Doramas | StreamingWonder',
        description: 'Assista os melhores Doramas coreanos online. Descubra séries coreanas emocionantes, romances, comédias e muito mais.',
        images: ['/Dorama.jpg'],
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
        canonical: `https://streamwonder.vercel.app/doramas`,
    },
    applicationName: 'Plataforma de Streaming',
    authors: [{ name: 'Plataforma' }],
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    themeColor: '#4f46e5',
    colorScheme: 'dark',
    category: 'entretenimento',
    classification: 'streaming',
};

export default function DoramasPage() {
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
            <DoramasContent />
        </Suspense>
    );
}