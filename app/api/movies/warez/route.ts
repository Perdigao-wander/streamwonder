import { NextRequest, NextResponse } from 'next/server';

const WAREZCDN_API = process.env.NEXT_PUBLIC_WAREZCDN_API;

// Mapeamento de categorias/gêneros para a API do WarezCdn
const GENRE_MAP: Record<string, string> = {
    '28': 'acao',           // Ação
    '12': 'aventura',       // Aventura
    '16': 'animacao',       // Animação
    '35': 'comedia',        // Comédia
    '80': 'crime',          // Crime
    '99': 'documentario',   // Documentário
    '18': 'drama',          // Drama
    '10751': 'familia',     // Família
    '14': 'fantasia',       // Fantasia
    '36': 'historia',       // História
    '27': 'terror',         // Terror
    '10402': 'musica',      // Música
    '9648': 'misterio',     // Mistério
    '10749': 'romance',     // Romance
    '878': 'ficcao-cientifica',        // Ficção Científica
    '10770': 'tv',          // Filme TV
    '53': 'suspense',       // Suspense
    '10752': 'guerra',      // Guerra
    '37': 'faroeste',       // Faroeste
};

// Mapeamento de ordenação
const SORT_MAP: Record<string, string> = {
    'popularity.desc': 'popularidade',
    'vote_average.desc': 'avaliacao',
    'release_date.desc': 'recentes',
    'release_date.asc': 'antigos',
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '200');
    const offset = (page - 1) * limit;

    // Parâmetros de filtro
    const selectedGenres = searchParams.get('with_genres') || '';
    const selectedYear = searchParams.get('primary_release_year') || '';
    const minRating = searchParams.get('vote_average.gte') || '';
    const sortBy = searchParams.get('sort_by') || 'popularity.desc';
    const searchQuery = searchParams.get('query') || '';

    try {
        // Construir URL base
        let apiUrl = `${WAREZCDN_API}?category=filme&type=imdb&format=json`;

        // 1. FILTRO POR GÊNERO
        if (selectedGenres) {
            const genreIds = selectedGenres.split(',');
            const genreNames = genreIds
                .map(id => GENRE_MAP[id])
                .filter(Boolean);

            if (genreNames.length > 0) {
                // O WarezCdn pode aceitar múltiplos gêneros separados por vírgula
                apiUrl += `&genre=${genreNames.join(',')}`;
            }
        }

        // 2. FILTRO POR ANO
        if (selectedYear) {
            apiUrl += `&year=${selectedYear}`;
        }

        // 3. FILTRO POR AVALIAÇÃO MÍNIMA
        if (minRating) {
            apiUrl += `&rating=${minRating}`;
        }

        // 4. ORDENAÇÃO
        const sortValue = SORT_MAP[sortBy] || 'popularidade';
        apiUrl += `&sort=${sortValue}`;

        // 5. BUSCA POR TEXTO
        if (searchQuery) {
            apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
        }

        console.log('URL da requisição:', apiUrl);

        // Buscar lista de IDs do WarezCdn com filtros aplicados
        const response = await fetch(apiUrl);
        const imdbIds: string[] = await response.json();

        // Se não houver resultados, retornar vazio
        if (!imdbIds || imdbIds.length === 0) {
            return NextResponse.json({
                results: [],
                total_results: 0,
                total_pages: 0,
                page: page,
            });
        }

        // Paginar os IDs
        const paginatedIds = imdbIds.slice(offset, offset + limit);

        // Buscar detalhes de cada filme no TMDb
        const movies = await Promise.all(
            paginatedIds.map(async (imdbId) => {
                try {
                    const tmdbResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/find/${imdbId}?external_source=imdb_id&language=pt-BR`,
                        {
                            headers: {
                                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    const data = await tmdbResponse.json();
                    const movie = data.movie_results?.[0];

                    // Aplicar filtro de conteúdo adulto
                    if (movie && !movie.adult) {
                        return {
                            id: movie.id,
                            title: movie.title,
                            poster_path: movie.poster_path,
                            backdrop_path: movie.backdrop_path,
                            overview: movie.overview,
                            release_date: movie.release_date,
                            vote_average: movie.vote_average,
                            vote_count: movie.vote_count,
                            popularity: movie.popularity,
                            genre_ids: movie.genre_ids,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error(`Erro ao buscar filme ${imdbId}:`, error);
                    return null;
                }
            })
        );

        // Filtrar resultados nulos
        const validMovies = movies.filter(movie => movie !== null);

        return NextResponse.json({
            results: validMovies,
            total_results: imdbIds.length,
            total_pages: Math.ceil(imdbIds.length / limit),
            page: page,
        });
    } catch (error) {
        console.error('Erro ao buscar filmes do WarezCdn:', error);
        return NextResponse.json({ error: 'Erro ao buscar filmes' }, { status: 500 });
    }
}