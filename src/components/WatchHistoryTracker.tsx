"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface WatchHistoryTrackerProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
}

export default function WatchHistoryTracker({ tmdbId, title, posterPath, releaseDate, voteAverage }: WatchHistoryTrackerProps) {
  const { data: session } = useSession();
  const tracked = useRef(false);

  useEffect(() => {
    // Track after 30 seconds of being on the page (assumes user is watching)
    if (!session?.user?.id || tracked.current) return;

    const timer = setTimeout(async () => {
      try {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId, title, posterPath, releaseDate, voteAverage }),
        });
        tracked.current = true;
      } catch {
        // ignore
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [session?.user?.id, tmdbId, title, posterPath, releaseDate, voteAverage]);

  return null; // invisible component
}
