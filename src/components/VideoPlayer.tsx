"use client";

import { useState, useCallback } from "react";
import { Play, AlertTriangle, Subtitles, Server, Loader2, CheckCircle, XCircle } from "lucide-react";
import { EMBED_SERVERS } from "@/lib/tmdb";
import SubtitleOverlay from "./SubtitleOverlay";

interface VideoPlayerProps {
  tmdbId: number;
  imdbId: string | null;
  title: string;
}

type ServerStatus = "loading" | "ready" | "error";

const LOAD_TIMEOUT_MS = 12000;

export default function VideoPlayer({ tmdbId, imdbId, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [activeServer, setActiveServer] = useState(EMBED_SERVERS[0].key);
  const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({});
  const [timeoutIds, setTimeoutIds] = useState<Record<string, ReturnType<typeof setTimeout>>>({});

  const currentServer = EMBED_SERVERS.find((s) => s.key === activeServer) || EMBED_SERVERS[0];
  const embedUrl = currentServer.getUrl(tmdbId, imdbId);
  const status = serverStatuses[activeServer] || "loading";

  const startTimeout = useCallback((serverKey: string) => {
    return setTimeout(() => {
      setServerStatuses((prev) => {
        if (prev[serverKey] === "loading") {
          return { ...prev, [serverKey]: "error" };
        }
        return prev;
      });
    }, LOAD_TIMEOUT_MS);
  }, []);

  const handleServerSwitch = useCallback((key: string) => {
    setActiveServer(key);
    if (!serverStatuses[key]) {
      setServerStatuses((prev) => ({ ...prev, [key]: "loading" }));
      const id = startTimeout(key);
      setTimeoutIds((prev) => ({ ...prev, [key]: id }));
    }
  }, [serverStatuses, startTimeout]);

  const handleIframeLoad = useCallback(() => {
    setServerStatuses((prev) => ({ ...prev, [activeServer]: "ready" }));
    if (timeoutIds[activeServer]) {
      clearTimeout(timeoutIds[activeServer]);
    }
  }, [activeServer, timeoutIds]);

  const handlePlay = useCallback(() => {
    setPlaying(true);
    setServerStatuses({ [activeServer]: "loading" });
    const id = startTimeout(activeServer);
    setTimeoutIds({ [activeServer]: id });
  }, [activeServer, startTimeout]);

  const handleRetry = useCallback(() => {
    setServerStatuses((prev) => ({ ...prev, [activeServer]: "loading" }));
    if (timeoutIds[activeServer]) {
      clearTimeout(timeoutIds[activeServer]);
    }
    const id = startTimeout(activeServer);
    setTimeoutIds((prev) => ({ ...prev, [activeServer]: id }));
  }, [activeServer, timeoutIds, startTimeout]);

  if (!playing) {
    return (
      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-4">
          <button
            onClick={handlePlay}
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors mx-auto group"
          >
            <Play className="w-8 h-8 text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
          </button>
          <p className="text-white font-semibold text-lg">{title}</p>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Subtitles className="w-4 h-4" />
            <span>Subtitle Bahasa Indonesia tersedia</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-yellow-500 text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span>Gunakan ad-blocker untuk pengalaman terbaik</span>
          </div>
        </div>
      </div>
    );
  }

  const nextServer = EMBED_SERVERS.find(
    (s) => s.key !== activeServer && serverStatuses[s.key] !== "error"
  );

  return (
    <div className="space-y-3">
      {/* Server selector */}
      <div className="flex flex-wrap items-center gap-2">
        <Server className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400 text-sm">Pilih Server:</span>
        {EMBED_SERVERS.map((server) => {
          const sStatus = serverStatuses[server.key];
          return (
            <button
              key={server.key}
              onClick={() => handleServerSwitch(server.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeServer === server.key
                  ? "bg-red-600 text-white"
                  : sStatus === "error"
                  ? "bg-gray-800 text-red-400 border border-red-800/50"
                  : sStatus === "ready"
                  ? "bg-gray-800 text-green-400 border border-green-800/50"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {sStatus === "loading" && activeServer === server.key && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              {sStatus === "ready" && <CheckCircle className="w-3 h-3" />}
              {sStatus === "error" && <XCircle className="w-3 h-3" />}
              {server.label}
            </button>
          );
        })}
      </div>

      {/* Status banner */}
      {status === "loading" && (
        <div className="flex items-center gap-2 bg-blue-950/50 border border-blue-800/30 rounded-lg px-4 py-2.5">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
          <p className="text-blue-300 text-sm">
            Memuat video dari <span className="font-medium">{currentServer.label}</span>... Tunggu sebentar.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-red-950/50 border border-red-800/30 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 flex-1">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">
              <span className="font-medium">{currentServer.label}</span> tidak merespons atau diblokir.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
            {nextServer && (
              <button
                onClick={() => handleServerSwitch(nextServer.key)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
              >
                Ganti ke {nextServer.label}
              </button>
            )}
          </div>
        </div>
      )}

      {status === "ready" && (
        <div className="flex items-center gap-2 bg-green-950/50 border border-green-800/30 rounded-lg px-4 py-2.5">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-green-300 text-sm">
            Video siap. Gunakan tombol <span className="font-medium">Subtitle</span> di bawah player untuk subtitle Indonesia.
          </p>
        </div>
      )}

      {/* Player + subtitle overlay */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          key={activeServer}
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="origin"
          title={`Tonton ${title}`}
          onLoad={handleIframeLoad}
        />

        {/* Subtitle overlay rendered on top of iframe */}
        <SubtitleOverlay tmdbId={tmdbId} />

        {status === "loading" && (
          <div className="absolute inset-0 bg-gray-950/70 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto" />
              <p className="text-gray-300 text-sm">Memuat player...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
