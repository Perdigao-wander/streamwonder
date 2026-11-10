export type MediaCategory = 'series' | 'doramas' | 'animes';

export interface WatchlistItem {
    id: number;
    mediaType: 'movie' | 'tv';
    category?: MediaCategory;   // 🆕 'series' | 'doramas' | 'animes' (opcional p/ retrocompat)
    title: string;
    posterPath: string | null;
    backdropPath?: string | null;
    voteAverage?: number;
    releaseDate?: string;
    addedAt: number;
}

export interface ContinueWatchingItem {
    id: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
    season?: number;
    episode?: number;
    episodeTitle?: string;
    progress: number;
    duration: number;
    lastWatchedAt: number;
}