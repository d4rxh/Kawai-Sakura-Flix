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
      } catch (err: any) {
        setError(err.message || "Failed to load anime content. Please try again.");
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

  const heroItems: HeroAnime[] = homeData?.data.fresh_drops.slice(0, 5).map(item => ({
    id: item.slug,
    title: item.title,
    description: "",
    bannerUrl: item.image,
    genres: ["Anime"]
  })) || [];

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 pt-0">
        <Header />
        
        {isLoading ? (
          <div className="w-full h-[85vh] min-h-[600px] bg-transparent" />
        ) : error ? (
          <div className="w-full h-[85vh] min-h-[600px] flex items-center justify-center flex-col gap-4 bg-transparent">
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
        
        {/* Trending Section (On-Air Series) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-headline-l text-[var(--color-primary)]">Trending Now</h2>
            <button className="text-[14px] font-semibold text-white/50 hover:text-white transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-full">
              View All
            </button>
          </div>
          
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10 pb-6 no-scrollbar" data-lenis-prevent>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-[280px] md:min-w-0 aspect-[2/3] rounded-[16px] shimmer" />
              ))
            ) : homeData?.data["on-air_series_view_more"]?.slice(0, 12).map((anime, i) => (
              <div key={anime.slug} className="min-w-[280px] md:min-w-0">
                <AnimeCard 
                  id={anime.slug}
                  title={anime.title}
                  imageUrl={anime.image}
                  index={i}
                  rank={i + 1}
                  isFavorite={favorites[anime.slug]}
                  onToggleFavorite={() => toggleFavorite(anime.slug, anime.title, anime.image)}
                  onClick={(id) => setLocation(`/anime/${id}`)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Recently Updated (New Arrivals) */}
        <section>
          <div className="flex items-center justify-between mb-6 mt-12">
            <h2 className="text-headline-l text-[var(--color-primary)]">Recently Updated</h2>
            <button className="text-[14px] font-semibold text-white/50 hover:text-white transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-full">
              View All
            </button>
          </div>
          
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10 pb-6 no-scrollbar" data-lenis-prevent>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-[280px] md:min-w-0 aspect-[2/3] rounded-[16px] shimmer" />
              ))
            ) : homeData?.data.new_anime_arrivals_view_more?.slice(0, 12).map((anime, i) => (
              <div key={anime.slug} className="min-w-[280px] md:min-w-0">
                <AnimeCard 
                  id={anime.slug}
                  title={anime.title}
                  imageUrl={anime.image}
                  index={i}
                  isFavorite={favorites[anime.slug]}
                  onToggleFavorite={() => toggleFavorite(anime.slug, anime.title, anime.image)}
                  onClick={(id) => setLocation(`/anime/${id}`)}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  </PageTransition>
);
}