'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContinueWatchingItem } from '@/types/watchlist';

const STORAGE_KEY = 'continue-watching';
const SYNC_EVENT = 'continue-watching-sync';
const COMPLETION_THRESHOLD = 0.95; // ≥ 95% = considerado assistido, remove
const MIN_PROGRESS = 30;            // < 30s = não conta (evita "clique acidental")

export function useContinueWatching() {
    const [items, setItems] = useState<ContinueWatchingItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (raw) setItems(JSON.parse(raw));
        } catch { /* noop */ }
        setIsHydrated(true);
    }, []);

    const persist = useCallback((next: ContinueWatchingItem[]) => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
        setItems(next);
        window.dispatchEvent(new CustomEvent(SYNC_EVENT));
    }, []);

    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try { setItems(JSON.parse(e.newValue)); } catch { /* noop */ }
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

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

    const getProgress = useCallback(
        (id: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => {
            return items.find(i =>
                i.id === id &&
                i.mediaType === mediaType &&
                i.season === season &&
                i.episode === episode
            );
        },
        [items]
    );

    const saveProgress = useCallback((entry: Omit<ContinueWatchingItem, 'lastWatchedAt'>) => {
        // Ignora cliques acidentais (menos de 30s)
        if (entry.progress < MIN_PROGRESS) return;

        // Se já passou de 95%, remove (considerado finalizado)
        const isComplete = entry.duration > 0 && entry.progress / entry.duration >= COMPLETION_THRESHOLD;

        setItems(prev => {
            const filtered = prev.filter(i =>
                !(i.id === entry.id && i.mediaType === entry.mediaType &&
                    i.season === entry.season && i.episode === entry.episode)
            );

            const next = isComplete
                ? filtered
                : [{ ...entry, lastWatchedAt: Date.now() }, ...filtered].slice(0, 20); // máx 20 itens

            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
            window.dispatchEvent(new CustomEvent(SYNC_EVENT));
            return next;
        });
    }, []);

    const removeProgress = useCallback((id: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => {
        setItems(prev => {
            const next = prev.filter(i =>
                !(i.id === id && i.mediaType === mediaType &&
                    i.season === season && i.episode === episode)
            );
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
            window.dispatchEvent(new CustomEvent(SYNC_EVENT));
            return next;
        });
    }, []);

    const clearAll = useCallback(() => persist([]), [persist]);

    return {
        items,
        isHydrated,
        getProgress,
        saveProgress,
        removeProgress,
        clearAll,
    };
}