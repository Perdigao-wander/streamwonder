import { useState, useEffect } from 'react';
import { Genre } from '@/types/media';

export function useGenres() {
    const [genres, setGenres] = useState<Genre[]>([]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch('/api/tv/genres');
                const data = await response.json();
                setGenres(data);
            } catch (error) {
                console.error('Erro ao buscar gêneros:', error);
            }
        };
        fetchGenres();
    }, []);

    return { genres };
}