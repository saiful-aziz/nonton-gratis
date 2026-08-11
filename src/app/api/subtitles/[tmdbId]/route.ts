import { NextRequest, NextResponse } from "next/server";

const SUBDL_API_KEY = process.env.SUBDL_API_KEY || "";
const SUBDL_BASE = "https://api.subdl.com/api/v1/subtitles";

const LANG_LABELS: Record<string, string> = {
  ID: "Indonesian",
  EN: "English",
};

interface SubDLSubtitle {
  release_name: string;
  name: string;
  lang: string;
  author: string;
  url: string;
}

interface SubDLResponse {
  status: boolean;
  subtitles?: SubDLSubtitle[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  const { tmdbId } = await params;

  if (!SUBDL_API_KEY) {
    return NextResponse.json([], { headers: corsHeaders() });
  }

  try {
    const searchParams = new URLSearchParams({
      api_key: SUBDL_API_KEY,
      tmdb_id: tmdbId,
      type: "movie",
      languages: "ID,EN",
      subs_per_page: "10",
    });

    const res = await fetch(`${SUBDL_BASE}?${searchParams}`, {
      next: { revalidate: 3600 }, // cache SubDL search for 1h
    });

    if (!res.ok) {
      return NextResponse.json([], { headers: corsHeaders() });
    }

    const data: SubDLResponse = await res.json();

    if (!data.status || !data.subtitles || data.subtitles.length === 0) {
      return NextResponse.json([], { headers: corsHeaders() });
    }

    const seen = new Set<string>();
    const result: { file: string; label: string }[] = [];

    const sorted = [...data.subtitles].sort((a, b) => {
      if (a.lang === "ID" && b.lang !== "ID") return -1;
      if (a.lang !== "ID" && b.lang === "ID") return 1;
      return 0;
    });

    for (const sub of sorted) {
      if (seen.has(sub.lang)) continue;
      seen.add(sub.lang);

      // Strip leading /subtitle/ prefix and any query string (e.g. ?api_key=...)
      // then use a relative URL so it works on any domain
      const zipPath = sub.url.replace(/^\/subtitle\//, "").split("?")[0];
      const serveUrl = `/api/subtitles/${tmdbId}/serve?zip=${encodeURIComponent(zipPath)}&lang=${sub.lang}`;

      result.push({
        file: serveUrl,
        label: LANG_LABELS[sub.lang] || sub.lang,
      });
    }

    return NextResponse.json(result, { headers: corsHeaders() });
  } catch {
    return NextResponse.json([], { headers: corsHeaders() });
  }
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    // No caching — response contains relative URLs that must be fresh
    "Cache-Control": "no-store",
  };
}
