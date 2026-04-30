import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";

  return (
    <Link href={`/movie/${movie.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
        <Image
          src={getImageUrl(movie.poster_path, "w500")}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-sm font-medium line-clamp-2">{movie.title}</p>
        </div>
        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-medium">{movie.vote_average.toFixed(1)}</span>
        </div>
        {/* Subtitle badge */}
        <div className="absolute top-2 left-2 bg-red-600 rounded px-1.5 py-0.5">
          <span className="text-white text-[10px] font-bold">SUB ID</span>
        </div>
      </div>
      <div className="mt-2 px-1">
        <h3 className="text-white text-sm font-medium line-clamp-1">{movie.title}</h3>
        <p className="text-gray-400 text-xs mt-0.5">{year}</p>
      </div>
    </Link>
  );
}
