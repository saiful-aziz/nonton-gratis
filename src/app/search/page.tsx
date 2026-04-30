import { searchMovies } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import { Search } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page } = await searchParams;
  const query = q || "";
  const currentPage = parseInt(page || "1", 10);

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Cari Film</h1>
        <p className="text-gray-400">Gunakan kolom pencarian di atas untuk mencari film favorit kamu</p>
      </div>
    );
  }

  const movies = await searchMovies(query, currentPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        Hasil Pencarian: &ldquo;{query}&rdquo;
      </h1>
      <p className="text-gray-400 mb-8">
        {movies.total_results.toLocaleString()} film ditemukan
      </p>

      {movies.results.length > 0 ? (
        <>
          <MovieGrid movies={movies.results} />
          <Pagination currentPage={currentPage} totalPages={movies.total_pages} basePath={`/search?q=${encodeURIComponent(query)}`} />
        </>
      ) : (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Tidak ada film yang ditemukan untuk &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
