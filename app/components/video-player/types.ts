// components/video-player/types.ts
export type ContentType = 'movie' | 'tv';

export type PlayerId = 'warezcdn' | 'vidsrc-cc' | 'vidsrc-to' | '2embed';

export interface PlayerConfig {
    id: PlayerId;
    name: string;
    buildUrl: (params: PlayerUrlParams) => string;
    supportsTmdb: boolean;
}

export interface PlayerUrlParams {
    imdbId: string | null;
    tmdbId: number | null;
    type: ContentType;
    season: number | null;
    episode: number | null;
    autoPlay: boolean;
    autoNext?: boolean;
    defaultLanguage?: string;
}

export interface VideoPlayerProps {
    movieId?: number | null;
    tvId?: number | null;
    imdbId?: string | null;
    title: string;
    season?: number | null;
    episode?: number | null;
    seasons?: Season[];
    onClose: () => void;
    autoPlay?: boolean;
    autoNext?: boolean;
    defaultLanguage?: string;
}

export interface Season {
    id: number;
    season_number: number;
    name: string;
    overview: string;
    poster_path: string | null;
    episode_count: number;
    air_date: string | null;
}

export interface Episode {
    id: number;
    episode_number: number;
    name: string;
    overview: string;
    still_path: string | null;
    runtime: number | null;
    air_date: string | null;
}

export interface PlayerStatus {
    isLoading: boolean;
    hasError: boolean;
    currentUrl: string;
    usedIdentifier: 'imdb' | 'tmdb' | 'none';
    fallbackAttempted: boolean;
}

export interface EpisodeSelectorProps {
    seasons: Season[];
    currentSeason: number | null;
    currentEpisode: number | null;
    onSelectEpisode: (season: number, episode: number) => void;
    tvId: number;
    onClose: () => void;
}

export interface PlayerSelectorProps {
    selectedPlayerId: PlayerId;
    onPlayerChange: (playerId: PlayerId) => void;
    tmdbId: number | null;
    imdbId: string | null;
    contentType: ContentType; // Adicionado
}

export interface PlayerStatusProps {
    playerStatus: PlayerStatus;
    selectedPlayer?: PlayerConfig;
    onReload: () => void;
    onClose: () => void;
    tmdbId: number | null;
    imdbId: string | null;
}