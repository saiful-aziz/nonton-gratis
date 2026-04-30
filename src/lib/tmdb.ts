const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
}

export interface MovieDetail extends Movie {
  genres: Genre[];
  runtime: number;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  imdb_id: string | null;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  spoken_languages: { iso_639_1: string; name: string; english_name: string }[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "id-ID",
    ...params,
  });

  const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getTrending(page = 1): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>("/trending/movie/week", { page: String(page) });
}

export async function getPopular(page = 1): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>("/movie/popular", { page: String(page) });
}

export async function getTopRated(page = 1): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>("/movie/top_rated", { page: String(page) });
}

export async function getNowPlaying(page = 1): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>("/movie/now_playing", { page: String(page) });
}

export async function getUpcoming(page = 1): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>("/movie/upcoming", { page: String(page) });
}

export async function getMoviesByGenre(genreId: number, page = 1): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
    page: String(page),
  });
}

export async function getMovieDetail(id: number): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${id}`, { append_to_response: "credits" });
}

export async function getMovieCredits(id: number): Promise<{ cast: Cast[] }> {
  return tmdbFetch<{ cast: Cast[] }>(`/movie/${id}/credits`);
}

export async function getSimilarMovies(id: number): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>(`/movie/${id}/similar`);
}

export async function searchMovies(query: string, page = 1): Promise<MovieResponse> {
  return tmdbFetch<MovieResponse>("/search/movie", { query, page: String(page) });
}

export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list");
  return data.genres;
}

export function getImageUrl(path: string | null, size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"): string {
  if (!path) return "/no-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// --- Embed providers (all iframe-embeddable, no API key needed) ---

export interface EmbedServer {
  key: string;
  label: string;
  getUrl: (tmdbId: number, imdbId: string | null, subInfoUrl?: string) => string;
}

export const EMBED_SERVERS: EmbedServer[] = [
  {
    key: "vidsrc-mov",
    label: "Server 1 (VidSrc Pro)",
    // vidsrc.mov supports ?sub.info= for external subtitle injection
    getUrl: (tmdbId, _imdbId, subInfoUrl) => {
      const base = `https://vidsrc.mov/embed/movie/${tmdbId}`;
      return subInfoUrl ? `${base}?sub.info=${encodeURIComponent(subInfoUrl)}` : base;
    },
  },
  {
    key: "vidsrc-icu",
    label: "Server 2 (VidSrc)",
    getUrl: (tmdbId) => `https://vidsrc.icu/embed/movie/${tmdbId}`,
  },
  {
    key: "multiembed",
    label: "Server 3 (MultiEmbed)",
    getUrl: (tmdbId, imdbId) =>
      imdbId
        ? `https://multiembed.mov/?video_id=${imdbId}&tmdb=1`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
  },
  {
    key: "autoembed",
    label: "Server 4 (AutoEmbed)",
    getUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
  },
];
