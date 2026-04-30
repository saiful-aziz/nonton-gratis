"use client";

import { Download, Subtitles, Globe, Info } from "lucide-react";
import type { Subtitle } from "@/lib/subtitles";

interface SubtitleListProps {
  subtitles: Subtitle[];
  movieTitle: string;
}

const langNames: Record<string, string> = {
  ID: "Indonesia",
  EN: "English",
};

function getDownloadUrl(sub: Subtitle): string {
  const fileName = `${sub.release_name || sub.name || "subtitle"}.zip`;
  return `/api/subtitles/download?url=${encodeURIComponent(sub.url)}&name=${encodeURIComponent(fileName)}`;
}

export default function SubtitleList({ subtitles, movieTitle }: SubtitleListProps) {
  if (subtitles.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
        <Subtitles className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">
          Subtitle untuk &ldquo;{movieTitle}&rdquo; belum tersedia di SubDL.
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Subtitle mungkin tersedia langsung di player video.
        </p>
      </div>
    );
  }

  const indonesian = subtitles.filter((s) => s.lang === "ID");
  const english = subtitles.filter((s) => s.lang === "EN");

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-1">
          <Subtitles className="w-5 h-5 text-red-500" />
          <h3 className="text-white font-semibold">Download Subtitle</h3>
          <span className="text-gray-500 text-sm">({subtitles.length} tersedia)</span>
        </div>
        <div className="flex items-start gap-1.5 mt-2">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-300/80 text-xs">
            Subtitle sudah tampil otomatis di player. Download file .srt di bawah jika ingin digunakan di player lain.
          </p>
        </div>
      </div>

      {indonesian.length > 0 && (
        <SubGroup label="🇮🇩 Bahasa Indonesia" subtitles={indonesian} />
      )}
      {english.length > 0 && (
        <SubGroup label="🇬🇧 English" subtitles={english} />
      )}
    </div>
  );
}

function SubGroup({ label, subtitles }: { label: string; subtitles: Subtitle[] }) {
  return (
    <div>
      <div className="px-4 py-2 bg-gray-800/50">
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>
      <div className="divide-y divide-gray-800/50">
        {subtitles.slice(0, 5).map((sub, i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-gray-800/30 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{sub.release_name || sub.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {langNames[sub.lang] || sub.lang}
                </span>
                {sub.author && (
                  <span className="text-gray-500 text-xs">oleh {sub.author}</span>
                )}
                {sub.hi && (
                  <span className="text-yellow-600 text-xs bg-yellow-600/10 px-1.5 py-0.5 rounded">HI</span>
                )}
              </div>
            </div>
            <a
              href={getDownloadUrl(sub)}
              download
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
