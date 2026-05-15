import { getTrending, getPopular, getTopRated, getNowPlaying, getUpcoming } from "@/lib/tmdb";
import HeroSection from "@/components/HeroSection";
import MovieRow from "@/components/MovieRow";

export const revalidate = 3600; // revalidate every hour

export default async function HomePage() {
  const [trending, popular, topRated, nowPlaying, upcoming] = await Promise.all([
    getTrending(),
    getPopular(),
    getTopRated(),
    getNowPlaying(),
    getUpcoming(),
  ]);

  const heroMovie = trending.results[0];

  return (
    <div>
      {heroMovie && <HeroSection movie={heroMovie} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 py-8">
        <MovieRow title="🔥 Sedang Trending" movies={trending.results} href="/trending" />
        <MovieRow title="🎬 Sedang Tayang" movies={nowPlaying.results} href="/trending" />
        <MovieRow title="⭐ Rating Tertinggi" movies={topRated.results} href="/top-rated" />
        <MovieRow title="🎥 Film Populer" movies={popular.results} href="/trending" />
        <MovieRow title="📅 Akan Datang" movies={upcoming.results} />
      </div>
    </div>
  );
}
