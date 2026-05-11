import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { fetchAnimeSaltSearch } from "@/src/services/animesalt";
import { Play } from "lucide-react";

export function DubbedSearch() {
  const { query } = useParams<{ query: string }>();
  const [_, setLocation] = useLocation();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function doSearch() {
      if (!query) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchAnimeSaltSearch(query);
        setResults(res.results || []);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to fetch search results.");
      } finally {
        setIsLoading(false);
      }
    }
    doSearch();
  }, [query]);

  return (
    <PageTransition>
      <main className="min-h-screen bg-[#201F31] pt-[72px] pb-20">
        <Header />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-12">

          {isLoading ? (
            <div className="w-full h-[40vh] flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/10 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="w-full h-[40vh] flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-primary)] text-2xl">!</div>
              <p className="text-white/60">{error}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {results.map((item, i) => (
                <motion.div 
                  key={item.slug + i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 20) * 0.03, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="group cursor-pointer flex flex-col gap-2"
                  onClick={() => setLocation(`/dubbed/anime/${item.slug}`)}
                >
                  <div className="relative aspect-[2/3] rounded-[16px] overflow-hidden bg-[#1A1A1A] mb-1 border border-white/5 shadow-2xl transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.02] group-hover:border-[var(--color-primary)]/30 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),_0_0_20px_rgba(255,186,222,0.1)]">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-500 ease-in-out opacity-0 group-hover:scale-105"
                      onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 bg-[var(--color-primary)] rounded-full text-black flex items-center justify-center shadow-lg group-hover:scale-100 scale-90 transition-transform duration-300">
                          <Play className="w-6 h-6 ml-1" fill="currentColor" stroke="none" />
                        </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-[14px] text-white/90 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 px-1">
                    {item.title}
                  </h3>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="w-full h-[40vh] flex flex-col items-center justify-center gap-4 text-white/50">
               <div className="text-4xl mb-2 text-[var(--color-primary)]">🔍</div>
               <p className="text-xl font-bold">No results found</p>
               <p className="text-sm">Try searching for something else</p>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </PageTransition>
  );
}
