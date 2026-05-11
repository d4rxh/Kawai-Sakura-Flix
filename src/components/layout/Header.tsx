import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { User, LogOut, Search, Play, Menu, X } from "lucide-react";
import { auth, loginWithGoogle, logout } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

export function Header() {
  const [user, setUser] = useState(auth.currentUser);
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (location.includes('/dubbed')) {
        setLocation(`/dubbed/search/${encodeURIComponent(searchQuery.trim())}`);
      } else {
        setLocation(`/search/${encodeURIComponent(searchQuery.trim())}`);
      }
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tv", label: "TV Series" },
    { href: "/dubbed", label: "Dubbed" },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center transition-all duration-300 px-4 md:px-6 lg:px-10 h-[72px]",
          isMenuOpen ? "bg-[#201F31] border-b border-[#333333]" : "bg-transparent border-transparent"
        )}
      >
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="flex items-center gap-2 group cursor-pointer flex-shrink-0" onClick={() => setIsMenuOpen(false)}>
              <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-[var(--color-primary)]/30 group-hover:scale-110 transition-transform" />
              <div className="text-[20px] md:text-[24px] font-bold tracking-tighter text-white">
                Sakura<span className="text-[var(--color-primary)]">Flix</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8 text-[14px] font-bold tracking-tight text-white/50">
              {navLinks.map((link) => (
                <Link 
                   key={link.href} 
                   href={link.href}
                   className={cn(
                     "transition-colors duration-300 cursor-pointer py-2 hover:text-[var(--color-primary)]",
                     location === link.href ? "text-[var(--color-primary)] opacity-100" : ""
                   )}
                >
                   {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <form onSubmit={handleSearch} className="relative flex items-center group">
              <div className="absolute left-4 text-white/40 group-focus-within:text-[var(--color-primary)] transition-colors duration-300">
                <Search size={18} strokeWidth={2.5} />
              </div>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#121212] border border-white/10 rounded-full pl-11 pr-4 md:pr-12 py-2 text-[13px] md:text-[14px] font-medium text-white outline-none ring-offset-0 focus:ring-4 focus:ring-[var(--color-primary)]/10 focus:border-[var(--color-primary)] w-[120px] xs:w-[160px] sm:w-[220px] lg:w-[350px] transition-all duration-300 placeholder:text-white/20"
              />
              <div className="absolute right-4 hidden lg:flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/30 group-focus-within:opacity-0 transition-opacity pointer-events-none">
                <span className="text-[12px]">⌘</span>K
              </div>
            </form>
            
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#333333]">
                    <img src={user.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.uid}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : (
                <button onClick={loginWithGoogle} className="bg-[var(--color-primary)] text-black rounded-[20px] px-4 py-[8px] text-[13px] font-semibold hover:opacity-90 transition-opacity">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-x-0 top-[72px] z-40 bg-[#201F31] border-b border-[#333333] p-6 md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4 text-[16px] font-bold text-white/50">
              {/* Mobile Mobile Search - Duplicate for visibility */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Search for anime..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-[12px] pl-12 pr-4 py-3 text-white outline-none focus:border-[var(--color-primary)]"
                />
              </form>
              
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)} 
                  className={cn(
                    "py-2 transition-colors",
                    location === link.href ? "text-[var(--color-primary)]" : "hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-[#333333] flex flex-col gap-4">
                 {user ? (
                    <button onClick={() => {logout(); setIsMenuOpen(false);}} className="text-left py-2 text-[#ff3333]">Logout</button>
                 ) : (
                    <button onClick={() => {loginWithGoogle(); setIsMenuOpen(false);}} className="text-left py-2 text-[var(--color-primary)]">Sign In</button>
                 )}
                 <p className="text-[12px] text-white/40 mt-4 px-2 italic">
                   Note: Mobile UI is currently undergoing optimization for a better experience. Apologies for any inconvenience.
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
