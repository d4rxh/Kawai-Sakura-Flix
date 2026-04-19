import React, { useMemo } from 'react';
import './SakuraPetals.css';

export const SakuraPetals: React.FC = () => {
  // Memoize petals to prevent recalculation on re-renders,
  // limit count to 25 for smoother performance (especially on mobile)
  const petals = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 4 + 5}s`,
      animationDelay: `${Math.random() * 5}s`,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="sakura-petal"
          style={{
            left: petal.left,
            animationDuration: petal.animationDuration,
            animationDelay: petal.animationDelay,
          }}
        />
      ))}
    </div>
  );
};
