import { PageTransition } from "@/src/components/layout/PageTransition";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { ChevronRight, Code2, Globe, Cpu, ShieldCheck, Github } from "lucide-react";

export function ApiInfo() {
  return (
    <PageTransition>
      <main className="min-h-screen pt-[72px] pb-0 bg-transparent">
        <Header />
        
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden border-b border-[#333333]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-transparent" />
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
                    href="https://github.com/beyondbday69/SakuraFlix" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-full border border-white/10 transition-all w-fit group"
                  >                    <Github className="group-hover:text-[var(--color-primary)] transition-colors" size={20} />
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
        
        <Footer />
      </main>
    </PageTransition>
  );
}
