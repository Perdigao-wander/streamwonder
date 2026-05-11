'use client';

import { Suspense } from 'react';
import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import LoadingSkeleton from '@/app/components/LoadingSkeleton';
import MoviesGrid from '@/app/components/MoviesGrid';
import TVShowsGrid from "@/app/components/TVShowsGrid";
import {PlayCircle} from "lucide-react";

export default function Home() {
  return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] text-white">
        <Navbar />

        <main>
          <Suspense fallback={<LoadingSkeleton />}>
            <Hero />
          </Suspense>

            <div>
                {/* Seção de Filmes Populares */}
                <section className="max-w-7xl mx-auto px-4 py-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Filmes Recentes 🎬</h2>
                    <MoviesGrid type="movie" initialCategory="popular" />
                </section>

                {/* Seção de Séries Populares */}
                <section className="max-w-7xl mx-auto px-4 py-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Séries 📺</h2>
                    <TVShowsGrid/>
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
  );
}