import Link from "next/link";
import { getGenres } from "@/lib/tmdb";
import { notFound } from "next/navigation";

export const revalidate = 86400; // cache for 24 hours - genres rarely change

const genreIcons: Record<number, string> = {
  28: "💥", 12: "🗺️", 16: "🎨", 35: "😂", 80: "🔪", 99: "📹",
  18: "🎭", 10751: "👨‍👩‍👧‍👦", 14: "🧙", 36: "📜", 27: "👻",
  10402: "🎵", 9648: "🔍", 10749: "💕", 878: "🚀", 10770: "📺",
  53: "😱", 10752: "⚔️", 37: "🤠",
};

export default async function GenrePage() {
  let genres;
  try {
    genres = await getGenres();
  } catch {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">🎬 Jelajahi Genre</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={`/genre/${genre.id}`}
            className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-red-500/50 rounded-xl p-6 text-center transition-all duration-300 group"
          >
            <span className="text-4xl block mb-3">{genreIcons[genre.id] || "🎬"}</span>
            <span className="text-white font-medium group-hover:text-red-400 transition-colors">
              {genre.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
