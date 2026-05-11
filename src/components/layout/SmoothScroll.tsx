import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useLocation } from "wouter";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isTablet = !/iPhone|iPod/.test(navigator.userAgent) &&
      /Android/i.test(navigator.userAgent) &&
      window.innerWidth >= 600

    const isPhone = /iPhone|iPod|Android/i.test(navigator.userAgent) &&
      window.innerWidth < 600

    const lenis = new Lenis({
      // Tablets feel best with slightly longer duration than phones
      duration: isTablet ? 1.2 : isPhone ? 1.0 : 1.4,

      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),

      orientation: 'vertical',
      gestureOrientation: 'vertical',

      // @ts-ignore
      smoothWheel: true,

      // Android tablets: heavier = needs more multiplier
      wheelMultiplier: isTablet ? 1.2 : isPhone ? 1 : 0.8,

      // Touch tuned for tablet finger gestures (wider swipes)
      touchMultiplier: isTablet ? 1.8 : isPhone ? 1.5 : 2,

      infinite: false,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return <>{children}</>;
}
