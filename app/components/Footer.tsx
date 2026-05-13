'use client';

import React from 'react';
import { PlayCircle, Heart, Tv, Film, BookOpen, Tv2, ExternalLink, Satellite, Drama, JapaneseYen } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const apis = [
        {
            name: 'TMDb',
            description: 'The Movie Database - Filmes, Séries e Animes',
            url: 'https://www.themoviedb.org/',
            icon: <Film className="w-4 h-4" />,
            color: 'hover:bg-green-500/20',
        },
        {
            name: 'Comic Vine',
            description: 'API de HQs e Quadrinhos',
            url: 'https://comicvine.gamespot.com/api/',
            icon: <BookOpen className="w-4 h-4" />,
            color: 'hover:bg-blue-500/20',
        },
        {
            name: 'WarezCdn',
            description: 'Provedor de vídeos e canais ao vivo',
            url: 'https://warezcdn.site/',
            icon: <Tv2 className="w-4 h-4" />,
            color: 'hover:bg-purple-500/20',
        },
    ];

    const platforms = [
        { name: 'Filmes', href: '/movies', icon: <Film className="w-4 h-4" /> },
        { name: 'Séries', href: '/series', icon: <Tv className="w-4 h-4" /> },
        { name: 'Doramas', href: '/doramas', icon: <Drama className="w-4 h-4" /> },
        { name: 'Animes', href: '/animes', icon: <JapaneseYen className="w-4 h-4" /> },
        { name: 'HQs', href: '/hqs', icon: <BookOpen className="w-4 h-4" /> },
        { name: 'Canais ao Vivo', href: '/canais', icon: <Satellite className="w-4 h-4" /> },
    ];

    return (
        <footer className="bg-black/80 backdrop-blur-md border-t border-white/10 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Grid principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Logo e descrição */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center transform transition-transform group-hover:scale-110">
                                <PlayCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
                                STREAM<span className="text-indigo-500">WONDER</span>
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Sua plataforma de streaming favorita com os melhores filmes, séries,
                            doramas, animes, HQs e canais ao vivo totalmente gratuitos.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                            <span>Feito com amor para você</span>
                        </div>
                    </div>

                    {/* Links rápidos */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Tv className="w-4 h-4 text-indigo-500" />
                            Conteúdos
                        </h3>
                        <ul className="space-y-2">
                            {platforms.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group"
                                    >
                                        {item.icon}
                                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                                            {item.name}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* APIs Utilizadas */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-indigo-500" />
                            APIs Utilizadas
                        </h3>
                        <ul className="space-y-3">
                            {apis.map((api) => (
                                <li key={api.name}>
                                    <a
                                        href={api.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`block p-2 rounded-lg transition-all duration-300 ${api.color} hover:scale-105 group`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="text-indigo-400 group-hover:scale-110 transition-transform">
                                                {api.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium">
                                                    {api.name}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    {api.description}
                                                </p>
                                            </div>
                                            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Informações legais */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-indigo-500" />
                            Informações
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="text-gray-400">
                                <span className="text-gray-500">Versão:</span> 1.0.0
                            </li>
                            <li className="text-gray-400">
                                <span className="text-gray-500">Plataforma:</span> Next.js 15
                            </li>
                            <li className="text-gray-400">
                                <span className="text-gray-500">Design:</span> Moderno & Responsivo
                            </li>
                            <li className="text-gray-400">
                                <span className="text-gray-500">Streaming:</span> Grátis
                            </li>
                        </ul>

                        {/* Selo de qualidade */}
                        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-center text-gray-500 text-xs">
                                🎬 Streaming Grátis • 📺 Canais ao Vivo • 📚 HQs Online
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-500 text-sm text-center md:text-left">
                            <p>© {currentYear} StreamWonder. Todos os direitos reservados.</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Os conteúdos são fornecidos por APIs de terceiros.
                                Não armazenamos nenhum arquivo em nossos servidores.
                            </p>
                        </div>

                        {/* Badge das APIs */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {apis.map((api) => (
                                <a
                                    key={api.name}
                                    href={api.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 bg-white/5 rounded-full text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    {api.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;