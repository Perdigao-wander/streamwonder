// types/watchlist.ts
export type MediaCategory = 'series' | 'doramas' | 'animes';

export interface WatchlistItem {
    id: number | string;              // 🆕 canais usam string
    mediaType: 'movie' | 'tv' | 'channel';  // 🆕 'channel'
    category?: MediaCategory;
    title: string;
    posterPath: string | null;
    backdropPath?: string | null;
    voteAverage?: number;
    releaseDate?: string;

    // 🆕 Apenas para canais:
    embedUrl?: string;
    channelCategory?: string;

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