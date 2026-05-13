'use client';

import React, { Suspense } from 'react';
import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import LoadingSkeleton from '@/app/components/LoadingSkeleton';
import MoviesGrid from '@/app/components/MoviesGrid';
import TVShowsGrid from "@/app/components/TVShowsGrid";
import {ChevronRight, Drama, Film, JapaneseYen, Satellite} from "lucide-react";
import Link from "next/link";
import ComicsGrid from "@/app/components/ComicsGrid";
import DoramasGrid from "@/app/components/DoramasGrid";
import {GiOpenBook} from "react-icons/gi";
import AnimeGrid from "@/app/components/AnimeGrid";
import ChannelsGrid from "@/app/components/ChannelsGrid";

export default function Home() {
    return (
        <div className="min-h-screen relative bg-gradient-to-b from-[#05050a] via-[#0a0a1a] to-[#0f0f13] text-white overflow-hidden">
            <div className="fixed inset-0 z-0">
                <img
                    src="/backgroud.jpg"
                    alt="Universo"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/90 via-[#0a0a1a]/100 to-[#0f0f13]/80" />
            </div>
            <div className="relative z-10">
                <Navbar />
                <main>
                    <Suspense fallback={<LoadingSkeleton />}>
                        <Hero />
                    </Suspense>
                    <div>
                        {/* Seção de Filmes Populares */}
                        <section className="max-w-7xl mx-auto px-4 py-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                                        Filmes Recentes
                                        <Film className="w-7 h-7 md:w-10 md:h-10 text-indigo-500" />
                                    </h2>
                                </div>
                                <Link
                                    href="/movies"
                                    className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all duration-300"
                                >
                                    <span>Ver todos</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>
                            </div>
                            <MoviesGrid type="movie" initialCategory="popular" limit={10} />
                        </section>

                        {/* Seção de Séries Populares */}
                        <section className="max-w-7xl mx-auto px-4 py-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                                        Séries
                                        <Satellite className="w-7 h-7 md:w-10 md:h-10 text-indigo-500" />
                                    </h2>
                                </div>
                                <Link
                                    href="/series"
                                    className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all duration-300"
                                >
                                    <span>Ver todos</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>
                            </div>
                            <TVShowsGrid/>
                        </section>

                        {/* Seção de Doramas */}
                        <section className="max-w-7xl mx-auto px-4 py-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                                        Doramas
                                        <Drama className="w-7 h-7 md:w-10 md:h-10 text-indigo-500" />
                                    </h2>
                                </div>
                                <Link
                                    href="/dorama"
                                    className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all duration-300"
                                >
                                    <span>Ver todos</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>
                            </div>
                            <DoramasGrid/>
                        </section>

                        {/* Seção de Animes */}
                        <section className="max-w-7xl mx-auto px-4 py-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                                        Animes
                                        <JapaneseYen className="w-7 h-7 md:w-10 md:h-10 text-indigo-500" />
                                    </h2>
                                </div>
                                <Link
                                    href="/animes"
                                    className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all duration-300"
                                >
                                    <span>Ver todos</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>
                            </div>
                            <AnimeGrid category="popular" limit={10} />
                        </section>

                        {/* Seção de HQs */}
                        <section className="max-w-7xl mx-auto px-4 py-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                                        HQs
                                        <GiOpenBook className="w-7 h-7 md:w-10 md:h-10 text-indigo-500" />
                                    </h2>
                                </div>
                                <Link
                                    href="/hqs"
                                    className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all duration-300"
                                >
                                    <span>Ver todos</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>
                            </div>
                            <ComicsGrid category="recent" limit={10} />
                        </section>

                        {/* Seção de Canais de TV */}
                        <section className="max-w-7xl mx-auto px-4 py-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                                        Canais ao Vivo
                                        <Satellite className="w-7 h-7 md:w-10 md:h-10 text-indigo-500" />
                                    </h2>
                                </div>
                                <Link
                                    href="/canais"
                                    className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all duration-300"
                                >
                                    <span>Ver todos</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>
                            </div>
                            <ChannelsGrid limit={12} />
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}