"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Film, Search, Menu, X } from "lucide-react";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMenuOpen(false);
    }
  }

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

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari film..."
                className="bg-gray-800 text-white text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
              />
            </div>
          </form>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
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
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari film..."
                className="bg-gray-800 text-white text-sm rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
              />
            </div>
          </form>
          <Link href="/" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">
            Beranda
          </Link>
          <Link href="/genre" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">
            Genre
          </Link>
          <Link href="/trending" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">
            Trending
          </Link>
          <Link href="/top-rated" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">
            Rating Tertinggi
          </Link>
        </div>
      )}
    </nav>
  );
}
