import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "motion/react";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { fetchAnimeSaltHome, AnimeSaltHomeResponse, AnimeSaltHomeItem } from "@/src/services/animesalt";
import { Play } from "lucide-react";

export function Dubbed() {
  const [_, setLocation] = useLocation();
  const [data, setData] = useState<AnimeSaltHomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchAnimeSaltHome();
        setData(result);
      } catch (err) {
        setError("Failed to load Dubbed Anime & Cartoons.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const renderSection = (title: string, items?: AnimeSaltHomeItem[]) => {
    if (!items || items.length === 0) return null;
    return (
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-l text-[var(--color-primary)]">{title}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {items.slice(0, 12).map((item, i) => (
            <motion.div 
              key={item.slug + i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 12) * 0.05, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
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
      </section>
    );
  };

  return (
    <PageTransition>
      <main className="min-h-screen pt-[72px] pb-20 bg-[#201F31]">
        <Header />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-12">
          {isLoading ? (
            <div className="w-full h-[60vh] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[var(--color-primary)] animate-spin" />
            </div>
          ) : error ? (
            <div className="w-full h-[40vh] flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl text-[var(--color-primary)]">!</div>
              <p className="text-white/60">{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-4">
              {renderSection("Fresh Drops", data.data.fresh_drops)}
              {renderSection("On-Air Series", data.data["on-air_series_view_more"])}
              {renderSection("New Anime Arrivals", data.data.new_anime_arrivals_view_more)}
              {renderSection("Just In: Cartoons", data.data["just_in:_cartoon_series_view_more"])}
              {renderSection("Fresh Cartoon Films", data.data.fresh_cartoon_films_view_more)}
              {renderSection("Latest Anime Movies", data.data.latest_anime_movies_view_more)}
            </div>
          ) : null}
        </div>
        <Footer />
      </main>
    </PageTransition>
  );
}
