import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Clock, Calendar, Globe } from "lucide-react";
import { getMovieDetail, getMovieCredits, getSimilarMovies, getImageUrl } from "@/lib/tmdb";
import { searchSubtitles } from "@/lib/subtitles";
import VideoPlayer from "@/components/VideoPlayer";
import SubtitleList from "@/components/SubtitleList";
import MovieRow from "@/components/MovieRow";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) notFound();

  let movie;
  try {
    movie = await getMovieDetail(movieId);
  } catch {
    notFound();
  }

  const [credits, similar, subtitles] = await Promise.all([
    getMovieCredits(movieId).catch(() => ({ cast: [] })),
    getSimilarMovies(movieId).catch(() => ({ page: 1, results: [], total_pages: 0, total_results: 0 })),
    searchSubtitles(movieId).catch(() => []),
  ]);

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const duration = movie.runtime ? `${hours}j ${minutes}m` : "N/A";

  return (
    <div>
      {/* Backdrop */}
      <div className="relative w-full h-[40vh] sm:h-[50vh]">
        <Image
          src={getImageUrl(movie.backdrop_path, "original")}
          alt={movie.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-32 relative z-10">
        {/* Movie Info */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-48 sm:w-56 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 pt-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-gray-400 italic mb-4">&ldquo;{movie.tagline}&rdquo;</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold">{movie.vote_average.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({movie.vote_count.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{year}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300 text-sm">
                <Clock className="w-4 h-4" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300 text-sm">
                <Globe className="w-4 h-4" />
                <span>{movie.original_language.toUpperCase()}</span>
              </div>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                SUB ID
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((genre) => (
                <a
                  key={genre.id}
                  href={`/genre/${genre.id}`}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-full transition-colors"
                >
                  {genre.name}
                </a>
              ))}
            </div>

            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-white font-semibold mb-2">Sinopsis</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {movie.overview || "Sinopsis tidak tersedia dalam Bahasa Indonesia."}
              </p>
            </div>

            {/* IMDB link */}
            {movie.imdb_id && (
              <a
                href={`https://www.imdb.com/title/${movie.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-yellow-500 hover:text-yellow-400 text-sm transition-colors"
              >
                ⭐ Lihat di IMDb
              </a>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="mb-10">
          <h2 className="text-white text-xl font-bold mb-4">🎬 Tonton Film</h2>
          <VideoPlayer tmdbId={movie.id} imdbId={movie.imdb_id} title={movie.title} />
        </div>

        {/* Subtitle Downloads */}
        <div className="mb-10">
          <h2 className="text-white text-xl font-bold mb-4">📝 Subtitle</h2>
          <SubtitleList subtitles={subtitles} movieTitle={movie.title} />
        </div>

        {/* Cast */}
        {credits.cast.length > 0 && (
          <div className="mb-10">
            <h2 className="text-white text-xl font-bold mb-4">🎭 Pemeran</h2>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {credits.cast.slice(0, 12).map((person) => (
                <div key={person.id} className="flex-shrink-0 w-24 text-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800 mx-auto mb-2">
                    <Image
                      src={getImageUrl(person.profile_path, "w200")}
                      alt={person.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-white text-xs font-medium line-clamp-1">{person.name}</p>
                  <p className="text-gray-400 text-[10px] line-clamp-1">{person.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similar.results.length > 0 && (
          <MovieRow title="🎥 Film Serupa" movies={similar.results} />
        )}
      </div>
    </div>
  );
}
