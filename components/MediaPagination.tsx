// components/Media/MediaPagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function MediaPagination({ currentPage, totalPages, onPageChange }: MediaPaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: number[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) pages.push(i);
        } else if (currentPage >= totalPages - 2) {
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 cursor-pointer rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            {getPageNumbers().map(pageNum => (
                <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-10 h-10 cursor-pointer rounded-lg transition-colors ${
                        currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    {pageNum}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 cursor-pointer rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}