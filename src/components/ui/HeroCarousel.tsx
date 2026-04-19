import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Plus } from "lucide-react";
import { useLocation } from "wouter";

export interface HeroAnime {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  logoUrl?: string; // Optional logo overlay
  genres: string[];
}

interface HeroCarouselProps {
  items: HeroAnime[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div className="relative w-full h-[450px] md:h-[600px] lg:h-[80vh] min-h-[450px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={items[currentIndex].bannerUrl} 
            alt={items[currentIndex].title}
            className="w-full h-full object-cover opacity-60 mix-blend-screen saturate-[1.2]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080104] via-[#120309]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080104]/90 via-[#120309]/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10 flex flex-col justify-end pb-16 md:pb-24 lg:pb-32">
        <div className="max-w-2xl flex flex-col gap-3 md:gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentIndex}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col gap-2 md:gap-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                {items[currentIndex].genres.map((genre) => (
                  <span 
                    key={genre}
                    className="text-[10px] md:text-[12px] font-bold text-white/80 bg-[#1A1A1A] px-2 md:px-3 py-1 rounded-[6px] border border-[#333333]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[#ff8da1] text-[10px] md:text-[12px] font-black tracking-widest uppercase flex items-center gap-1 drop-shadow-[0_0_8px_rgba(255,141,161,0.5)]">
                  <span className="w-4 h-4 bg-[#ff8da1] text-black rounded-sm flex items-center justify-center text-[12px]">S</span>
                  SERIES
                </span>
              </div>
              <h1 className="text-[28px] md:text-display text-white line-clamp-2 md:line-clamp-3 leading-tight md:leading-snug">
                {items[currentIndex].title}
              </h1>
              
              <p className="text-[14px] md:text-body-m line-clamp-2 md:line-clamp-3 text-white/70">
                <span className="font-black text-white drop-shadow-md">#1 in Anime Today</span> • {items[currentIndex].description || "An epic journey continues. Join the adventure now."}
              </p>

              <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-4 md:mt-6">
                <button 
                  onClick={() => setLocation(`/anime/${items[currentIndex].id}`)}
                  className="bg-[var(--color-primary)] text-black flex items-center justify-center gap-2 px-6 md:px-8 py-2 md:py-3.5 rounded-[24px] font-bold text-[14px] transition-all hover:scale-105"
                >
                  <Play fill="currentColor" size={18} />
                  WATCH
                </button>
                <button className="bg-[#1A1A1A] text-white border border-[#333333] flex items-center justify-center gap-2 px-6 md:px-8 py-2 md:py-3.5 rounded-[24px] font-bold text-[14px] transition-all hover:bg-[#222222]">
                  <Plus size={18} strokeWidth={3} />
                  LIST
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Navigation Indicators */}
      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-6 lg:right-10 z-30 flex gap-1.5 md:gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`cursor-pointer h-1.5 md:h-2 transition-all duration-300 rounded-full ${i === currentIndex ? 'w-6 md:w-8 bg-[var(--color-primary)]' : 'w-1.5 md:w-2 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
