import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PageTransition } from "@/src/components/layout/PageTransition";
import { AnimeCard } from "@/src/components/ui/AnimeCard";
import { fetchSearchData, AnimeSaltItem } from "@/src/services/api";
import { auth, db, loginWithGoogle } from "@/src/lib/firebase";
import { doc, onSnapshot, setDoc, deleteDoc, collection } from "firebase/firestore";

export function Search() {
  const [match, params] = useRoute("/search/:query");
  const query = params && 'query' in params ? decodeURIComponent((params as any).query) : "";
  const [_, setLocation] = useLocation();

  const [results, setResults] = useState<AnimeSaltItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    if (!query) return;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSearchData(query);
        setResults(data.results || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch search results.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [query]);

  // Handle fav tracking via polling or manual fetch in real app, here we just stub toggle
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

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 pt-0">
        <Header />
        
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          <div className="mb-10 p-8 layer-2 border border-white/10 rounded-[20px] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent pointer-events-none" />
            <h1 className="text-display text-white mb-2 relative z-10">Search Results</h1>
            <p className="text-xl font-medium text-white/60 relative z-10">
              For: <span className="text-[var(--color-primary)]">"{query}"</span>
            </p>
          </div>

          {isLoading ? (
            <div className="w-full h-[40vh]" />
          ) : error ? (
            <div className="w-full h-[40vh] flex items-center justify-center flex-col gap-4">
                 <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center flex-col text-5xl text-[#ff3333] mb-4 rounded-full">
                  !
                </div>
              <h2 className="text-headline-l text-center text-white">{error}</h2>
            </div>
          ) : results.length === 0 ? (
            <div className="w-full h-[40vh] flex items-center justify-center flex-col gap-4">
               <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center flex-col text-4xl text-white/50 mb-4 rounded-full">
                 🔍
               </div>
              <h2 className="text-headline-l text-center text-white">No results found</h2>
              <p className="text-body-m font-medium text-white/50">Try searching for something else</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {results.map((anime, i) => (
                <AnimeCard 
                  key={anime.slug} 
                  id={anime.slug}
                  title={anime.title}
                  imageUrl={anime.image}
                  index={i}
                  isFavorite={favorites[anime.slug]}
                  onToggleFavorite={() => toggleFavorite(anime.slug, anime.title, anime.image)}
                  onClick={(id) => setLocation(`/anime/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
        <Footer />
      </main>
    </PageTransition>
  );
}
