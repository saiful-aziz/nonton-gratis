"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Subtitles, X, ChevronDown } from "lucide-react";

interface SubtitleTrack {
  lang: string;
  label: string;
  url: string;
}

interface Cue {
  start: number;
  end: number;
  text: string;
}

interface SubtitleOverlayProps {
  tmdbId: number;
}

export default function SubtitleOverlay({ tmdbId }: SubtitleOverlayProps) {
  const [tracks, setTracks] = useState<SubtitleTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [lastTrack, setLastTrack] = useState<SubtitleTrack | null>(null);
  const [cues, setCues] = useState<Cue[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch available subtitle tracks
  useEffect(() => {
    fetch(`/api/subtitles/${tmdbId}`)
      .then((r) => r.json())
      .then((data: { file: string; label: string }[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setTracks(
            data.map((d) => ({
              lang: d.label.toLowerCase(),
              label: d.label,
              url: d.file,
            }))
          );
        }
      })
      .catch(() => {});
  }, [tmdbId]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Timer for subtitle sync
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 0.25);
      }, 250);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // Update current subtitle text based on elapsed time
  useEffect(() => {
    if (cues.length === 0) {
      setCurrentText("");
      return;
    }
    const active = cues.find((c) => elapsed >= c.start && elapsed <= c.end);
    setCurrentText(active ? active.text : "");
  }, [elapsed, cues]);

  const loadTrack = useCallback(async (track: SubtitleTrack) => {
    setLoading(true);
    setError(null);
    setActiveTrack(track.lang);
    setLastTrack(track);
    setShowMenu(false);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const res = await fetch(track.url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const vtt = await res.text();
      if (!vtt || vtt.trim().length === 0) throw new Error("Empty subtitle file");
      const parsed = parseVTT(vtt);
      if (parsed.length === 0) throw new Error("No cues found in subtitle");
      setCues(parsed);
      setElapsed(0);
      setRunning(true);
    } catch (err) {
      const msg = err instanceof Error && err.name === "AbortError"
        ? "Timeout — coba lagi"
        : `Gagal memuat subtitle ${track.label}`;
      setError(msg);
      setActiveTrack(null);
      setCues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const disableSubtitle = useCallback(() => {
    setActiveTrack(null);
    setCues([]);
    setCurrentText("");
    setRunning(false);
    setElapsed(0);
    setShowMenu(false);
    setError(null);
  }, []);

  if (tracks.length === 0) return null;

  return (
    <>
      {/* Subtitle text overlay — positioned above the player */}
      {currentText && (
        <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none z-20 px-4">
          <div className="bg-black/80 text-white text-sm sm:text-base px-4 py-2 rounded-lg max-w-[90%] text-center leading-relaxed">
            {currentText.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < currentText.split("\n").length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {/* CC button + menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTrack
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Subtitles className="w-4 h-4" />
              {activeTrack
                ? tracks.find((t) => t.lang === activeTrack)?.label || "Subtitle"
                : "Subtitle"}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[160px] z-30">
                <button
                  onClick={disableSubtitle}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    !activeTrack
                      ? "bg-red-600/20 text-red-400"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  Nonaktifkan
                </button>
                {tracks.map((track) => (
                  <button
                    key={track.lang}
                    onClick={() => loadTrack(track)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      activeTrack === track.lang
                        ? "bg-red-600/20 text-red-400"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    {track.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <span className="text-gray-500 text-xs">Memuat subtitle...</span>
          )}
          {error && (
            <span className="text-red-400 text-xs flex items-center gap-2">
              {error}
              {lastTrack && (
                <button
                  onClick={() => loadTrack(lastTrack)}
                  className="underline text-red-300 hover:text-white transition-colors"
                >
                  Coba lagi
                </button>
              )}
            </span>
          )}
        </div>

        {/* Sync controls */}
        {activeTrack && cues.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning(!running)}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded transition-colors"
            >
              {running ? "⏸ Pause" : "▶ Play"} Sub
            </button>
            <button
              onClick={() => setElapsed((e) => Math.max(0, e - 5))}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded transition-colors"
            >
              -5s
            </button>
            <button
              onClick={() => setElapsed((e) => e + 5)}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded transition-colors"
            >
              +5s
            </button>
            <TimeInput elapsed={elapsed} onCommit={(s) => setElapsed(s)} />
            {activeTrack && (
              <button
                onClick={disableSubtitle}
                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                title="Matikan subtitle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/** Editable time input — click to edit, shows HH:MM:SS or MM:SS */
function TimeInput({ elapsed, onCommit }: { elapsed: number; onCommit: (s: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setValue(formatTime(elapsed));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    const parsed = parseInputTime(value);
    if (parsed !== null) onCommit(parsed);
    setEditing(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        className="w-20 bg-gray-700 text-white text-xs font-mono px-2 py-1 rounded border border-gray-500 focus:outline-none focus:border-red-500"
        placeholder="1:23:45"
        title="Format: m:ss atau h:mm:ss"
      />
    );
  }

  return (
    <button
      onClick={startEdit}
      className="text-gray-400 hover:text-white text-xs font-mono px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
      title="Klik untuk set waktu subtitle"
    >
      {formatTime(elapsed)}
    </button>
  );
}

/** Parse user-typed time: h:mm:ss, m:ss, or plain seconds */
function parseInputTime(input: string): number | null {
  const trimmed = input.trim();
  // Plain number (seconds)
  if (/^\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);
  // m:ss or h:mm:ss
  const parts = trimmed.split(":").map((p) => parseFloat(p));
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

/** Parse WebVTT content into cue objects */
function parseVTT(vtt: string): Cue[] {
  const cues: Cue[] = [];
  const lines = vtt.split(/\r?\n/);
  let i = 0;

  // Skip header
  while (i < lines.length && !lines[i].includes("-->")) {
    i++;
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.includes("-->")) {
      const [startStr, endStr] = line.split("-->").map((s) => s.trim());
      const start = parseTimestamp(startStr);
      const end = parseTimestamp(endStr);

      i++;
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i].trim());
        i++;
      }

      if (start !== null && end !== null && textLines.length > 0) {
        cues.push({
          start,
          end,
          text: textLines.join("\n").replace(/<[^>]+>/g, ""), // strip HTML tags
        });
      }
    } else {
      i++;
    }
  }

  return cues;
}

/** Parse VTT timestamp (HH:MM:SS.mmm or MM:SS.mmm) to seconds */
function parseTimestamp(ts: string): number | null {
  // Remove any extra text after timestamp (like position info)
  const clean = ts.split(/\s/)[0];
  const parts = clean.split(":");

  if (parts.length === 3) {
    const h = parseFloat(parts[0]);
    const m = parseFloat(parts[1]);
    const s = parseFloat(parts[2]);
    return h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const m = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    return m * 60 + s;
  }
  return null;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
