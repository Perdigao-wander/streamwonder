// components/video-player/constants.ts
import { PlayerConfig } from './types';

export const PLAYERS_CONFIG: readonly PlayerConfig[] = [
    {
        id: 'warezcdn',
        name: 'WarezCDN',
        supportsTmdb: true,
        buildUrl: ({ imdbId, tmdbId, type, season, episode, autoPlay }): string => {
            const identifier = tmdbId ?? imdbId;
            if (!identifier) return '';

            const path = type === 'movie' ? 'filme' : 'serie';
            const url = `https://warezcdn.site/${path}/${identifier}`;

            const params = new URLSearchParams();
            if (autoPlay) params.set('autoplay', '1');
            if (type === 'tv' && season !== null && episode !== null) {
                params.set('s', String(season));
                params.set('e', String(episode));
            }

            const queryString = params.toString();
            return queryString ? `${url}?${queryString}` : url;
        }
    },
    {
        id: '2embed',
        name: '2Embed',
        supportsTmdb: true,
        buildUrl: ({ imdbId, tmdbId, type, season, episode, autoPlay }): string => {
            if (type === 'movie') {
                const identifier = tmdbId ?? imdbId;
                if (!identifier) return '';
                let url = `https://www.2embed.online/embed/movie/${identifier}`;
                if (autoPlay) url += `?autoplay=1`;
                return url;
            }

            if (type === 'tv') {
                const identifier = tmdbId ?? imdbId;
                if (!identifier || season === null || episode === null) return '';
                return `https://www.2embed.online/embed/tv/${identifier}/${season}/${episode}`;
            }

            return '';
        }
    },
    {
        id: 'vidsrc-cc',
        name: 'VidSrc CC',
        supportsTmdb: true,
        buildUrl: ({ imdbId, tmdbId, type, season, episode, autoPlay }): string => {
            const identifier = tmdbId ?? imdbId;
            if (!identifier) return '';

            let url = `https://vidsrc.cc/v2/embed/${type === 'movie' ? 'movie' : 'tv'}/${identifier}`;

            if (type === 'tv' && season !== null && episode !== null) {
                url += `/${season}/${episode}`;
            }

            if (autoPlay) url += `?autoplay=1`;
            return url;
        }
    },
    {
        id: 'vidsrc-to',
        name: 'Vidsrc.to',
        supportsTmdb: true,
        buildUrl: ({ imdbId, tmdbId, type, season, episode, autoPlay }): string => {
            const identifier = tmdbId ?? imdbId;
            if (!identifier) return '';

            let url = `https://vidsrc.to/embed/${type === 'movie' ? 'movie' : 'tv'}/${identifier}`;

            if (type === 'tv' && season !== null && episode !== null) {
                url += `/${season}/${episode}`;
            }

            if (autoPlay) url += `?autoplay=1`;
            return url;
        }
    }
] as const;