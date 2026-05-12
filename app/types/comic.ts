export interface ComicIssue {
    id: number;
    name: string;
    volume: {
        id: number;
        name: string;
    };
    cover_date: string;
    description?: string;
    image: {
        super_url: string;
        thumb_url: string;
        small_url: string;
    };
    issue_number: string;
    page_count?: number;
    price?: string;
    character_credits?: Array<{
        id: number;
        name: string;
    }>;
    location_credits?: Array<{
        id: number;
        name: string;
    }>;
    person_credits?: Array<{
        id: number;
        name: string;
        role: string;
    }>;
    publisher?: {
        id: number;
        name: string;
    };
    story_arc_credits?: Array<{
        id: number;
        name: string;
    }>;
}

export interface ComicVolume {
    id: number;
    name: string;
    description?: string;
    image: {
        super_url: string;
        thumb_url: string;
    };
    start_year: string;
    publisher: {
        id: number;
        name: string;
    };
    issues?: ComicIssue[];
}

export interface ComicCharacter {
    id: number;
    name: string;
    real_name?: string;
    description?: string;
    image: {
        super_url: string;
        thumb_url: string;
    };
    publisher?: {
        id: number;
        name: string;
    };
}