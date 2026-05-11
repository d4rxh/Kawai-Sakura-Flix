import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { fetchAnimeSaltDetails, AnimeSaltDetailsResponse } from "@/src/services/animesalt";
import { Play, Search, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SmoothText } from "@/src/components/ui/SmoothText";
import { cn } from "@/src/lib/utils";

export function DubbedAnimeDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [_, setLocation] = useLocation();
  const [data, setData] = useState<AnimeSaltDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [showSeasonScrollHint, setShowSeasonScrollHint] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // States for mapping seasons
  const [selectedSeason, setSelectedSeason] = useState<string>("1");

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchAnimeSaltDetails(slug.trim());
        setData(result);
      } catch (err: any) {
        console.error("Failed to load details for", slug, err);
        setError(err.message || "Failed to load anime details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const anime = data?.data;
  const episodes = anime?.episodes || [];

  const seasons = useMemo(() => {
    const s = new Set<string>();
    episodes.forEach(ep => {
      if (ep.season) s.add(ep.season);
    });
    return Array.from(s).sort((a, b) => parseInt(a) - parseInt(b));
  }, [episodes]);

  // Sync selected season when data loads
  useEffect(() => {
    if (seasons.length > 0 && !seasons.includes(selectedSeason)) {
      setSelectedSeason(seasons[0]);
    }
  }, [seasons, selectedSeason]);

  const filteredList = episodes.filter(ep =>
    (!ep.season || ep.season === selectedSeason || seasons.length === 0) &&
    (episodeSearchQuery === "" || ep.number.toString().includes(episodeSearchQuery))
  );

  if (isLoading) {
    return (
      <PageTransition>
        <div className="w-full h-[85vh] min-h-[600px] bg-[#201F31]" />
      </PageTransition>
    );
  }

  if (error || !anime) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-[#201F31] pt-[120px]">
          <Header />
            <div className="max-w-[1600px] mx-auto px-6 flex flex-col items-center justify-center gap-6 min-h-[50vh]">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl text-[var(--color-primary)]">!</div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
                <p className="text-white/50">{error || "Could not find this anime."}</p>
              </div>
              <button 
                onClick={() => setLocation('/dubbed')}
                className="px-8 py-3 bg-[var(--color-primary)] text-black font-bold rounded-full hover:opacity-90 transition-opacity"
              >
                Back to Dubbed
              </button>
            </div>
          <Footer />
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 overflow-x-hidden pt-0">
        <Header />

        <div>
          {/* Hero Banner — global style */}
          <div className="relative w-full h-[450px] md:h-[550px] flex items-center overflow-hidden">
            <img
              src={anime.thumbnail}
              alt="Banner"
              className="w-full h-full object-cover opacity-30 mix-blend-screen blur-[8px] scale-110 saturate-[1.2]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#201F31] via-[#201F31]/80 to-transparent" />
          </div>

          {/* Content Area */}
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 -mt-[250px] relative z-10">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

              {/* Poster */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
                className="w-[200px] md:w-[260px] lg:w-[280px] shrink-0 mx-auto md:mx-0"
              >
                <div className="relative overflow-hidden rounded-[16px] bg-[#1A1A1A] shadow-2xl aspect-[2/3] border border-[#333333] group">
                  <img
                    src={anime.thumbnail}
                    alt={anime.title}
                    className="w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:scale-105"
                    onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 mt-6">
                  {!anime.is_movie && episodes.length > 0 && (
                    <button
                      onClick={() => setLocation(`/dubbed/watch/${slug}/${episodes[0].id}`)}
                      className="flex-1 bg-[var(--color-primary)] text-black font-semibold py-3 rounded-[24px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <Play fill="currentColor" size={18} /> Watch Now
                    </button>
                  )}
                  {anime.is_movie && anime.movie_players?.length > 0 && (
                    <button
                      onClick={() => setLocation(`/dubbed/watch/${slug}/${slug}?type=movie`)}
                      className="flex-1 bg-[var(--color-primary)] text-black font-semibold py-3 rounded-[24px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <Play fill="currentColor" size={18} /> Watch Movie
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 space-y-6 pt-4 min-w-0"
              >
                <div className="flex flex-col gap-2">
                  <h1 className="text-display text-white line-clamp-2 md:line-clamp-3">
                    {anime.title}
                  </h1>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-white/80">
                  {anime.is_movie ? (
                    <div className="px-3 py-1 rounded-[6px] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-[12px] font-bold">
                      Movie
                    </div>
                  ) : (
                    episodes.length > 0 && (
                      <div className="px-3 py-1 rounded-[6px] bg-[#1A1A1A] border border-[#333333]">
                        {episodes.length} Episodes
                      </div>
                    )
                  )}
                </div>

                <div className="text-body-m text-white/70 leading-relaxed max-w-4xl opacity-90">
                  <SmoothText text={anime.description || "No description available."} delay={0.4} />
                </div>

                {/* Genres */}
                {anime.genres && anime.genres.length > 0 && (
                  <div className="flex flex-col gap-3 mt-6">
                    <span className="text-sm font-semibold text-white/40">Genres</span>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.map(genre => (
                        <span
                          key={genre}
                          className="text-[13px] font-medium text-white/80 border border-[#333333] bg-[#1A1A1A] px-3 py-1.5 rounded-[8px]"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Season Tabs - synced with global */}
                {seasons.length > 0 && (
                  <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-[#333333]">
                    <span className="text-sm font-semibold text-white/40">Seasons & Parts</span>

                    {/* Mobile Custom Dropdown */}
                    <div className="relative md:hidden">
                      <button
                        onClick={() => setIsSeasonOpen(!isSeasonOpen)}
                        className="w-full flex items-center justify-between bg-[#1A1A1A] border border-[#333333] px-4 py-3 rounded-[12px] text-sm font-medium text-white/90 hover:border-[var(--color-primary)]/50 transition-all active:scale-[0.98]"
                      >
                        <span className="truncate pr-4">Season {selectedSeason || "1"}</span>
                        <ChevronDown
                          size={18}
                          className={cn("text-[var(--color-primary)] transition-transform duration-300", isSeasonOpen && "rotate-180")}
                        />
                      </button>

                      <AnimatePresence>
                        {isSeasonOpen && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setIsSeasonOpen(false)}
                              className="fixed inset-0 z-[100]"
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-[#333333] rounded-[16px] shadow-2xl z-[101] overflow-hidden"
                            >
                              <div
                                ref={dropdownRef}
                                className="p-2 flex flex-col gap-1 max-h-[300px] overflow-y-auto scrollbar-none"
                              >
                                {seasons.map((s) => (
                                  <button
                                    key={s}
                                    className={cn(
                                      "flex items-center justify-between text-left px-4 py-3 rounded-[10px] text-[13px] font-medium transition-all",
                                      selectedSeason === s
                                        ? "bg-[var(--color-primary)] text-black"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                    )}
                                    onClick={() => {
                                      setSelectedSeason(s);
                                      setIsSeasonOpen(false);
                                    }}
                                  >
                                    <span className="truncate pr-4">Season {s}</span>
                                    {selectedSeason === s && <Check size={16} />}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Desktop Flex Wrap */}
                    <div className="hidden md:flex md:flex-wrap gap-2">
                      {seasons.map((s) => (
                        <button
                          key={s}
                          className={cn(
                            "text-[13px] font-medium border px-3 py-1.5 rounded-[8px] transition-colors md:shrink md:w-auto text-center truncate md:min-w-0 md:max-w-none",
                            selectedSeason === s
                              ? "text-black bg-[var(--color-primary)] border-[var(--color-primary)]"
                              : "text-white/80 border-[#333333] bg-[#1A1A1A] hover:bg-[#222222]"
                          )}
                          onClick={() => setSelectedSeason(s)}
                        >
                          Season {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Episodes Section - moved season selector out */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 border-t border-[#333333] pt-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-headline-l text-white">
                  Episodes <span className="text-white/40 text-[18px]">({filteredList.length})</span>
                </h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex items-center w-full sm:w-[300px]">
                    <Search size={18} className="absolute left-3 text-white/50" />
                    <input
                      type="text"
                      placeholder="Search episodes..."
                      value={episodeSearchQuery}
                      onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                      className="bg-[#1A1A1A] border border-[#333333] rounded-[8px] pl-10 pr-3 py-2 text-[13px] text-white outline-none focus:border-[var(--color-primary)] transition-colors w-full"
                    />
                  </div>
                </div>
              </div>



              {filteredList.length === 0 ? (
                <div className="p-10 bg-[#1A1A1A] rounded-[16px] text-center text-white/50 border border-[#333333]">
                  No episodes available yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                  {filteredList.map((ep, idx) => (
                    <motion.div
                      onClick={() => setLocation(`/dubbed/watch/${slug}/${ep.id}`)}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: (idx % 15) * 0.03 }}
                      key={ep.id}
                      className="group relative flex flex-col bg-[#1A1A1A] border border-[#333333] rounded-[12px] p-3 hover:bg-[#222222] cursor-pointer transition-all overflow-hidden"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 shrink-0 bg-black rounded-[8px] flex items-center justify-center font-bold text-[var(--color-primary)] opacity-80 group-hover:opacity-100 transition-colors">
                          {ep.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">
                            Episode {ep.number}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <Footer />
      </main>
    </PageTransition>
  );
}
