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

    // Race between the actual fetch and a timeout
    const fetchWithTimeout = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const r = await fetch(zipUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; subtitle-proxy/1.0)",
            "Accept": "*/*",
            "Referer": "https://subdl.com/",
          },
          next: { revalidate: 86400 }, // cache zip for 24h
        });
        return r;
      } finally {
        clearTimeout(timeout);
      }
    };

    const res = await fetchWithTimeout();

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
 * Minimal ZIP parser — extracts the best subtitle file from a ZIP buffer.
 * Prefers main .srt over forced/SDH variants. Falls back to .vtt or .ass.
 * ZIP format: each file starts with local file header signature 0x04034b50
 */
function extractSubtitleFromZip(buffer: Buffer): string | null {
  const SIGNATURE = 0x04034b50;

  // First pass: collect all subtitle entries
  interface ZipEntry {
    fileName: string;
    compressionMethod: number;
    compressedSize: number;
    uncompressedSize: number;
    dataStart: number;
  }
  const entries: ZipEntry[] = [];
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
    if (lowerName.endsWith(".srt") || lowerName.endsWith(".vtt") || lowerName.endsWith(".ass")) {
      entries.push({ fileName, compressionMethod, compressedSize, uncompressedSize, dataStart });
    }

    offset = dataStart + compressedSize;
  }

  if (entries.length === 0) return null;

  // Pick best entry: avoid forced/SDH variants, prefer plain .srt
  const isForced = (name: string) => /\.forced\.|\.forced$/i.test(name) || /\bforced\b/i.test(name);
  const isSDH = (name: string) => /\.sdh\.|\.sdh$/i.test(name) || /\bsdh\b/i.test(name) || /\bhi\b/i.test(name);

  const preferred = entries.find((e) => e.fileName.endsWith(".srt") && !isForced(e.fileName) && !isSDH(e.fileName))
    ?? entries.find((e) => e.fileName.endsWith(".srt"))
    ?? entries.find((e) => e.fileName.endsWith(".vtt"))
    ?? entries[0];

  return extractEntry(buffer, preferred);
}

function extractEntry(buffer: Buffer, entry: { compressionMethod: number; compressedSize: number; uncompressedSize: number; dataStart: number }): string | null {
  if (entry.compressionMethod === 0 && entry.uncompressedSize > 0) {
    return buffer.toString("utf-8", entry.dataStart, entry.dataStart + entry.uncompressedSize);
  }
  if (entry.compressionMethod === 8) {
    try {
      const zlib = require("zlib");
      const compressed = buffer.subarray(entry.dataStart, entry.dataStart + entry.compressedSize);
      const decompressed = zlib.inflateRawSync(compressed);
      return decompressed.toString("utf-8");
    } catch {
      return null;
    }
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
