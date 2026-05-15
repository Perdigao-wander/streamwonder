"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Importe usePathname
import { Menu, X, PlayCircle, BookOpen, Film, Tv, Home, Drama, JapaneseYen, Satellite  } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname(); // Pega a rota atual

    // Detectar scroll para mudar o estilo do navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Impedir scroll do body quando menu mobile estiver aberto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const navLinks = [
        { href: '/', label: 'Início', icon: Home },
        { href: '/movies', label: 'Filmes', icon: Film },
        { href: '/series', label: 'Séries', icon: Tv },
        { href: '/doramas', label: 'Doramas', icon: Drama },
        { href: '/animes', label: 'Animes', icon: JapaneseYen },
        { href: '/canais', label: 'Canais', icon: Satellite },
        //{ href: '/hqs', label: 'HQs', icon: BookOpen },
    ];

    // Função para verificar se o link está ativo
    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            scrolled
                ? 'bg-black/95 backdrop-blur-md shadow-2xl border-b border-white/10'
                : 'bg-gradient-to-b from-black/10 via-black/10 to-transparent backdrop-blur-sm'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 group cursor-pointer"
                    >
                        <div className="relative">
                            <PlayCircle className="w-8 h-8 md:w-9 md:h-9 text-indigo-500 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-lg md:text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent whitespace-nowrap">
                                STREAM<span className="text-indigo-500">WONDER</span>
                            </span>
                            <span className="hidden xs:inline-block text-xs text-gray-400 leading-tight">
                                Filmes • Séries • HQs
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`relative px-4 py-2 rounded-md transition-all duration-300 group text-gray-300 hover:text-white`}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <link.icon className={`w-4 h-4 ${active ? 'text-white' : ''}`} />
                                        <span className="font-medium text-sm">{link.label}</span>
                                    </span>
                                    {/* Fundo do link ativo */}
                                    {active && (
                                        <span className="absolute inset-0 bg-indigo-500/90 rounded-md border border-indigo-500/70"></span>
                                    )}
                                    {/* Hover effect para links não ativos */}
                                    {!active && (
                                        <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-md transition-all duration-300"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg transition-all duration-300 bg-indigo-600 text-white"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden fixed inset-x-0 top-16 bg-black/95 backdrop-blur-md shadow-xl transition-all duration-300 transform ${
                isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
            }`}>
                <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
                    {navLinks.map((link, index) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    active
                                        ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <link.icon className={`w-5 h-5 ${active ? 'text-indigo-400' : ''}`} />
                                <span className="font-medium text-base">{link.label}</span>
                                {active && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-md bg-indigo-400"></span>
                                )}
                            </Link>
                        );
                    })}

                    <div className="pt-4 px-4">
                        <div className="text-center text-gray-400 text-xs pt-4 border-t border-gray-800">
                            <p>© 2026 StreamWonder</p>
                            <p className="mt-1">Feito com ❤️ para amantes de filmes, doramas, séries e HQs</p>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;