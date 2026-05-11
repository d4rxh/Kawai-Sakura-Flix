import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { fetchMegaplay, fetchAnimeDetails, fetchAnimeEpisodes, AnimeDetailProps, AnimeEpisode, MegaplayResponse } from "@/src/services/api";
import { auth, db } from "@/src/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Play, SkipForward, SkipBack, Settings, Search, Check, ChevronDown, Shield } from "lucide-react";
import { cn } from "@/src/lib/utils";

// In-memory cache to persist data across component remounts for the same anime
const animeDataCache: Record<string, { anime: AnimeDetailProps; episodes: AnimeEpisode[]; timestamp: number }> = {};

export function Watch() {
  const [match, params] = useRoute("/watch/:animeId/:epId");
  const animeId = params ? (params as any).animeId : null;
  const epId = params ? (params as any).epId : null;
  const [_, setLocation] = useLocation();

  const [anime, setAnime] = useState<AnimeDetailProps | null>(null);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [megaplay, setMegaplay] = useState<MegaplayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [mode, setMode] = useState<'sub' | 'dub'>('sub');
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");
  const [autoNext, setAutoNext] = useState(true);
  const [alwaysOn, setAlwaysOn] = useState(true);
  const [showEpisodeScrollHint, setShowEpisodeScrollHint] = useState(true);
  const episodeListRef = useRef<HTMLDivElement>(null);

  // Initialize from cache if available
  useEffect(() => {
    if (animeId && animeDataCache[animeId]) {
      setAnime(animeDataCache[animeId].anime);
      setEpisodes(animeDataCache[animeId].episodes);
      setIsLoading(false);
    }
  }, [animeId]);

  // Player Event Listeners
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      let data = event.data;

      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
      }

      // Handle events
      if (data.event === "complete" || data.type === "complete") {
        if (autoNext) {
          const nextIndex = episodes.findIndex(e => e.ep_id === epId) + 1;
          if (nextIndex < episodes.length) {
            setLocation(`/watch/${animeId}/${episodes[nextIndex].ep_id}`);
          }
        }
      }

      if (data.type === "watching-log" || data.event === "time") {
        const currentTime = data.currentTime || data.time;
        const duration = data.duration;
        
        if (auth.currentUser && currentTime && epId && animeId) {
          try {
            await setDoc(doc(db, "users", auth.currentUser.uid, "history", epId), {
              userId: auth.currentUser.uid,
              animeId: animeId,
              episodeId: epId,
              progressSeconds: Math.floor(currentTime),
              ...(duration && { durationSeconds: Math.floor(duration) }),
              lastWatchedAt: Date.now()
            }, { merge: true });
          } catch (e) {
            // Silently fail history updates
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [episodes, epId, animeId, autoNext]);

  const filteredEpisodes = episodes
    .filter(
      (ep) =>
        ep.title.toLowerCase().includes(episodeSearchQuery.toLowerCase()) ||
        ep.number.toString().includes(episodeSearchQuery)
    )
    .sort((a, b) => Number(a.number) - Number(b.number));

  useEffect(() => {
    if (!animeId || !epId) return;

    async function loadWatchData() {
      // Only set main loading if we don't have cached data
      if (!animeDataCache[animeId]) {
        setIsLoading(true);
      }
      setPlayerLoading(true);
      setError(null);
      setMegaplay(null); // Clear previous player source
      
      try {
        // Fetch Megaplay ALWAYS for the specific episode
        const mpPromise = fetchMegaplay(epId!);
        
        // Only fetch details if needed
        let detailsPromise = Promise.resolve(animeDataCache[animeId]?.anime || null);
        let episodesPromise = Promise.resolve(animeDataCache[animeId]?.episodes ? { episodes: animeDataCache[animeId].episodes } : null);

        if (!animeDataCache[animeId]) {
          detailsPromise = fetchAnimeDetails(animeId!);
          episodesPromise = fetchAnimeEpisodes(animeId!);
        }

        const [details, eps, mp] = await Promise.all([
          detailsPromise,
          episodesPromise as Promise<{ episodes: AnimeEpisode[] }>,
          mpPromise
        ]);

        if (details && eps) {
          setAnime(details);
          setEpisodes(eps.episodes);
          animeDataCache[animeId] = { anime: details, episodes: eps.episodes, timestamp: Date.now() };
        }
        
        setMegaplay(mp);
        setIsLoading(false); // Ensure main loading is false after we have initial data
        
        // Auto-select mode
        if (mp) {
           if (!mp[mode] && mp.sub) setMode('sub');
           else if (!mp[mode] && mp.dub) setMode('dub');
        }
        
        // Track History if user logged in
        if (auth.currentUser && epId && animeId) {
          try {
            await setDoc(doc(db, "users", auth.currentUser.uid, "history", epId), {
              userId: auth.currentUser.uid,
              animeId: animeId,
              episodeId: epId,
              progressSeconds: 0,
              lastWatchedAt: Date.now()
            }, { merge: true });
          } catch (e) {
            console.error("Initial history write failed", e);
          }
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
  }, [animeId, epId]);

  const currentEp = episodes.find(e => e.ep_id === epId);
  const currentIndex = episodes.findIndex(e => e.ep_id === epId);

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
        <div className="w-full h-[85vh] min-h-[600px] flex items-center justify-center flex-col gap-4 bg-[#201F31]">
          <div className="w-16 h-16 rounded-full layer-2 flex items-center justify-center text-3xl text-[#ff3333] mb-2 border border-white/10">
            !
          </div>
          <h2 className="text-display text-center">Playback Error</h2>
          <p className="text-xl font-medium text-white/50">{error || "Episode not found."}</p>
        </div>
      ) : (
        <div className={cn(
          "max-w-[1600px] mx-auto px-4 lg:px-8 mt-6 lg:mt-8 flex flex-col gap-6 items-start",
          episodes.length > 1 ? "lg:flex-row" : "items-center"
        )}>
          
          {/* Main Player Area */}
          <div className={cn(
            "w-full flex flex-col gap-2",
            episodes.length > 1 ? "flex-1" : "max-w-[1100px]"
          )}>
            <div className="w-full aspect-video bg-black rounded-[16px] shadow-2xl relative overflow-hidden chrome-border">
               {playerLoading ? (
                 <div className="w-full h-full shimmer" />
               ) : megaplay?.[mode] ? (
                 <iframe 
                   src={megaplay[mode]!} 
                   allowFullScreen 
                   sandbox={alwaysOn ? "allow-scripts allow-same-origin allow-forms" : "allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"}
                   className="w-full h-full border-0"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-white/40 font-medium">
                   Source not available
                 </div>
               )}

               {/* Warning Overlay when No Redirects is OFF */}
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

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl lg:text-3xl font-semibold text-white truncate max-w-full hover:text-[var(--color-primary)] cursor-pointer transition-colors" onClick={() => setLocation(`/anime/${anime.anime_id}`)}>
                  {anime.title}
                </h1>
                <h2 className="text-[14px] font-medium text-white/60">
                  <span className="text-white/90">Episode {currentEp?.number}</span>: {currentEp?.title || "Untitled"}
                </h2>
              </div>
              
              <div className="flex flex-nowrap items-center gap-1.5 py-1 w-full justify-start">
                <div className="flex items-center gap-2 bg-[#121212] px-2.5 py-2 rounded-[12px] border border-white/5 shadow-lg shrink-0 h-9">
                   <span className="text-[10px] font-black text-white/50 uppercase tracking-tight">Auto</span>
                   <button 
                    onClick={() => setAutoNext(!autoNext)}
                    className={`w-8 h-4.5 rounded-full relative transition-all duration-300 ${autoNext ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                   >
                     <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-black transition-all duration-300 ${autoNext ? 'left-4' : 'left-0.5'}`} />
                   </button>
                </div>

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

                <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-[12px] border border-white/5 shadow-lg shrink-0 h-9">
                {megaplay?.sub && (
                  <button 
                    onClick={() => setMode('sub')}
                    className={`px-3 py-1 font-black rounded-[8px] text-[10px] transition-all tracking-wider h-full flex items-center ${mode === 'sub' ? 'bg-[#56E39F] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    SUB
                  </button>
                )}
                {megaplay?.dub && (
                  <button 
                    onClick={() => setMode('dub')}
                    className={`px-3 py-1 font-black rounded-[8px] text-[10px] transition-all tracking-wider h-full flex items-center ${mode === 'dub' ? 'bg-[#FF9494] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    DUB
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

          {/* Sidebar / Episodes */}
          {episodes.length > 1 && (
            <div className="w-full lg:w-[400px] shrink-0 layer-2 rounded-[16px] max-h-[700px] h-fit flex flex-col shadow-xl overflow-hidden border border-white/5 lg:sticky lg:top-[32px] bg-[#121212]/50 backdrop-blur-sm">
              <div className="p-5 border-b border-[#333333] bg-[#1A1A1A] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-semibold text-white flex items-center gap-2">
                    Episodes <span className="text-[12px] font-medium text-white/40 bg-[#222222] px-2 py-0.5 rounded-[6px]">{filteredEpisodes.length}</span>
                  </h3>
                </div>
                <div className="relative flex items-center">
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
                  const isActive = ep.ep_id === epId;
                  return (
                    <div 
                      key={ep.ep_id} 
                      onClick={() => !isActive && setLocation(`/watch/${animeId}/${ep.ep_id}`)}
                      className={`flex items-center gap-3 p-2.5 rounded-[12px] cursor-pointer transition-all ${isActive ? 'bg-[var(--color-primary)] text-black font-semibold' : 'bg-transparent text-white/80 hover:bg-white/5'}`}
                    >
                      <div className={`w-10 h-10 shrink-0 rounded-[10px] flex text-[13px] items-center justify-center font-bold ${isActive ? 'bg-black/20 text-black' : 'bg-[#1A1A1A] text-white/60'}`}>
                        {ep.number}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className={`text-[13px] font-medium truncate ${isActive ? '' : 'text-white/80'}`}>{ep.title}</p>
                      </div>
                      {isActive && <Check size={16} className="text-black/60 shrink-0" />}
                    </div>
                  )
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
