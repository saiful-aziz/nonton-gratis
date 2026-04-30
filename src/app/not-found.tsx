import Link from "next/link";
import { Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <Film className="w-20 h-20 text-gray-600 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-gray-400 text-lg mb-6">Halaman tidak ditemukan</p>
        <Link
          href="/"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
