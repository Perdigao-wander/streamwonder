import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/app/components/ScrollToTop";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StreamWonder - Filmes, Séries e HQs Online",
    template: "%s | StreamWonder",
  },
  description: "Assista filmes, séries, animes, doramas e HQs online grátis. O melhor conteúdo de entretenimento em um só lugar.",
  keywords: ["filmes", "séries", "animes", "doramas", "HQs", "streaming", "assistir online", "StreamWonder"],
  authors: [{ name: "StreamWonder" }],
  creator: "StreamWonder",
  publisher: "StreamWonder",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "StreamWonder - Filmes, Séries e HQs Online",
    description: "Assista filmes, séries, animes, doramas e HQs online grátis. O melhor conteúdo de entretenimento em um só lugar.",
    url: "https://streamwonder.vercel.app",
    siteName: "StreamWonder",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "StreamWonder",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamWonder - Filmes, Séries e HQs Online",
    description: "Assista filmes, séries, animes, doramas e HQs online grátis.",
    images: ["/logo.png"],
    creator: "@streamwonder",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a0c" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
  colorScheme: "dark",
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  verification: {
    google: "seu-google-verification-code",
    // other: ["seu-outro-codigo"],
  },
  category: "entertainment",
  classification: "Streaming",
  alternates: {
    canonical: "https://streamwonder.vercel.app",
    languages: {
      "pt-BR": "https://streamwonder.vercel.app/pt-BR",
      "en-US": "https://streamwonder.vercel.app/en-US",
    },
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="pt-BR"
          className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}
          suppressHydrationWarning
      >
      <body className="min-h-screen bg-gradient-to-b from-[#0a0a0c] to-[#0f0f13] text-white antialiased">
      {/* Skip to content link for accessibility */}
      <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg"
      >
        Pular para o conteúdo principal
      </a>

      {/* Main content */}
      <main id="main-content" className="flex-1">
        <Navbar />
        {children}
        <ScrollToTop />
        <Footer/>
      </main>
      </body>
      </html>
  );
}