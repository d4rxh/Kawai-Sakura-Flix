import React, { useState } from "react";
import { Play, Plus, Check, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface AnimeCardProps {
  id: string;
  title: string;
  imageUrl: string;
  score?: number;
  episodes?: number;
  type?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  onClick?: (id: string) => void;
  index?: number;
  key?: React.Key;
  sub?: string | null;
  dub?: string | null;
}

export function AnimeCard({
  id,
  title,
  imageUrl,
  score,
  episodes,
  type = "TV",
  isFavorite,
  onToggleFavorite,
  onClick,
  index = 0,
  sub,
  dub
}: AnimeCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: (index % 20) * 0.03, 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1] 
      }}
      className="group relative flex flex-col gap-2 cursor-pointer w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(id)}
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-[12px] layer-2 transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
        
        {/* Placeholder */}
        {!isLoaded && <div className="absolute inset-0 bg-[#1A1A1A] shimmer z-0" />}

        {/* Poster Image */}
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={cn(
            "w-full h-full object-cover z-10 relative transition-all duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            "group-hover:scale-105"
          )}
          onLoad={() => setIsLoaded(true)}
          style={{ viewTransitionName: `poster-${id}` }}
        />

        {/* Bottom Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

        {/* Aniwatch Style Indicators */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20 text-[11px] font-bold">
           <div className="flex items-center gap-1">
             {sub && <span className="bg-[#b0e3af] text-black px-1.5 py-0.5 rounded-[4px] shadow-sm flex items-center h-5">SUB {sub}</span>}
             {dub && <span className="bg-[#e3b5af] text-black px-1.5 py-0.5 rounded-[4px] shadow-sm flex items-center h-5">DUB {dub}</span>}
           </div>
           <div className="flex items-center gap-1 text-white/90">
             <span className="bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded-[4px] flex items-center h-5">{type}</span>
           </div>
        </div>

        {/* Hover Overlay Center */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex flex-col items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="w-14 h-14 bg-[var(--color-primary)] rounded-full text-black flex items-center justify-center shadow-lg"
            >
              <Play className="w-6 h-6 ml-1" fill="currentColor" stroke="none" />
            </motion.div>
        </div>

        {/* Badges / Chips */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5 opacity-100">
          {score !== undefined && score > 0 && (
            <div className="bg-[#000000] text-[#ffdd95] px-2 py-0.5 rounded-[6px] text-[12px] font-bold flex items-center gap-1 border border-[#333333]">
              <Star size={12} fill="currentColor" /> {score.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-0.5 mt-1">
        <h3 className="text-[14px] font-semibold text-white/90 line-clamp-2 leading-tight group-hover:text-[var(--color-primary)] transition-colors">{title}</h3>
      </div>
    </motion.div>
  );
}
