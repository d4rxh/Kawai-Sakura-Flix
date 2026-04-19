import { useEffect, useState } from "react";
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
import { fetchAnimeDetails, AnimeSaltDetail, AnimeSaltEpisode } from "@/src/services/api";
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
  const id = params && 'id' in params ? (params as any).id : null; // id here is the slug
  const [_, setLocation] = useLocation();

  const [anime, setAnime] = useState<AnimeSaltDetail["data"] | null>(null);
  const [episodes, setEpisodes] = useState<AnimeSaltEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Favorites state
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");
  
  // Progress/History state
  const [watchHistory, setWatchHistory] = useState<Record<string, WatchHistory>>({});

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
        const detailsData = await fetchAnimeDetails(id!);
        if (detailsData.success && detailsData.data) {
          setAnime(detailsData.data);
          setEpisodes(detailsData.data.episodes || []);
        } else {
          setError("Failed to load anime details.");
        }
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
    if (!anime || !id) return;
    
    const docRef = doc(db, "users", user.uid, "favorites", id);
    if (isFavorite) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, {
        userId: user.uid,
        animeId: id,
        title: anime.title,
        posterUrl: anime.thumbnail,
        addedAt: Date.now()
      });
    }
  };

  if (!match) return null;

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 pt-0">
        <Header />
        
        {isLoading ? (
          <div className="w-full h-[85vh] min-h-[600px] bg-transparent" />
        ) : error || !anime ? (
          <div className="w-full h-[85vh] min-h-[600px] flex items-center justify-center flex-col gap-4 border-b-[3px] border-black bg-[#FFCC00]">
            <div className="w-20 h-20 bg-[#FF3366] brutal-border flex items-center justify-center text-5xl text-black font-black shadow-[6px_6px_0_0_#000] rotate-[-5deg] mb-4">
              !
            </div>
            <h2 className="text-display text-center uppercase tracking-tighter">Connection Error</h2>
            <p className="text-xl font-bold uppercase text-black/80">{error || "Anime not found."}</p>
          </div>
        ) : (
          <div>
            {/* Premium Hero Banner */}
            <div className="relative w-full h-[450px] md:h-[550px] flex items-center overflow-hidden">
               <img 
                src={anime.thumbnail} 
                alt="Banner" 
                className="w-full h-full object-cover opacity-30 mix-blend-screen blur-[8px] scale-110 saturate-[1.2]" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#0A0A0A]/80 to-transparent" />
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
                      src={anime.thumbnail} 
                      alt={anime.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      style={{ viewTransitionName: `poster-${id}` }}
                    />
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => {
                        if (episodes.length > 0) setLocation(`/watch/${id}/${episodes[0].id}`);
                      }}
                      disabled={episodes.length === 0}
                      className="flex-1 bg-[var(--color-primary)] text-black font-semibold py-3 rounded-[24px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
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
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/80">
                    <div className="px-3 py-1 rounded-[6px] bg-[#1A1A1A] border border-[#333333]">
                      {anime.is_movie ? "Movie" : "TV Series"}
                    </div>
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
                            <span key={genre} className="text-[13px] font-medium text-white/80 border border-[#333333] bg-[#1A1A1A] px-3 py-1.5 rounded-[8px]">
                              {genre}
                            </span>
                          ))}
                       </div>
                    </div>
                  )}

                </motion.div>
              </div>

              {/* Episodes Section */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 border-t border-[#333333] pt-10"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-headline-l text-white">Episodes <span className="text-white/40 text-[18px]">({filteredEpisodes.length})</span></h2>
                  <div className="flex items-center gap-3">
                        <div className="relative flex items-center">
                          <Search size={18} className="absolute left-3 text-white/50" />
                          <input 
                           type="text" 
                           placeholder="Search episodes..." 
                           value={episodeSearchQuery}
                           onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                           className="bg-[#1A1A1A] border border-[#333333] rounded-[8px] pl-10 pr-3 py-1.5 text-[13px] text-white outline-none focus:border-[var(--color-primary)] transition-colors w-full"
                          />
                        </div>
                  </div>
                </div>
                
                {filteredEpisodes.length === 0 ? (
                  <div className="p-10 bg-[#1A1A1A] rounded-[16px] text-center text-white/50 border border-[#333333]">
                     No episodes available yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEpisodes.map((ep, idx) => {
                      const history = watchHistory[ep.id];
                      const progressPercent = (history && history.durationSeconds) 
                        ? (history.progressSeconds / history.durationSeconds) * 100 
                        : (history?.progressSeconds ? 50 : 0);

                      return (
                        <motion.div
                          onClick={() => setLocation(`/watch/${id}/${ep.id}`)}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ delay: (idx % 15) * 0.03 }}
                          key={ep.id}
                          className={cn(
                            "group relative flex flex-col bg-[#1A1A1A] border border-[#333333] rounded-[12px] hover:bg-[#222222] cursor-pointer transition-all overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1",
                            history?.progressSeconds && "border-[var(--color-primary)]/30"
                          )}
                        >
                          <div className="relative w-full aspect-video bg-black/40 overflow-hidden">
                            <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover transition-transform duration-500 opacity-80 group-hover:opacity-100 group-hover:scale-105" />
                            
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                               <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-2xl">
                                 <Play size={18} fill="currentColor" className="text-white ml-0.5" />
                               </div>
                            </div>

                            <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded-[4px] text-[11px] font-bold text-white shadow-sm border border-white/10 backdrop-blur-sm">
                              Episode {ep.number}
                            </div>
                          </div>
                          
                          <div className="p-3 flex flex-col gap-1">
                             <p className="text-[13px] font-bold text-white/90 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">{ep.title}</p>
                             
                             {history?.progressSeconds && (
                               <span className="text-[10px] uppercase font-bold text-[var(--color-primary)]/70 mt-1">
                                 {progressPercent >= 95 ? "Completed" : "In Progress"}
                               </span>
                             )}
                          </div>
                          
                          {/* Progress Bar */}
                          {history?.progressSeconds ? (
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/50">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                                className="h-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]"
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
