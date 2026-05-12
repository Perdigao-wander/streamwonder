'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const height = document.body.scrollHeight - window.innerHeight;
            const progress = (scrollY / height) * 100;

            setIsVisible(scrollY > 300);
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 group"
            aria-label="Voltar ao topo"
        >
            <div className="relative w-12 h-12">
                {/* Círculo de progresso */}
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="rgba(99, 102, 241, 0.2)"
                        strokeWidth="2"
                    />
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                        strokeDasharray={`${scrollProgress * 1.005} 100`}
                        className="transition-all duration-300"
                    />
                </svg>
                {/* Ícone central */}
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-indigo-600 shadow-lg transition-all duration-300 hover:scale-105 rounded-full group-hover:scale-110 m-1">
                    <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
                </div>
            </div>
        </button>
    );
};

export default ScrollToTop;