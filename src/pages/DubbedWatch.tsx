import { useState, useEffect, useRef, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { fetchAnimeSaltDetails, fetchAnimeSaltEpisode, AnimeSaltDetailsResponse, AnimeSaltEpisodeResponse } from "@/src/services/animesalt";
import { Search, Check, ChevronDown, ChevronLeft, Shield } from "lucide-react";
import { cn } from "@/src/lib/utils";

// Cache for dubbed anime details to prevent refetching during episode changes
const dubbedAnimeCache: Record<string, { details: AnimeSaltDetailsResponse; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function DubbedWatch() {
  const [match, params] = useRoute("/dubbed/watch/:slug/:id");
  const slug = params ? (params as any).slug : null;
  const epId = params ? (params as any).id : null;
  const [_, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const isMovie = searchParams.get("type") === "movie";

  const [anime, setAnime] = useState<AnimeSaltDetailsResponse | null>(null);
  const [episodeData, setEpisodeData] = useState<AnimeSaltEpisodeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");
  const [showEpisodeScrollHint, setShowEpisodeScrollHint] = useState(true);
  const episodeListRef = useRef<HTMLDivElement>(null);

  const [autoNext, setAutoNext] = useState(true);
  const [alwaysOn, setAlwaysOn] = useState(true);

  // Parse episodes & seasons
  const allEpisodes = anime?.data?.episodes || [];
  const currentEp = allEpisodes.find(e => e.id === epId);
  const [selectedSeason, setSelectedSeason] = useState<string>("1");

  // Sync selected season when current episode loads
  useEffect(() => {
    if (currentEp?.season) {
      setSelectedSeason(currentEp.season);
    }
  }, [currentEp?.season]);

  const seasons = useMemo(() => {
    const s = new Set<string>();
    allEpisodes.forEach(ep => {
      if (ep.season) s.add(ep.season);
    });
    return Array.from(s).sort((a, b) => parseInt(a) - parseInt(b));
  }, [allEpisodes]);

  // Handle auto next
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "video_playback_completed") {
        if (autoNext && episodeData?.data?.next_episode_id) {
          setLocation(`/dubbed/watch/${slug}/${episodeData.data.next_episode_id}`);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [autoNext, episodeData, slug, setLocation]);

  // Initialize from cache if available
  useEffect(() => {
    if (slug && dubbedAnimeCache[slug] && Date.now() - dubbedAnimeCache[slug].timestamp < CACHE_TTL) {
      setAnime(dubbedAnimeCache[slug].details);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug || !epId) return;

    async function loadWatchData() {
      if (!dubbedAnimeCache[slug]) {
        setIsLoading(true);
      }
      setPlayerLoading(true);
      setError(null);

      try {
        let epInfo: AnimeSaltEpisodeResponse | null = null;
        if (!isMovie) {
          epInfo = await fetchAnimeSaltEpisode(epId);
        }

        let detailsPromise = Promise.resolve(dubbedAnimeCache[slug]?.details || null);
        if (!dubbedAnimeCache[slug]) {
          detailsPromise = fetchAnimeSaltDetails(slug);
        }

        const details = await detailsPromise;

        if (details) {
          setAnime(details);
          dubbedAnimeCache[slug] = { details, timestamp: Date.now() };
        }

        if (isMovie && details) {
          // Construct a fake episode data from movie players
          if (details.data.movie_players && details.data.movie_players.length > 0) {
            setEpisodeData({
              success: true,
              data: {
                video_player: details.data.movie_players[0].url,
                m3u8_link: null,
                source: details.data.movie_players[0].url,
                next_episode_id: null,
                prev_episode_id: null
              }
            });
          } else {
             throw new Error("No movie players available.");
          }
        } else if (epInfo) {
          setEpisodeData(epInfo);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load video player.");
      } finally {
        setIsLoading(false);
        setPlayerLoading(false);
      }
    }
    loadWatchData();
  }, [slug, epId, isMovie]);

  const filteredEpisodes = allEpisodes.filter(ep =>
    (!ep.season || ep.season === selectedSeason || seasons.length === 0) &&
    (
      (ep.title && ep.title.toLowerCase().includes(episodeSearchQuery.toLowerCase())) ||
      ep.number.toString().includes(episodeSearchQuery)
    )
  );

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 overflow-x-hidden pt-[80px] lg:pt-[100px]">
        <Header />

        {isLoading ? (
          <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 mt-6">
            <div className="w-full aspect-video rounded-[16px] overflow-hidden layer-2 border border-white/10 flex items-center justify-center">
              <div className="w-full h-full shimmer" />
            </div>
          </div>
        ) : error || !anime ? (
          <div className="w-full h-[85vh] min-h-[600px] flex items-center justify-center flex-col gap-6 bg-[#201F31]">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl text-[var(--color-primary)]">!</div>
            <div className="text-center px-6">
              <h2 className="text-display text-center mb-2">Playback Error</h2>
              <p className="text-xl font-medium text-white/50 max-w-lg mx-auto leading-relaxed">{error || "The episode could not be found or loaded. Please try again later."}</p>
            </div>
            <button 
              onClick={() => setLocation(`/dubbed/anime/${slug}`)}
              className="px-8 py-3 bg-[var(--color-primary)] text-black font-bold rounded-full hover:opacity-90 transition-opacity"
            >
              Back to Details
            </button>
          </div>
        ) : (
          <div className={cn(
            "max-w-[1600px] mx-auto px-4 lg:px-8 mt-6 lg:mt-8 flex flex-col gap-6 items-start",
            allEpisodes.length > 1 ? "lg:flex-row" : "items-center"
          )}>

            {/* Main Player Area */}
            <div className={cn(
              "w-full flex flex-col gap-2",
              allEpisodes.length > 1 ? "flex-1" : "max-w-[1100px]"
            )}>
              {/* Player */}
              <div className="w-full aspect-video bg-black rounded-[16px] shadow-2xl relative overflow-hidden chrome-border">
                {playerLoading ? (
                  <div className="w-full h-full shimmer" />
                ) : episodeData?.data.video_player ? (
                  <iframe
                    src={episodeData.data.video_player}
                    allowFullScreen
                    sandbox={alwaysOn ? "allow-scripts allow-same-origin allow-forms" : "allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"}
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 font-medium">
                    Source not available
                  </div>
                )}

                {/* Warning Overlay when Safe is OFF */}
                <AnimatePresence>
                  {!alwaysOn && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, backdropFilter: "blur(0px)" }}
                      animate={{ opacity: 1, y: 0, backdropFilter: "blur(12px)" }}
                      exit={{ opacity: 0, y: -10, backdropFilter: "blur(0px)" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 z-10"
                    >
                      <div className="bg-[#ff4444]/10 border border-[#ff4444]/30 px-3 py-2 md:px-4 md:py-2.5 rounded-[10px] md:rounded-[12px] flex items-center gap-2 md:gap-3 shadow-2xl">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#ff4444]/20 flex items-center justify-center shrink-0">
                          <Shield size={14} className="text-[#ff4444] md:size-[16px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-[12px] font-bold text-[#ff4444] uppercase tracking-wider truncate">Protection Disabled</p>
                          <p className="text-[9px] md:text-[11px] text-white/70 truncate md:whitespace-normal">Unwanted popups/ads may appear.</p>
                        </div>
                        <button
                          onClick={() => setAlwaysOn(true)}
                          className="px-2 py-1 md:px-3 md:py-1.5 bg-[#ff4444] text-white text-[9px] md:text-[11px] font-bold rounded-[6px] md:rounded-[8px] hover:bg-[#ff3333] transition-colors shrink-0"
                        >
                          FIX
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Below Player Info — global style */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h1
                    className="text-2xl lg:text-3xl font-semibold text-white truncate max-w-full hover:text-[var(--color-primary)] cursor-pointer transition-colors"
                    onClick={() => setLocation(`/dubbed/anime/${slug}`)}
                  >
                    {anime.data.title}
                  </h1>
                  <h2 className="text-[14px] font-medium text-white/60">
                    {currentEp?.season && <span className="text-white/90">Season {currentEp.season} • </span>}
                    Episode {currentEp?.number || "Unknown"}
                  </h2>
                </div>

                {/* Controls row — global style (flex-nowrap gap-1.5) */}
                <div className="flex flex-nowrap items-center gap-1.5 py-1 w-full justify-start">

                  {/* Auto Next */}
                  <div className="flex items-center gap-2 bg-[#121212] px-2.5 py-2 rounded-[12px] border border-white/5 shadow-lg shrink-0 h-9">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-tight">Auto</span>
                    <button
                      onClick={() => setAutoNext(!autoNext)}
                      className={`w-8 h-4.5 rounded-full relative transition-all duration-300 ${autoNext ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-black transition-all duration-300 ${autoNext ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {/* Safe */}
                  <div className="flex items-center gap-2 bg-[#121212] px-2.5 py-2 rounded-[12px] border border-white/5 shadow-lg shrink-0 h-9">
                    <div className="flex items-center gap-1.5">
                      <Shield size={12} className={cn("transition-colors", alwaysOn ? "text-[var(--color-primary)]" : "text-white/30")} />
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-tight leading-none">Safe</span>
                    </div>
                    <button
                      onClick={() => setAlwaysOn(!alwaysOn)}
                      className={`w-8 h-4.5 rounded-full relative transition-all duration-300 ${alwaysOn ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-black transition-all duration-300 ${alwaysOn ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {/* Prev / Next — dubbed-specific navigation */}
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => episodeData?.data.prev_episode_id && setLocation(`/dubbed/watch/${slug}/${episodeData.data.prev_episode_id}`)}
                      disabled={!episodeData?.data.prev_episode_id}
                      className="px-6 py-2 rounded-full bg-white/10 text-white font-bold text-[13px] disabled:opacity-30 hover:bg-white/20 transition-colors h-9"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => episodeData?.data.next_episode_id && setLocation(`/dubbed/watch/${slug}/${episodeData.data.next_episode_id}`)}
                      disabled={!episodeData?.data.next_episode_id}
                      className="px-6 py-2 rounded-full bg-[var(--color-primary)] text-black font-bold text-[13px] disabled:opacity-30 hover:opacity-90 transition-colors h-9"
                    >
                      Next
                    </button>
                  </div>

                </div>
              </div>
            </div>

            {/* Sidebar / Episodes */}
            {allEpisodes.length > 1 && (
              <div className="w-full lg:w-[400px] shrink-0 layer-2 rounded-[16px] max-h-[700px] h-fit flex flex-col shadow-xl overflow-hidden border border-white/5 lg:sticky lg:top-[32px] bg-[#121212]/50 backdrop-blur-sm">
                <div className="p-5 border-b border-[#333333] bg-[#1A1A1A] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-semibold text-white flex items-center gap-2">
                      Episodes <span className="text-[12px] font-medium text-white/40 bg-[#222222] px-2 py-0.5 rounded-[6px]">{filteredEpisodes.length}</span>
                    </h3>
                  </div>

                  {/* Season Tabs */}
                  {seasons.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
                      {seasons.map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSeason(s)}
                          className={cn(
                            "px-3 py-1.5 rounded-[8px] text-[12px] font-bold whitespace-nowrap transition-colors",
                            selectedSeason === s ? "bg-[var(--color-primary)] text-black" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          Season {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Episode Search */}
                  <div className="relative flex items-center mb-2">
                    <Search size={14} className="absolute left-3 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search episode..."
                      value={episodeSearchQuery}
                      onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                      className="bg-black/40 border border-[#333333] rounded-[10px] pl-9 pr-3 py-2 text-[13px] text-white outline-none focus:border-[var(--color-primary)] w-full transition-all"
                    />
                  </div>
                </div>

                <div
                  ref={episodeListRef}
                  onScroll={() => {
                    if (episodeListRef.current) {
                      const { scrollTop, scrollHeight, clientHeight } = episodeListRef.current;
                      setShowEpisodeScrollHint(scrollTop + clientHeight < scrollHeight - 5);
                    }
                  }}
                  className="flex-1 overflow-y-auto w-full p-3 space-y-1.5 relative scroll-smooth scrollbar-none"
                  data-lenis-prevent
                >
                  {filteredEpisodes.map(ep => {
                    const isActive = ep.id === epId;
                    return (
                      <div
                        key={ep.id}
                        onClick={() => !isActive && setLocation(`/dubbed/watch/${slug}/${ep.id}`)}
                        className={`flex items-center gap-3 p-2.5 rounded-[12px] cursor-pointer transition-all ${isActive ? 'bg-[var(--color-primary)] text-black font-semibold' : 'bg-transparent text-white/80 hover:bg-white/5'}`}
                      >
                        <div className={`w-10 h-10 shrink-0 rounded-[10px] flex text-[13px] items-center justify-center font-bold ${isActive ? 'bg-black/20 text-black' : 'bg-[#1A1A1A] text-white/60'}`}>
                          {ep.number}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className={`text-[13px] font-medium truncate ${isActive ? '' : 'text-white/80'}`}>Episode {ep.number}</p>
                        </div>
                        {isActive && <Check size={16} className="text-black/60 shrink-0" />}
                      </div>
                    );
                  })}
                  {filteredEpisodes.length === 0 && (
                    <div className="py-10 text-center text-white/40 text-sm">
                      No matching episodes
                    </div>
                  )}
                </div>

                {/* Scroll Indicator Hint */}
                <AnimatePresence>
                  {showEpisodeScrollHint && filteredEpisodes.length > 8 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/95 to-transparent pointer-events-none flex items-end justify-center pb-3 z-[110]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] text-[var(--color-primary)] font-bold uppercase tracking-[0.15em] drop-shadow-md">More Episodes</span>
                        <ChevronDown size={14} className="text-[var(--color-primary)] animate-bounce" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>
        )}
        <Footer />
      </main>
    </PageTransition>
  );
}
