const SUBDL_API_KEY = process.env.NEXT_PUBLIC_SUBDL_API_KEY || "";
const SUBDL_BASE = "https://api.subdl.com/api/v1/subtitles";
const SUBDL_DL_BASE = "https://dl.subdl.com/subtitle";

export interface Subtitle {
  release_name: string;
  name: string;
  lang: string;
  author: string;
  url: string;
  subtitlePage: string;
  hi: boolean;
}

export interface SubtitleSearchResult {
  status: boolean;
  results: {
    imdb_id: string;
    tmdb_id: number;
    type: string;
    name: string;
    sd_id: number;
    year: number;
  }[];
  subtitles: {
    release_name: string;
    name: string;
    lang: string;
    author: string;
    url: string;
    subtitlePage: string;
    hi: boolean;
  }[];
}

export async function searchSubtitles(tmdbId: number): Promise<Subtitle[]> {
  if (!SUBDL_API_KEY) return [];

  try {
    const params = new URLSearchParams({
      api_key: SUBDL_API_KEY,
      tmdb_id: String(tmdbId),
      type: "movie",
      languages: "ID,EN",
      subs_per_page: "20",
    });

    const res = await fetch(`${SUBDL_BASE}?${params}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];

    const data: SubtitleSearchResult = await res.json();

    if (!data.status || !data.subtitles) return [];

    // Sort: Indonesian first, then English
    return data.subtitles
      .map((sub) => ({
        ...sub,
        url: `${SUBDL_DL_BASE}/${sub.url.replace(/^\/subtitle\//, "")}`,
      }))
      .sort((a, b) => {
        if (a.lang === "ID" && b.lang !== "ID") return -1;
        if (a.lang !== "ID" && b.lang === "ID") return 1;
        return 0;
      });
  } catch {
    return [];
  }
}
