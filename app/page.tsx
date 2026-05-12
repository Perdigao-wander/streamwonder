'use client';

import { Suspense } from 'react';
import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import LoadingSkeleton from '@/app/components/LoadingSkeleton';
import MoviesGrid from '@/app/components/MoviesGrid';
import TVShowsGrid from "@/app/components/TVShowsGrid";
import {ChevronRight, PlayCircle} from "lucide-react";
import Link from "next/link";
import ComicsGrid from "@/app/components/ComicsGrid";

export default function Home() {
  return (
      <div className="min-h-screen relative bg-gradient-to-b from-[#05050a] via-[#0a0a1a] to-[#0f0f13] text-white overflow-hidden">
          {/* Imagem de fundo fixa */}
          <div className="fixed inset-0 z-0">
              <img
                  src="/backgroud.jpg"
                  alt="Universo"
                  className="w-full h-full object-cover opacity-30"
              />
              {/* Overlay escuro para garantir legibilidade */}
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
                        {/* Header com título e botão "Ver mais" */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">
                                    Filmes Recentes 🎬
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
                        {/* Header com título e botão "Ver mais" */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">
                                    Séries 📺
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

                    {/* Seção de HQs Populares */}
                    <section className="max-w-7xl mx-auto px-4 py-12">
                        {/* Header com título e botão "Ver mais" */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">
                                    HQs 📚
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
                </div>

            </main>

            <footer className="bg-black/60 backdrop-blur-sm border-t border-white/5 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center transform transition-transform group-hover:scale-110">
                                <PlayCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
                STREAM<span className="text-indigo-500">WONDER</span>
              </span>
                        </div>

                        <div className="text-gray-500 text-sm text-center">
                            © 2026 StreamWonder.
                            <p className="text-xs text-gray-600 mt-1">Feito com ❤️ para amantes de filmes, doramas, séries e HQs</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
      </div>
  );
}