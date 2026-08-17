"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    function calcular() {
      const scrollTop = window.scrollY;
      const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
      setProgresso(alturaTotal > 0 ? Math.min(100, (scrollTop / alturaTotal) * 100) : 0);
    }
    calcular();
    window.addEventListener("scroll", calcular, { passive: true });
    window.addEventListener("resize", calcular);
    return () => {
      window.removeEventListener("scroll", calcular);
      window.removeEventListener("resize", calcular);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-alert transition-[width] duration-150 ease-out"
        style={{ width: `${progresso}%` }}
      />
    </div>
  );
}
