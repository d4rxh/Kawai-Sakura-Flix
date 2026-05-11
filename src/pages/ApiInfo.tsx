import { PageTransition } from "@/src/components/layout/PageTransition";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { ChevronRight, Code2, Globe, Cpu, ShieldCheck, Github } from "lucide-react";

export function ApiInfo() {
  return (
    <PageTransition>
      <main className="min-h-screen pt-[72px] pb-0 bg-[#201F31]">
        <Header />
        
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden border-b border-[#333333]">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
            <h1 className="text-display tracking-tighter text-white mb-6">
              API & <span className="text-[var(--color-primary)]">Architecture</span>
            </h1>
            <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
              SakuraFlix is a technical demonstration of modern full-stack web development. 
              Built for educational purposes to showcase high-performance streaming UI.
            </p>
          </div>
        </section>

        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Tech Specs */}
            <div className="space-y-12">
              <div>
                <h2 className="text-headline-l text-white mb-8 flex items-center gap-3">
                  <Cpu className="text-[var(--color-primary)]" /> Core Infrastructure
                </h2>
                <div className="space-y-6">
                  <div className="layer-2 p-6 rounded-[20px] border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-2">AnimeScraper API</h3>
                    <p className="text-white/50 text-[14px]">
                      The application utilizes a distributed scraping architecture. It communicates with 
                      Vercel-hosted edge functions that parse third-party anime catalogs in real-time.
                    </p>
                  </div>
                  <div className="layer-2 p-6 rounded-[20px] border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-2">Megaplay Integration</h3>
                    <p className="text-white/50 text-[14px]">
                      Our streaming engine dynamically resolves video sources through specialized 
                      resolvers, ensuring broad compatibility and multi-source redundancy.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-headline-l text-white mb-8 flex items-center gap-3">
                  <Code2 className="text-[var(--color-primary)]" /> Open Source Philosophy
                </h2>
                <p className="text-white/50 leading-relaxed italic mb-8">
                  "This project was created strictly for educational purposes to explore 
                  Material Design 3 (Material You) and Apple macOS/iOS Human Interface Guidelines 
                  in a single-page application context."
                </p>
                <div className="flex flex-col gap-6">
                  <a 
                    href="https://github.com/beyondbday69/SakuraFlix.git" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-full border border-white/10 transition-all w-fit group"
                  >
                    <Github className="group-hover:text-[var(--color-primary)] transition-colors" size={20} />
                    <span className="font-bold text-[14px]">Explore Source on GitHub</span>
                  </a>
                  <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 rounded-full border border-white/10 text-[12px] font-bold uppercase tracking-wider text-white/40">React 18</div>
                    <div className="px-4 py-2 rounded-full border border-white/10 text-[12px] font-bold uppercase tracking-wider text-white/40">TypeScript</div>
                    <div className="px-4 py-2 rounded-full border border-white/10 text-[12px] font-bold uppercase tracking-wider text-white/40">Framer Motion</div>
                    <div className="px-4 py-2 rounded-full border border-white/10 text-[12px] font-bold uppercase tracking-wider text-white/40">Tailwind CSS</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12">
                <div className="layer-3 p-8 rounded-[28px] border border-[var(--color-primary)]/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck size={120} />
                </div>
                <h2 className="text-display text-[24px] text-white mb-6 relative z-10">Legal & Copyright</h2>
                <div className="space-y-4 relative z-10">
                  <p className="text-[14px] text-white/70 leading-relaxed">
                    SakuraFlix does not host any anime videos or files. All contents are curated 
                    from external sources found publicly on the web. We respect intelectual property.
                  </p>
                  <p className="text-[14px] text-white/70 leading-relaxed font-bold border-l-2 border-[var(--color-primary)] pl-4">
                    Copyrights and trademarks for the anime, and other promotional materials 
                    are held by their respective owners and their use is allowed under the 
                    fair use clause of the Copyright Law.
                  </p>
                  <div className="pt-6">
                    <p className="text-[13px] font-bold text-[var(--color-primary)]">
                       © {new Date().getFullYear()} SakuraFlix. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <h2 className="text-headline-l text-white mb-4">Educational Intent</h2>
                 <ul className="space-y-4">
                   {[
                     "Researching API rate-limiting and performance.",
                     "Implementing dynamic Material You color systems.",
                     "Exploring cross-platform UX consistency.",
                     "Experimenting with edge-computing scrapers."
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-4 text-white/50 text-[14px]">
                       <ChevronRight size={16} className="text-[var(--color-primary)]" />
                       {item}
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Full-Width AnimeSalt API Data Section */}
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20 border-t border-[#333333]">
          <h2 className="text-display text-[32px] md:text-[40px] text-white mb-6 flex items-center gap-4">
            <Globe className="text-[var(--color-primary)]" size={40} /> AnimeSalt API Data
          </h2>
          <p className="text-xl text-white/50 max-w-2xl leading-relaxed mb-12">
            API endpoints mapping, integration methodology, and data types corresponding to the AnimeSalt GraphQL / REST instances.
            <br/><br/>
            Base URL: <code className="text-[#FFBADE] bg-[#FFBADE]/10 px-3 py-1.5 rounded-lg text-sm font-bold ml-2">https://animesalt-api-lovat.vercel.app</code>
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Endpoint 1 */}
            <div className="layer-2 rounded-[24px] border border-white/5 overflow-hidden shadow-2xl">
              <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <span className="font-mono text-[14px] font-bold text-white">GET /api/home</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded">Discovery</span>
              </div>
              <div className="p-6 overflow-x-auto h-[350px] custom-scroller">
                <pre className="text-white/70 font-mono text-[13px] leading-relaxed">
{`{
  "success": true,
  "data": {
    "fresh_drops": [
      {
        "title": "Frieren: Beyond Journey's End",
        "url": "https://animesalt.ac/series/frieren-beyond-journeys-end/",
        "slug": "frieren-beyond-journeys-end",
        "image": "https://image.tmdb.org/t/p/w500/dqZENchTd7lp5zht7BdlqM7RBhD.jpg"
      }
    ],
    // Categories
    "on-air_series_view_more": [...],
    "new_anime_arrivals_view_more": [...],
    "just_in:_cartoon_series_view_more": [...],
    "fresh_anime_films_view_more": [...],
    "fresh_cartoon_films_view_more": [...]
  }
}`}
                </pre>
              </div>
            </div>

            {/* Endpoint 2 */}
            <div className="layer-2 rounded-[24px] border border-white/5 overflow-hidden shadow-2xl">
              <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <span className="font-mono text-[14px] font-bold text-white">GET /api/search?q=naruto</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded">Search</span>
              </div>
              <div className="p-6 overflow-x-auto h-[350px] custom-scroller">
                <pre className="text-white/70 font-mono text-[13px] leading-relaxed">
{`{
  "success": true,
  "query": "naruto",
  "results": [
    {
      "title": "Naruto",
      "url": "https://animesalt.ac/series/naruto/",
      "slug": "naruto",
      "image": "https://image.tmdb.org/t/p/w500/xppeysfvDKVx775MFuH8Z9BlpMk.jpg"
    }
  ]
}`}
                </pre>
              </div>
            </div>

            {/* Endpoint 3 */}
            <div className="layer-2 rounded-[24px] border border-white/5 overflow-hidden shadow-2xl">
              <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <span className="font-mono text-[14px] font-bold text-white">GET /api/anime/:slug</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 bg-blue-400/10 px-2 py-1 rounded">Details</span>
              </div>
              <div className="p-6 overflow-x-auto h-[350px] custom-scroller">
                <pre className="text-white/70 font-mono text-[13px] leading-relaxed">
{`{
  "success": true,
  "data": {
    "title": "Naruto",
    "description": "In another world, ninja are the ultimate power...",
    "genres": ["Action", "Adventure", "Fantasy"],
    "thumbnail": "https://image.tmdb.org/t/p/w342/xppeysfvDKVx775MFuH8Z9BlpMk.jpg",
    "is_movie": false,
    "episodes": [
      {
        "number": "1",
        "title": "Enter: Naruto Uzumaki!",
        "url": "https://animesalt.ac/episode/naruto-1x1/",
        "id": "naruto-1x1",
        "thumbnail": "...",
        "season": "1"
      }
    ],
    "movie_players": [] // For movies, contains streaming sources
  }
}`}
                </pre>
              </div>
            </div>

            {/* Endpoint 4 */}
            <div className="layer-2 rounded-[24px] border border-white/5 overflow-hidden shadow-2xl">
              <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <span className="font-mono text-[14px] font-bold text-white">GET /api/episode/:id</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 bg-purple-400/10 px-2 py-1 rounded">Playback</span>
              </div>
              <div className="p-6 overflow-x-auto h-[350px] custom-scroller">
                <pre className="text-white/70 font-mono text-[13px] leading-relaxed">
{`{
  "success": true,
  "data": {
    "video_player": "https://as-cdn21.top/video/36660e59856...",
    "m3u8_link": null,
    "source": "https://animesalt.ac/episode/naruto-1x1/",
    "next_episode_id": "naruto-1x2",
    "prev_episode_id": null
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </main>
    </PageTransition>
  );
}
