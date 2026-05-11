import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Button } from "@/src/components/ui/Button";
import { SmoothText } from "@/src/components/ui/SmoothText";
import { cn } from "@/src/lib/utils";
import { Play, Plus, Check, Star, Calendar, Clock, Heart, ChevronDown, Search } from "lucide-react";
import { fetchAnimeDetails, fetchAnimeEpisodes, AnimeDetailProps, AnimeEpisode } from "@/src/services/api";
import { auth, db, loginWithGoogle } from "@/src/lib/firebase";
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, where } from "firebase/firestore";

interface WatchHistory {
  episodeId: string;
  progressSeconds: number;
  durationSeconds?: number;
  lastWatchedAt: number;
}

export function AnimeDetails() {
  const [match, params] = useRoute("/anime/:id");
  const id = params && 'id' in params ? (params as any).id : null;
  const [_, setLocation] = useLocation();

  const [anime, setAnime] = useState<AnimeDetailProps | null>(null);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Favorites state
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [showSeasonScrollHint, setShowSeasonScrollHint] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState(auth.currentUser);
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");
  const [selectedSeason, setSelectedSeason] = useState(0);
  
  // Progress/History state
  const [watchHistory, setWatchHistory] = useState<Record<string, WatchHistory>>({});

  const currentSeason = anime?.seasons?.find(s => s.anime_id === id) || (anime?.seasons && anime.seasons[0]);

  const filteredEpisodes = episodes.filter(
    (ep) =>
      ep.title.toLowerCase().includes(episodeSearchQuery.toLowerCase()) ||
      ep.number.toString().includes(episodeSearchQuery)
  );

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubAuth();
  }, []);

  // Fetch Watch History
  useEffect(() => {
    if (!user || !id) {
      setWatchHistory({});
      return;
    }

    const historyRef = collection(db, "users", user.uid, "history");
    const q = query(historyRef, where("animeId", "==", id));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const history: Record<string, WatchHistory> = {};
      snapshot.docs.forEach(d => {
        const data = d.data();
        history[data.episodeId] = {
          episodeId: data.episodeId,
          progressSeconds: data.progressSeconds,
          durationSeconds: data.durationSeconds,
          lastWatchedAt: data.lastWatchedAt
        };
      });
      setWatchHistory(history);
    });

    return () => unsub();
  }, [user, id]);

  useEffect(() => {
    if (!user || !id) {
      setIsFavorite(false);
      return;
    }
    const docRef = doc(db, "users", user.uid, "favorites", id);
    const unsub = onSnapshot(docRef, (docSnap) => {
      setIsFavorite(docSnap.exists());
    });
    return () => unsub();
  }, [user, id]);

  useEffect(() => {
    if (!id) return;
    async function loadDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const [detailsData, episodesData] = await Promise.all([
          fetchAnimeDetails(id!),
          fetchAnimeEpisodes(id!)
        ]);
        setAnime(detailsData);
        setEpisodes(episodesData.episodes || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load anime details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  const toggleFavorite = async () => {
    if (!user) {
      await loginWithGoogle();
      return;
    }
    if (!anime) return;
    
    const docRef = doc(db, "users", user.uid, "favorites", anime.anime_id);
    if (isFavorite) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, {
        userId: user.uid,
        animeId: anime.anime_id,
        title: anime.title,
        posterUrl: anime.image,
        addedAt: Date.now()
      });
    }
  };

  if (!match) return null;

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 overflow-x-hidden pt-0">
        <Header />
        
        {isLoading ? (
          <div className="w-full h-[85vh] min-h-[600px] bg-[#201F31]" />
        ) : error || !anime ? (
          <div className="w-full h-[85vh] min-h-[600px] flex items-center justify-center flex-col gap-4 bg-[#1a0f16]">
            <div className="w-20 h-20 bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 rounded-full flex items-center justify-center text-5xl text-[var(--color-primary)] mb-4">
              !
            </div>
            <h2 className="text-display text-center uppercase tracking-tighter text-white">Connection Error</h2>
            <p className="text-xl font-bold uppercase text-white/50">{error || "Anime not found."}</p>
          </div>
        ) : (
          <div>
            {/* Premium Hero Banner */}
            <div className="relative w-full h-[450px] md:h-[550px] flex items-center overflow-hidden">
               <img 
                src={anime.image} 
                alt="Banner" 
                className="w-full h-full object-cover opacity-30 mix-blend-screen blur-[8px] scale-110 saturate-[1.2]" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#201F31] via-[#201F31]/80 to-transparent" />
            </div>

            {/* Content Area */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 -mt-[250px] relative z-10">
              <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                
                {/* Poster Target */}
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
                  className="w-[200px] md:w-[260px] lg:w-[280px] shrink-0 mx-auto md:mx-0"
                >
                  <div className="relative overflow-hidden rounded-[16px] bg-[#1A1A1A] shadow-2xl aspect-[2/3] border border-[#333333] group">
                    <img 
                      src={anime.image} 
                      alt={anime.title} 
                      className="w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:scale-105"
                      onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
                      referrerPolicy="no-referrer"
                      style={{ viewTransitionName: `poster-${anime.anime_id}` }}
                    />
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => {
                        const epId = episodes.length > 0 ? episodes[0].ep_id : anime.anime_id;
                        setLocation(`/watch/${anime.anime_id}/${epId}`);
                      }}
                      className="flex-1 bg-[var(--color-primary)] text-black font-semibold py-3 rounded-[24px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                       <Play fill="currentColor" size={18} /> Watch Now
                    </button>
                    <button 
                      className="w-12 h-12 shrink-0 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-[#222222] transition-colors border border-[#333333]" 
                      onClick={toggleFavorite}
                    >
                      {isFavorite ? <Check size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                    </button>
                  </div>
                </motion.div>

                {/* Info Text */}
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
                    {anime.details?.japanese && (
                      <h2 className="text-xl font-medium text-white/50">{anime.details.japanese}</h2>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/80">
                    {anime.details?.["mal score"] && (
                      <div className="flex items-center gap-1 text-[var(--color-primary)]">
                        <Star size={16} fill="currentColor" /> {anime.details["mal score"]}
                      </div>
                    )}
                    {anime.details?.status && (
                      <div className="px-3 py-1 rounded-[6px] bg-[#1A1A1A] border border-[#333333]">
                        {anime.details.status}
                      </div>
                    )}
                    {anime.details?.premiered && (
                      <div className="px-3 py-1 rounded-[6px] bg-[#1A1A1A] border border-[#333333] flex items-center gap-2">
                        <Calendar size={14} /> {anime.details.premiered}
                      </div>
                    )}
                    {anime.details?.duration && (
                      <div className="px-3 py-1 rounded-[6px] bg-[#1A1A1A] border border-[#333333] flex items-center gap-2">
                        <Clock size={14} /> {anime.details.duration}
                      </div>
                    )}
                  </div>

                  <div className="text-body-m text-white/70 leading-relaxed max-w-4xl opacity-90">
                    <SmoothText text={anime.description} delay={0.4} />
                  </div>

                  {/* Genres */}
                  {anime.details?.genres && (
                    <div className="flex flex-col gap-3 mt-6">
                       <span className="text-sm font-semibold text-white/40">Genres</span>
                       <div className="flex flex-wrap gap-2">
                          {anime.details.genres.split(",").map(genre => (
                            <span key={genre.trim()} className="text-[13px] font-medium text-white/80 border border-[#333333] bg-[#1A1A1A] px-3 py-1.5 rounded-[8px]">
                              {genre.trim()}
                            </span>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* All Seasons List */}
                  {anime.seasons && anime.seasons.length > 0 && (
                     <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-[#333333]">
                       <span className="text-sm font-semibold text-white/40">Seasons & Parts</span>
                       
                       {/* Mobile Custom Dropdown */}
                       <div className="relative md:hidden">
                         <button 
                           onClick={() => setIsSeasonOpen(!isSeasonOpen)}
                           className="w-full flex items-center justify-between bg-[#1A1A1A] border border-[#333333] px-4 py-3 rounded-[12px] text-sm font-medium text-white/90 hover:border-[var(--color-primary)]/50 transition-all active:scale-[0.98]"
                         >
                           <span className="truncate pr-4">{anime.title}</span>
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
                                   onScroll={() => {
                                     if (dropdownRef.current) {
                                       const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
                                       // Only show hint if we aren't near the bottom (within 5px)
                                       setShowSeasonScrollHint(scrollTop + clientHeight < scrollHeight - 5);
                                     }
                                   }}
                                   className="p-2 flex flex-col gap-1 max-h-[300px] overflow-y-auto scrollbar-none"
                                 >
                                   {anime.seasons.map((s: any) => (
                                     <button
                                       key={s.anime_id}
                                       className={cn(
                                         "flex items-center justify-between text-left px-4 py-3 rounded-[10px] text-[13px] font-medium transition-all",
                                         id === s.anime_id 
                                           ? "bg-[var(--color-primary)] text-black" 
                                           : "text-white/70 hover:bg-white/5 hover:text-white"
                                       )}
                                       onClick={() => {
                                         setLocation(`/anime/${s.anime_id}`);
                                         setIsSeasonOpen(false);
                                       }}
                                     >
                                       <span className="truncate pr-4">{s.title}</span>
                                       {id === s.anime_id && <Check size={16} />}
                                     </button>
                                   ))}
                                 </div>
                                 
                                 {/* Scroll Indicator Hint */}
                                 <AnimatePresence>
                                   {showSeasonScrollHint && anime.seasons.length > 5 && (
                                     <motion.div 
                                       initial={{ opacity: 0, y: 10 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       exit={{ opacity: 0, y: 10 }}
                                       className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/95 to-transparent pointer-events-none flex items-end justify-center pb-3 z-[110]"
                                     >
                                       <div className="flex flex-col items-center gap-1">
                                         <span className="text-[11px] text-[var(--color-primary)] font-bold uppercase tracking-[0.15em] drop-shadow-md">More Seasons</span>
                                         <ChevronDown size={14} className="text-[var(--color-primary)] animate-bounce" />
                                       </div>
                                     </motion.div>
                                   )}
                                 </AnimatePresence>
                               </motion.div>
                             </>
                           )}
                         </AnimatePresence>
                       </div>

                       {/* Desktop Flex Wrap */}
                       <div className="hidden md:flex md:flex-wrap gap-2">
                         {anime.seasons.map((s: any) => (
                           <button
                             key={s.anime_id}
                             className={cn(
                               "text-[13px] font-medium border px-3 py-1.5 rounded-[8px] transition-colors md:shrink md:w-auto text-center truncate md:min-w-0 md:max-w-none",
                               id === s.anime_id 
                                 ? "text-black bg-[var(--color-primary)] border-[var(--color-primary)]" 
                                 : "text-white/80 border-[#333333] bg-[#1A1A1A] hover:bg-[#222222]"
                             )}
                             onClick={() => setLocation(`/anime/${s.anime_id}`)}
                           >
                             {s.title}
                           </button>
                         ))}
                       </div>
                     </div>
                  )}
                  
                  {/* Additional Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#333333]">
                     <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-white/40 uppercase">Studios</span>
                        <span className="text-sm text-white/90">{anime.details?.studios || "Unknown"}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-white/40 uppercase">Aired</span>
                        <span className="text-sm text-white/90">{anime.details?.aired || "Unknown"}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-white/40 uppercase">Producers</span>
                        <span className="text-sm text-white/90 line-clamp-1">{anime.details?.producers || "Unknown"}</span>
                     </div>
                  </div>
                </motion.div>
              </div>

              {/* Episodes Section */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 border-t border-[#333333] pt-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-headline-l text-white">Episodes <span className="text-white/40 text-[18px]">({filteredEpisodes.length})</span></h2>
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
                
                {filteredEpisodes.length === 0 ? (
                  <div className="p-10 bg-[#1A1A1A] rounded-[16px] text-center text-white/50 border border-[#333333]">
                     No episodes available yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    {filteredEpisodes.map((ep, idx) => {
                      const history = watchHistory[ep.ep_id];
                      // If progressSeconds > 0, we can estimate progress if we had duration.
                      // For now, if we don't have duration, we just show a "watching" or "completed" logic if it's very close.
                      // But the requirement just says "visual indicator of progress".
                      // We'll show a small bar if duration is available, or just a "Watched" tag.
                      const progressPercent = (history && history.durationSeconds) 
                        ? (history.progressSeconds / history.durationSeconds) * 100 
                        : (history?.progressSeconds ? 50 : 0); // Fake 50% if just started but no duration

                      return (
                        <motion.div
                          onClick={() => setLocation(`/watch/${anime.anime_id}/${ep.ep_id}`)}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ delay: (idx % 15) * 0.03 }}
                          key={ep.ep_id}
                          className={cn(
                            "group relative flex flex-col bg-[#1A1A1A] border border-[#333333] rounded-[12px] p-3 hover:bg-[#222222] cursor-pointer transition-all overflow-hidden",
                            history?.progressSeconds && "border-[var(--color-primary)]/30"
                          )}
                        >
                          <div className="flex gap-3 items-center">
                            <div className={cn(
                              "w-10 h-10 shrink-0 bg-black rounded-[8px] flex items-center justify-center font-bold text-[var(--color-primary)] opacity-80 group-hover:opacity-100 transition-colors",
                              history?.progressSeconds && "bg-[var(--color-primary)]/10"
                            )}>
                              {ep.number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">{ep.title}</p>
                              {history?.progressSeconds ? (
                                <span className="text-[10px] uppercase font-bold text-[var(--color-primary)]/70">
                                  {progressPercent >= 95 ? "Completed" : "In Progress"}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          {history?.progressSeconds ? (
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/50">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                                className="h-full bg-[var(--color-primary)]"
                              />
                            </div>
                          ) : null}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>

          </div>
        )}
        <Footer />
      </main>
    </PageTransition>
  );
}
