'use client';

import { useState, useEffect, useCallback } from 'react';
import { WatchlistItem } from '@/types/watchlist';

const STORAGE_KEY = 'watchlist';
const SYNC_EVENT = 'watchlist-sync';

// 🆕 Agenda o dispatch para depois do render atual
const scheduleSync = () => {
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent(SYNC_EVENT));
    }, 0);
};

export function useWatchlist() {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hidrata do localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (raw) setItems(JSON.parse(raw));
        } catch (err) {
            console.error('Erro ao ler watchlist:', err);
        }
        setIsHydrated(true);
    }, []);

    // Persiste + notifica outras instâncias do hook
    const persist = useCallback((next: WatchlistItem[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (err) {
            console.error('Erro ao salvar watchlist:', err);
        }
        setItems(next);
        scheduleSync();   // 🆕 (antes era window.dispatchEvent direto)
    }, []);

    // Sincronização entre abas
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try { setItems(JSON.parse(e.newValue)); } catch { /* noop */ }
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    // Sincronização entre componentes na mesma aba
    useEffect(() => {
        const handler = () => {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) setItems(JSON.parse(raw));
            } catch { /* noop */ }
        };
        window.addEventListener(SYNC_EVENT, handler);
        return () => window.removeEventListener(SYNC_EVENT, handler);
    }, []);

    const isInWatchlist = useCallback(
        (id: number | string, mediaType: 'movie' | 'tv' | 'channel') =>
            items.some(item => item.id === id && item.mediaType === mediaType),
        [items]
    );

    const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
        setItems(prev => {
            if (prev.some(i => i.id === item.id && i.mediaType === item.mediaType)) {
                return prev;
            }
            const next = [{ ...item, addedAt: Date.now() }, ...prev];
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
            return next;
        });
        scheduleSync();   // 🆕 FORA do setItems updater
    }, []);

    const removeFromWatchlist = useCallback(
        (id: number | string, mediaType: 'movie' | 'tv' | 'channel') => {
            setItems(prev => {
                const next = prev.filter(i => !(i.id === id && i.mediaType === mediaType));
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
                return next;
            });
            scheduleSync();   // 🆕 FORA do setItems updater
        }, []
    );

    const toggleWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
        if (isInWatchlist(item.id, item.mediaType)) {
            removeFromWatchlist(item.id, item.mediaType);
        } else {
            addToWatchlist(item);
        }
    }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

    const clearWatchlist = useCallback(() => persist([]), [persist]);

    return {
        items,
        isHydrated,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        clearWatchlist,
    };
}