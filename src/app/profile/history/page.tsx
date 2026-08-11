import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getImageUrl } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days < 7) return `${days} hari yang lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const history = await prisma.watchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: "desc" },
    take: 50, // limit to 50 recent entries
  });

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-white mb-6">🕒 Riwayat Tontonan</h1>
        
        {history.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">Belum ada riwayat tontonan</p>
            <Link
              href="/"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Mulai Nonton
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Link key={item.id} href={`/movie/${item.tmdbId}`}>
                <div className="group flex gap-4 bg-gray-900/50 hover:bg-gray-900 rounded-lg p-4 transition-colors">
                  <div className="relative w-20 sm:w-28 aspect-[2/3] rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                    <Image
                      src={getImageUrl(item.posterPath, "w200")}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-lg font-semibold mb-1 group-hover:text-red-500 transition-colors truncate">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{item.voteAverage.toFixed(1)}</span>
                      </div>
                      <span>•</span>
                      <span>{item.releaseDate ? new Date(item.releaseDate).getFullYear() : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatRelativeTime(item.watchedAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
