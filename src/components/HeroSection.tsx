import Image from "next/image";
import Link from "next/link";
import { Play, Star, Info } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";

interface HeroSectionProps {
  movie: Movie;
}

export default function HeroSection({ movie }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
      {/* Background */}
      <Image
        src={getImageUrl(movie.backdrop_path, "original")}
        alt={movie.title}
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight">
            {movie.title}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-semibold">{movie.vote_average.toFixed(1)}</span>
            </div>
            <span className="text-gray-300 text-sm">
              {movie.release_date ? new Date(movie.release_date).getFullYear() : ""}
            </span>
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
              SUB ID
            </span>
          </div>
          <p className="text-gray-300 text-sm sm:text-base line-clamp-3 mb-6">
            {movie.overview || "Deskripsi tidak tersedia."}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Play className="w-5 h-5 fill-white" />
              Tonton Sekarang
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2 bg-gray-700/80 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Info className="w-5 h-5" />
              Detail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
