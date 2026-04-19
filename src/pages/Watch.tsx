import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { fetchEpisodeDetails, fetchAnimeDetails, AnimeSaltDetail, AnimeSaltEpisode, EpisodeResponse } from "@/src/services/api";
import { auth, db } from "@/src/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Play, SkipForward, SkipBack, Settings, Maximize } from "lucide-react";

// In-memory cache to persist data across component remounts for the same anime
const animeDataCache: Record<string, { anime: AnimeSaltDetail["data"]; episodes: AnimeSaltEpisode[]; timestamp: number }> = {};

export function Watch() {
  const [match, params] = useRoute("/watch/:animeId/:epId");
  const animeId = params ? (params as any).animeId : null;
  const epId = params ? (params as any).epId : null;
  const [_, setLocation] = useLocation();

  const [anime, setAnime] = useState<AnimeSaltDetail["data"] | null>(null);
  const [episodes, setEpisodes] = useState<AnimeSaltEpisode[]>([]);
  const [episodeData, setEpisodeData] = useState<EpisodeResponse["data"] | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");
  const [autoNext, setAutoNext] = useState(true);

  // Initialize from cache if available
  useEffect(() => {
    if (animeId && animeDataCache[animeId]) {
      setAnime(animeDataCache[animeId].anime);
      setEpisodes(animeDataCache[animeId].episodes);
      setIsLoading(false);
    }
  }, [animeId]);

  // Player Event Listeners for Auto-Next
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Handle events
      if (event.data === "video_playback_completed") {
        if (autoNext && episodeData?.next_episode_id) {
          setLocation(`/watch/${animeId}/${episodeData.next_episode_id}`);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [episodeData, animeId, autoNext, setLocation]);

  // Auto Skip intro/outro
  useEffect(() => {
    const interval = setInterval(() => {
      const iframe = document.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ autoSkip: { intro: true, outro: true } }, '*');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredEpisodes = episodes.filter(
    (ep) =>
      ep.title.toLowerCase().includes(episodeSearchQuery.toLowerCase()) ||
      ep.number.toString().includes(episodeSearchQuery)
  );

  useEffect(() => {
    if (!animeId || !epId) return;

    async function loadWatchData() {
      // Only set main loading if we don't have cached data
      if (!animeDataCache[animeId]) {
        setIsLoading(true);
      }
      setPlayerLoading(true);
      setError(null);
      setEpisodeData(null); // Clear previous player source
      
      try {
        // Fetch Episode ALWAYS for the specific episode
        const epPromise = fetchEpisodeDetails(epId!);
        
        // Only fetch details if needed
        let detailsPromise = Promise.resolve({ success: true, data: animeDataCache[animeId]?.anime } as AnimeSaltDetail);

        if (!animeDataCache[animeId]) {
          detailsPromise = fetchAnimeDetails(animeId!);
        }

        const [detailsData, epData] = await Promise.all([
          detailsPromise,
          epPromise
        ]);

        if (detailsData.success && detailsData.data) {
          setAnime(detailsData.data);
          setEpisodes(detailsData.data.episodes || []);
          animeDataCache[animeId] = { anime: detailsData.data, episodes: detailsData.data.episodes || [], timestamp: Date.now() };
        }
        
        if (epData.success && epData.data) {
          setEpisodeData(epData.data);
        } else {
          setError("Failed to load episode details.");
        }
        setIsLoading(false); // Ensure main loading is false after we have initial data
        
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

  const currentEp = episodes.find(e => e.id === epId);

  const handleFullscreen = async () => {
    const playerContainer = document.getElementById("player-container");
    if (playerContainer && playerContainer.requestFullscreen) {
      try {
        await playerContainer.requestFullscreen();
        if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock("landscape");
        }
      } catch (err) {
        console.warn("Fullscreen or orientation lock failed", err);
      }
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 pt-[80px] lg:pt-[100px]">
        <Header />
        
        {isLoading ? (
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 mt-6">
          <div className="w-full aspect-video rounded-[16px] overflow-hidden layer-2 border border-white/10 flex items-center justify-center">
             <div className="w-full h-full shimmer" />
          </div>
        </div>
      ) : error || !anime ? (
        <div className="w-full h-[85vh] min-h-[600px] flex items-center justify-center flex-col gap-4">
          <div className="w-16 h-16 rounded-full layer-2 flex items-center justify-center text-3xl text-[#ff3333] mb-2 border border-white/10">
            !
          </div>
          <h2 className="text-display text-center">Playback Error</h2>
          <p className="text-xl font-medium text-white/50">{error || "Episode not found."}</p>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 mt-6 lg:mt-8 flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Main Player Area */}
          <div className="flex-1 w-full flex flex-col gap-6">
            <div id="player-container" className="w-full aspect-video bg-black rounded-[16px] shadow-2xl relative overflow-hidden chrome-border sakura-glow">
               {playerLoading ? (
                 <div className="w-full h-full shimmer" />
               ) : episodeData?.video_player ? (
                 <iframe 
                   src={episodeData.video_player} 
                   allowFullScreen 
                   sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                   className="w-full h-full border-0"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-white/40 font-medium">
                   Source not available
                 </div>
               )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-2">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl lg:text-3xl font-semibold text-white truncate max-w-full hover:text-[var(--color-primary)] cursor-pointer transition-colors" onClick={() => setLocation(`/anime/${animeId}`)}>
                  {anime.title}
                </h1>
                <h2 className="text-[14px] font-medium text-white/60">
                  <span className="text-white/90">Episode {currentEp?.number}</span>: {currentEp?.title || "Untitled"}
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={handleFullscreen}
                  className="flex items-center gap-2 layer-2 px-4 py-2 rounded-[12px] border border-[#333333] hover:bg-white/10 transition-colors"
                >
                  <Maximize size={16} className="text-white/60" />
                  <span className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Landscape</span>
                </button>
                <div className="flex items-center gap-3 layer-2 px-4 py-2 rounded-[12px] border border-[#333333]">
                   <span className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Auto Next</span>
                   <button 
                    onClick={() => setAutoNext(!autoNext)}
                    className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${autoNext ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                   >
                     <div className={`absolute top-1 w-3 h-3 rounded-full bg-black transition-all duration-300 ${autoNext ? 'left-6' : 'left-1'}`} />
                   </button>
                </div>
            </div>
          </div>
        </div>

          {/* Sidebar / Episodes */}
          <div className="w-full lg:w-[400px] shrink-0 layer-2 rounded-[16px] h-[600px] flex flex-col shadow-xl overflow-hidden chrome-border">
            <div className="p-5 border-b border-[#333333] bg-[#1A1A1A] flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-white flex items-center gap-2">
                 Episodes <span className="text-[12px] font-medium text-white/40 bg-[#222222] px-2 py-0.5 rounded-[6px]">{filteredEpisodes.length}</span>
              </h3>
              <input 
                type="text" 
                placeholder="Search..." 
                value={episodeSearchQuery}
                onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                className="bg-black border border-[#333333] rounded-[8px] px-3 py-1 text-[12px] text-white outline-none focus:border-[#555555] w-[100px]"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto w-full p-3 space-y-3 relative scroll-smooth" data-lenis-prevent>
              {filteredEpisodes.map(ep => {
                const isActive = ep.id === epId;
                return (
                  <div 
                    key={ep.id} 
                    onClick={() => !isActive && setLocation(`/watch/${animeId}/${ep.id}`)}
                    className={`flex gap-3 p-2 rounded-[12px] cursor-pointer transition-all group ${isActive ? 'bg-[#222222] border border-[#444444] shadow-lg' : 'bg-transparent border border-transparent hover:bg-[#1A1A1A]'}`}
                  >
                    <div className="relative w-[110px] aspect-video shrink-0 rounded-[8px] overflow-hidden bg-black/40">
                      <img src={ep.thumbnail} alt={ep.title} className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? '' : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'}`} />
                      {isActive && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[1px]">
                           <Play size={18} fill="var(--color-primary)" className="text-[var(--color-primary)] mb-1" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-primary)]">Playing</span>
                        </div>
                      )}
                      {!isActive && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[1px]">
                           <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm shadow-xl">
                             <Play size={14} fill="currentColor" className="text-white ml-0.5" />
                           </div>
                         </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold text-white shadow-sm border border-white/10">
                        E{ep.number}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                       <p className={`text-[13px] font-bold leading-tight line-clamp-2 ${isActive ? 'text-[var(--color-primary)]' : 'text-white/90 group-hover:text-white transition-colors'}`}>{ep.title}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}
      <Footer />
    </main>
  </PageTransition>
);
}