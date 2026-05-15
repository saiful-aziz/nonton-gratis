import { NextRequest, NextResponse } from "next/server";

const SUBDL_DL_BASE = "https://dl.subdl.com/subtitle";

/**
 * Downloads a subtitle zip from SubDL, extracts the first .srt/.ass file,
 * converts it to WebVTT, and serves it directly.
 *
 * Query params:
 *   zip  - the zip path on SubDL (e.g. "2550542-2754528.zip")
 *   lang - language code for cache headers
 */
export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip");

  if (!zip) {
    return new NextResponse("Missing zip parameter", { status: 400 });
  }

  try {
    const zipUrl = `${SUBDL_DL_BASE}/${zip}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    const res = await fetch(zipUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; subtitle-proxy/1.0)",
        "Accept": "*/*",
        "Referer": "https://subdl.com/",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`SubDL fetch failed: ${res.status} ${res.statusText} for ${zipUrl}`);
      return new NextResponse("Failed to download subtitle", { status: 502 });
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse ZIP and find subtitle file
    const subtitleContent = extractSubtitleFromZip(buffer);

    if (!subtitleContent) {
      return new NextResponse("No subtitle file found in archive", { status: 404 });
    }

    // Convert SRT to WebVTT
    const vtt = convertToVTT(subtitleContent);

    return new NextResponse(vtt, {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    console.error("Subtitle serve error:", e);
    return new NextResponse("Internal error processing subtitle", { status: 500 });
  }
}

/**
 * Minimal ZIP parser — extracts the first .srt, .vtt, or .ass file from a ZIP buffer.
 * ZIP format: each file starts with local file header signature 0x04034b50
 */
function extractSubtitleFromZip(buffer: Buffer): string | null {
  const SIGNATURE = 0x04034b50;
  let offset = 0;

  while (offset + 30 <= buffer.length) {
    const sig = buffer.readUInt32LE(offset);
    if (sig !== SIGNATURE) break;

    const compressionMethod = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const uncompressedSize = buffer.readUInt32LE(offset + 22);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraFieldLength = buffer.readUInt16LE(offset + 28);

    const fileName = buffer.toString("utf-8", offset + 30, offset + 30 + fileNameLength);
    const dataStart = offset + 30 + fileNameLength + extraFieldLength;

    const lowerName = fileName.toLowerCase();
    const isSubtitle = lowerName.endsWith(".srt") || lowerName.endsWith(".vtt") || lowerName.endsWith(".ass");

    if (isSubtitle && compressionMethod === 0 && uncompressedSize > 0) {
      // Stored (no compression) — read directly
      return buffer.toString("utf-8", dataStart, dataStart + uncompressedSize);
    }

    if (isSubtitle && compressionMethod === 8) {
      // Deflate compressed — use zlib
      try {
        const zlib = require("zlib");
        const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
        const decompressed = zlib.inflateRawSync(compressed);
        return decompressed.toString("utf-8");
      } catch {
        // Try next file
      }
    }

    // Move to next file entry
    offset = dataStart + compressedSize;
  }

  return null;
}

/**
 * Converts SRT or ASS subtitle content to WebVTT format.
 */
function convertToVTT(content: string): string {
  // If already VTT, return as-is
  if (content.trimStart().startsWith("WEBVTT")) {
    return content;
  }

  // If ASS/SSA format, do basic conversion
  if (content.includes("[Script Info]") || content.includes("Format:") && content.includes("Dialogue:")) {
    return convertASStoVTT(content);
  }

  // SRT to VTT conversion
  let vtt = "WEBVTT\n\n";

  // Normalize line endings
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  // Replace SRT timestamp format (00:00:00,000) with VTT format (00:00:00.000)
  const converted = normalized.replace(
    /(\d{2}:\d{2}:\d{2}),(\d{3})/g,
    "$1.$2"
  );

  vtt += converted;
  return vtt;
}

/**
 * Basic ASS/SSA to VTT conversion — extracts Dialogue lines.
 */
function convertASStoVTT(content: string): string {
  let vtt = "WEBVTT\n\n";
  const lines = content.split(/\r?\n/);
  let cueIndex = 1;

  for (const line of lines) {
    if (!line.startsWith("Dialogue:")) continue;

    // Dialogue: 0,0:01:23.45,0:01:26.78,Default,,0,0,0,,Text here
    const parts = line.substring("Dialogue:".length).split(",");
    if (parts.length < 10) continue;

    const start = parts[1].trim();
    const end = parts[2].trim();
    const text = parts.slice(9).join(",")
      .replace(/\\N/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\{[^}]*\}/g, ""); // Remove ASS style tags

    // Convert H:MM:SS.CC to HH:MM:SS.mmm
    const startVTT = assTimeToVTT(start);
    const endVTT = assTimeToVTT(end);

    if (startVTT && endVTT && text.trim()) {
      vtt += `${cueIndex}\n${startVTT} --> ${endVTT}\n${text.trim()}\n\n`;
      cueIndex++;
    }
  }

  return vtt;
}

function assTimeToVTT(time: string): string | null {
  // ASS format: H:MM:SS.CC (centiseconds)
  const match = time.match(/^(\d+):(\d{2}):(\d{2})\.(\d{2})$/);
  if (!match) return null;

  const h = match[1].padStart(2, "0");
  const m = match[2];
  const s = match[3];
  const cs = match[4];

  return `${h}:${m}:${s}.${cs}0`;
}
