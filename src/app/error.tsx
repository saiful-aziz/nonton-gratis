"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="w-14 h-14 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-white">Terjadi Kesalahan</h1>
        <p className="text-gray-400 text-sm">
          Gagal memuat konten. Mungkin server sedang bermasalah atau koneksi kamu terputus.
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
