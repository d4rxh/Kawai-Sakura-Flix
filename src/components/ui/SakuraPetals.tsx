import React, { useEffect, useState } from 'react';

export function SakuraPetals() {
  const [petals, setPetals] = useState<{ id: number; left: string; size: string; duration: string; delay: string }[]>([]);

  useEffect(() => {
    const petalCount = 20;
    const newPetals = Array.from({ length: petalCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 10 + 10}px`,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `${Math.random() * 10}s`,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="sakura-petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animation: `fall ${petal.duration} linear infinite`,
            animationDelay: petal.delay,
          }}
        />
      ))}
    </div>
  );
}
