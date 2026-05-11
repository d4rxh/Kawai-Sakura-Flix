import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { Footer } from "@/src/components/layout/Footer";
import { ChevronLeft } from "lucide-react";
import { fetchHomeData, HomeResponse } from "@/src/services/api";
import { AnimeCard } from "@/src/components/ui/AnimeCard";

const cache = new Map<string, { data: HomeResponse, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function TvSeries() {
  const [_, setLocation] = useLocation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTV() {
      setIsLoading(true);
      try {
        const now = Date.now();
        let homeData: HomeResponse;
        
        if (cache.has('tv_data') && now - cache.get('tv_data')!.timestamp < CACHE_TTL) {
          homeData = cache.get('tv_data')!.data;
        } else {
          homeData = await fetchHomeData();
          cache.set('tv_data', { data: homeData, timestamp: now });
        }
        
        // Mock TV Series catalog by combining list
        const tvList = [
          ...homeData.top_airing,
          ...homeData.latest_completed,
          ...homeData.latest_episodes,
        ];
        
        // Filter out duplicates
        const uniqueTv = Array.from(new Map(tvList.map(item => [item.anime_id, item])).values());
        setData(uniqueTv);
      } catch (err) {
        setError("Failed to load TV Series.");
      } finally {
        setIsLoading(false);
      }
    }
    loadTV();
  }, []);

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 pt-8">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          {/* Back Button */}
          <button 
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-[14px] font-bold text-white/50 hover:text-[var(--color-primary)] transition-colors mb-10 group"
          >
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-black group-hover:border-[var(--color-primary)] transition-all">
              <ChevronLeft size={18} />
            </div>
            Back to Home
          </button>
          
          <h1 className="text-headline-l text-[var(--color-primary)] mb-8">TV Series</h1>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Main Grid Area */}
            <div className="flex-1 w-full">
              {isLoading ? (
                <div className="w-full h-[40vh]" />
              ) : error ? (
                <div className="w-full h-[40vh] flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl">!</div>
                  <p className="text-white/60">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-8">
                  {data.map((anime, idx) => (
                    <AnimeCard
                      key={`${anime.anime_id}-${idx}`}
                      id={anime.anime_id}
                      title={anime.title}
                      imageUrl={anime.image}
                      type="TV"
                      sub={anime.sub || undefined}
                      dub={anime.dub || undefined}
                      onClick={() => setLocation(`/anime/${anime.anime_id}`)}
                      index={idx}
                    />
                  ))}
                </div>
              )}
              
              {/* Mock Pagination */}
              {!isLoading && data.length > 0 && (
                <div className="flex justify-center mt-12 gap-2">
                  <button className="w-10 h-10 rounded-full layer-2 flex items-center justify-center hover:bg-white/10 transition-colors text-[14px]">1</button>
                  <button className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-black font-bold flex items-center justify-center text-[14px]">2</button>
                  <button className="w-10 h-10 rounded-full layer-2 flex items-center justify-center hover:bg-white/10 transition-colors text-[14px]">3</button>
                  <button className="w-10 h-10 rounded-full layer-2 flex items-center justify-center hover:bg-white/10 transition-colors text-[14px]">4</button>
                  <button className="w-10 h-10 rounded-full layer-2 flex items-center justify-center hover:bg-white/10 transition-colors text-[14px]">5</button>
                  <span className="text-white/40 flex items-end">...</span>
                  <button className="w-10 h-10 rounded-full layer-2 flex items-center justify-center hover:bg-white/10 transition-colors text-[14px]">142</button>
                </div>
              )}
            </div>
            
            {/* Sidebar / Filter (Mocked) */}
            <div className="w-full lg:w-[300px] shrink-0 layer-2 rounded-[16px] p-6 border border-white/5">
              <h3 className="text-[18px] font-bold text-white mb-6">Filter</h3>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-white/40 uppercase">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi'].map(g => (
                      <button key={g} className="px-3 py-1.5 rounded-[8px] bg-white/5 hover:bg-[var(--color-primary)] hover:text-black transition-colors text-[12px] font-medium text-white/70">{g}</button>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-white/40 uppercase">Format</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white/80 outline-none">
                    <option>TV Series</option>
                    <option>Movies</option>
                    <option>OVA</option>
                    <option>ONA</option>
                    <option>Specials</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-white/40 uppercase">Season</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white/80 outline-none">
                    <option>All</option>
                    <option>Fall</option>
                    <option>Summer</option>
                    <option>Spring</option>
                    <option>Winter</option>
                  </select>
                </div>
                
                <button className="w-full bg-[var(--color-primary)] text-black rounded-[8px] py-2.5 font-bold mt-4 hover:opacity-90 transition-opacity">
                  Filter
                </button>
              </div>
            </div>
            
          </div>
        </div>
        <Footer />
      </main>
    </PageTransition>
  );
}
