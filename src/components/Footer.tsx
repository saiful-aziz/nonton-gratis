import { Film } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-red-500 font-bold text-xl mb-3">
              <Film className="w-6 h-6" />
              NontonGratis
            </Link>
            <p className="text-gray-400 text-sm">
              Nonton film gratis dengan subtitle Bahasa Indonesia. Data film dari TMDB.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Navigasi</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Beranda</Link></li>
              <li><Link href="/genre" className="text-gray-400 hover:text-white transition-colors">Genre</Link></li>
              <li><Link href="/trending" className="text-gray-400 hover:text-white transition-colors">Trending</Link></li>
              <li><Link href="/top-rated" className="text-gray-400 hover:text-white transition-colors">Rating Tertinggi</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Informasi</h3>
            <p className="text-gray-400 text-sm">
              Website ini tidak menyimpan file film di server kami. Semua konten disediakan oleh pihak ketiga.
            </p>
            <p className="text-gray-500 text-xs mt-4">
              Data film disediakan oleh{" "}
              <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">
                TMDB
              </a>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} NontonGratis. Dibuat untuk tujuan edukasi.
          </p>
        </div>
      </div>
    </footer>
  );
}
