import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy download for SubDL subtitle zip files.
 * This avoids cross-origin issues when downloading directly from dl.subdl.com.
 *
 * Usage: /api/subtitles/download?url=ENCODED_SUBDL_URL&name=filename.zip
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const name = request.nextUrl.searchParams.get("name") || "subtitle.zip";

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Only allow downloads from subdl.com for security
  if (!url.startsWith("https://dl.subdl.com/")) {
    return new NextResponse("Invalid download URL", { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; subtitle-proxy/1.0)",
        "Accept": "*/*",
        "Referer": "https://subdl.com/",
      },
    });

    if (!res.ok) {
      return new NextResponse("Failed to download from SubDL", { status: 502 });
    }

    const data = await res.arrayBuffer();

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Content-Length": String(data.byteLength),
      },
    });
  } catch {
    return new NextResponse("Download failed", { status: 500 });
  }
}
