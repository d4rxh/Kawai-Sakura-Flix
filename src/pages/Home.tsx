import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { HeroCarousel, HeroAnime } from "@/src/components/ui/HeroCarousel";
import { AnimeCard } from "@/src/components/ui/AnimeCard";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { auth, db, loginWithGoogle } from "@/src/lib/firebase";
import { collection, doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { fetchHomeData, HomeResponse } from "@/src/services/api";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Github } from "lucide-react";

export function Home() {
  const [_, setLocation] = useLocation();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState(auth.currentUser);
  
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setFavorites({});
      return;
    }
    const favRef = collection(db, "users", user.uid, "favorites");
    const unsub = onSnapshot(favRef, (snapshot) => {
      const favs: Record<string, boolean> = {};
      snapshot.docs.forEach(d => {
        favs[d.data().animeId] = true;
      });
      setFavorites(favs);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await fetchHomeData();
        setHomeData(data);
      } catch (err) {
        setError("Failed to load anime content. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  const toggleFavorite = async (id: string, animeTitle: string, animePoster: string) => {
    if (!user) {
      await loginWithGoogle();
      return;
    }
    const isFav = favorites[id];
    const docRef = doc(db, "users", user.uid, "favorites", id);
    if (isFav) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, {
        userId: user.uid,
        animeId: id,
        title: animeTitle,
        posterUrl: animePoster,
        addedAt: Date.now()
      });
    }
  };

  // Maps API spotlight to HeroCarousel props
  const heroItems: HeroAnime[] = homeData?.spotlight.slice(0, 5).map(item => ({
    id: item.anime_id,
    title: item.title,
    description: item.description || "",
    bannerUrl: item.image,
    genres: item.type ? [item.type] : ["Anime"]
  })) || [];

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 overflow-x-hidden pt-0">
        <Header />
        
        {isLoading ? (
          <div className="w-full h-[85vh] min-h-[600px] bg-[#201F31]" />
        ) : error ? (
          <div className="w-full h-[85vh] min-h-[600px] flex items-center justify-center flex-col gap-4 bg-[#201F31]">
            <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center text-5xl text-[#ff3333] mb-4">
              !
            </div>
            <h2 className="text-display text-center tracking-tighter text-white">Connection Error</h2>
            <p className="text-xl font-medium text-white/50">{error}</p>
          </div>
        ) : (
          <HeroCarousel items={heroItems} />
        )}

        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-20 space-y-20">
        
        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-headline-l text-[var(--color-primary)]">Trending Now</h2>
            <button className="text-[14px] font-semibold text-white/50 hover:text-white transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-full">
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-[12px] shimmer" />
              ))
            ) : homeData?.trending.slice(0, 12).map((anime, i) => (
              <AnimeCard 
                key={anime.anime_id} 
                id={anime.anime_id}
                title={anime.title}
                imageUrl={anime.image}
                score={undefined}
                sub={anime.sub || undefined}
                dub={anime.dub || undefined}
                episodes={anime.episodes ? parseInt(anime.episodes) : undefined}
                type={anime.type}
                index={i}
                isFavorite={favorites[anime.anime_id]}
                onToggleFavorite={() => toggleFavorite(anime.anime_id, anime.title, anime.image)}
                onClick={(id) => setLocation(`/anime/${id}`)}
              />
            ))}
          </div>
        </section>

        {/* Recently Updated */}
        <section>
          <div className="flex items-center justify-between mb-6 mt-12">
            <h2 className="text-headline-l text-[var(--color-primary)]">Recently Updated</h2>
            <button className="text-[14px] font-semibold text-white/50 hover:text-white transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-full">
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-[12px] shimmer" />
              ))
            ) : homeData?.latest_episodes.slice(0, 12).map((anime, i) => (
              <AnimeCard 
                key={anime.anime_id} 
                id={anime.anime_id}
                title={anime.title}
                imageUrl={anime.image}
                score={undefined}
                sub={anime.sub || undefined}
                dub={anime.dub || undefined}
                episodes={anime.episodes ? parseInt(anime.episodes) : undefined}
                type={anime.type}
                index={i}
                isFavorite={favorites[anime.anime_id]}
                onToggleFavorite={() => toggleFavorite(anime.anime_id, anime.title, anime.image)}
                onClick={(id) => setLocation(`/anime/${id}`)}
              />
            ))}
          </div>
        </section>

        {/* GitHub Link */}
        <div className="flex justify-center py-8">
          <a href="https://github.com/beyondbday69/SakuraFlix" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-[var(--color-primary)]/50 rounded-full transition-all group">
              <Github className="w-4 h-4 text-white/40 group-hover:text-[var(--color-primary)] transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">SakuraFlix</span>
          </a>
        </div>
      </div>
      <Footer />
    </main>
  </PageTransition>
);
}
