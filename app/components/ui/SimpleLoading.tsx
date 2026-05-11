// components/SimpleLoading.tsx
'use client';

export function SimpleLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
    );
}