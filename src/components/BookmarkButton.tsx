"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

interface BookmarkButtonProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
}

export default function BookmarkButton({ tmdbId, title, posterPath, releaseDate, voteAverage }: BookmarkButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkBookmark = useCallback(async () => {
    if (!session?.user?.id) { setLoading(false); return; }
    try {
      const res = await fetch("/api/bookmarks");
      const data = await res.json();
      setBookmarked(Array.isArray(data) && data.some((b: { tmdbId: number }) => b.tmdbId === tmdbId));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, tmdbId]);

  useEffect(() => {
    if (status !== "loading") checkBookmark();
  }, [status, checkBookmark]);

  async function toggle() {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (bookmarked) {
        await fetch(`/api/bookmarks?tmdbId=${tmdbId}`, { method: "DELETE" });
        setBookmarked(false);
      } else {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId, title, posterPath, releaseDate, voteAverage }),
        });
        setBookmarked(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading && status !== "loading"}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        bookmarked
          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
          : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
      }`}
      title={bookmarked ? "Hapus dari bookmark" : "Tambah ke bookmark"}
    >
      {loading && status !== "loading" ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : bookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {bookmarked ? "Disimpan" : "Simpan"}
    </button>
  );
}
