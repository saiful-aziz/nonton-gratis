import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getImageUrl } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-white mb-6">📚 Film Tersimpan</h1>
        
        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">Belum ada film yang disimpan</p>
            <Link
              href="/"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Jelajahi Film
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {bookmarks.map((bookmark) => (
              <Link key={bookmark.id} href={`/movie/${bookmark.tmdbId}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
                    <Image
                      src={getImageUrl(bookmark.posterPath, "w500")}
                      alt={bookmark.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs font-semibold">{bookmark.voteAverage.toFixed(1)}</span>
                    </div>
                  </div>
                  <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-red-500 transition-colors">
                    {bookmark.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {bookmark.releaseDate ? new Date(bookmark.releaseDate).getFullYear() : "N/A"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
