"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Film, Search, Menu, X, User, Bookmark, History, LogOut, LogIn, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMenuOpen(false);
    }
  }

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "Akun";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-red-500 font-bold text-xl shrink-0">
            <Film className="w-7 h-7" />
            <span className="hidden sm:inline">NontonGratis</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
              Beranda
            </Link>
            <Link href="/genre" className="text-gray-300 hover:text-white transition-colors text-sm">
              Genre
            </Link>
            <Link href="/trending" className="text-gray-300 hover:text-white transition-colors text-sm">
              Trending
            </Link>
            <Link href="/top-rated" className="text-gray-300 hover:text-white transition-colors text-sm">
              Rating Tertinggi
            </Link>
          </div>

          {/* Right side: search + auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari film..."
                  className="bg-gray-800 text-white text-sm rounded-full pl-10 pr-4 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                />
              </div>
            </form>

            {/* Auth */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
                    {displayName[0].toUpperCase()}
                  </div>
                  <span className="text-gray-300 text-sm max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                    <Link
                      href="/profile/bookmarks"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 text-sm transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                      Bookmark
                    </Link>
                    <Link
                      href="/profile/history"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 text-sm transition-colors"
                    >
                      <History className="w-4 h-4" />
                      Riwayat Tonton
                    </Link>
                    <div className="border-t border-gray-800" />
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 text-sm transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}

                {/* Click outside to close */}
                {userMenuOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari film..."
                className="bg-gray-800 text-white text-sm rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
              />
            </div>
          </form>
          <Link href="/" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Beranda</Link>
          <Link href="/genre" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Genre</Link>
          <Link href="/trending" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Trending</Link>
          <Link href="/top-rated" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Rating Tertinggi</Link>
          <div className="border-t border-gray-800 pt-3">
            {session ? (
              <>
                <p className="text-gray-500 text-xs mb-2">Masuk sebagai <span className="text-white">{displayName}</span></p>
                <Link href="/profile/bookmarks" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-gray-300 hover:text-white py-2">
                  <Bookmark className="w-4 h-4" /> Bookmark
                </Link>
                <Link href="/profile/history" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-gray-300 hover:text-white py-2">
                  <History className="w-4 h-4" /> Riwayat Tonton
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 py-2 w-full text-left"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-red-400 hover:text-red-300 py-2 font-medium">
                <LogIn className="w-4 h-4" /> Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
