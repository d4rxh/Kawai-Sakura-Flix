import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { AnimeCard } from "@/src/components/ui/AnimeCard";
import { fetchHomeData, HomeResponse } from "@/src/services/api";
import { auth, db, loginWithGoogle } from "@/src/lib/firebase";
import { doc, onSnapshot, setDoc, deleteDoc, collection } from "firebase/firestore";

export function Dubbed() {
  const [_, setLocation] = useLocation();

  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setFavorites({});
      return;
    }
    const unsub = onSnapshot(collection(db, "users", user.uid, "favorites"), (snapshot) => {
      const favs: Record<string, boolean> = {};
      snapshot.forEach(doc => {
        favs[doc.id] = true;
      });
      setFavorites(favs);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchHomeData();
        setHomeData(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch dubbed anime.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleFavorite = async (id: string, title: string, imageUrl: string) => {
    if (!user) {
      await loginWithGoogle();
      return;
    }
    const docRef = doc(db, "users", user.uid, "favorites", id);
    if (favorites[id]) {
      await deleteDoc(docRef);
      setFavorites(prev => ({ ...prev, [id]: false }));
    } else {
      await setDoc(docRef, {
        userId: user.uid,
        animeId: id,
        title,
        posterUrl: imageUrl,
        addedAt: Date.now()
      });
      setFavorites(prev => ({ ...prev, [id]: true }));
    }
  };

  const dubbedItems = [
    ...(homeData?.data["just_in:_cartoon_series_view_more"] || []),
    ...(homeData?.data.fresh_cartoon_films_view_more || [])
  ];

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 pt-0">
        <Header />
        
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 mt-[100px]">
          <div className="mb-10 p-8 layer-2 border border-white/10 rounded-[20px] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent pointer-events-none" />
            <h1 className="text-display text-[var(--color-primary)] mb-2 relative z-10">Dubbed Anime</h1>
            <p className="text-xl font-medium text-white/60 relative z-10">
              Watch your favorite anime with English dubs.
            </p>
          </div>

          {isLoading ? (
            <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10 mt-10 no-scrollbar">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="min-w-[280px] md:min-w-0 aspect-[2/3] rounded-[16px] shimmer" />
              ))}
            </div>
          ) : error ? (
            <div className="w-full h-[40vh] flex items-center justify-center flex-col gap-4">
                 <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center flex-col text-5xl text-[#ff3333] mb-4 rounded-full">
                  !
                </div>
              <h2 className="text-headline-l text-center text-white">{error}</h2>
            </div>
          ) : dubbedItems.length === 0 ? (
            <div className="w-full h-[40vh] flex items-center justify-center flex-col gap-4">
               <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center flex-col text-4xl text-white/50 mb-4 rounded-full">
                 🎬
               </div>
              <h2 className="text-headline-l text-center text-white">No dubbed anime found</h2>
            </div>
          ) : (
            <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10 no-scrollbar" data-lenis-prevent>
              {dubbedItems.map((anime, i) => (
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
          )}
        </div>
        <Footer />
      </main>
    </PageTransition>
  );
}
