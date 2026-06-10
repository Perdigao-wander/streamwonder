export interface Genre {
    id: number;
    name: string;
}

export interface MediaItem {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    backdrop_path?: string;
    overview?: string;
    imdb_id?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    genre_ids?: number[];
    original_language?: string;
    origin_country?: string[];
}