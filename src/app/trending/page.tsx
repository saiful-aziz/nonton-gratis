import { getTrending } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";

export const revalidate = 3600; // cache for 1 hour

interface TrendingPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const movies = await getTrending(currentPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">🔥 Film Trending</h1>
      <p className="text-gray-400 mb-8">Film yang sedang trending minggu ini</p>

      <MovieGrid movies={movies.results} />
      <Pagination currentPage={currentPage} totalPages={movies.total_pages} basePath="/trending" />
    </div>
  );
}
