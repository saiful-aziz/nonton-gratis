import { notFound } from "next/navigation";
import { getMoviesByGenre, getGenres } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";

interface GenreMoviesPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const revalidate = 3600; // cache for 1 hour

export default async function GenreMoviesPage({ params, searchParams }: GenreMoviesPageProps) {
  const { id } = await params;
  const { page } = await searchParams;
  const genreId = parseInt(id, 10);
  const currentPage = parseInt(page || "1", 10);

  if (isNaN(genreId)) notFound();

  const [movies, genres] = await Promise.all([
    getMoviesByGenre(genreId, currentPage),
    getGenres(),
  ]);

  const genre = genres.find((g) => g.id === genreId);
  if (!genre) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Genre: {genre.name}</h1>
      <p className="text-gray-400 mb-8">
        {movies.total_results.toLocaleString()} film ditemukan
      </p>

      <MovieGrid movies={movies.results} />
      <Pagination currentPage={currentPage} totalPages={movies.total_pages} basePath={`/genre/${genreId}`} />
    </div>
  );
}
