"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Staggered scroll reveal for server-rendered product cards. */
export function ProductGrid({ children }: { children: ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".store-card", el).forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            delay: (i % 4) * 0.06,
            scrollTrigger: { trigger: card, start: "top 92%", once: true },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div className="store-grid" ref={gridRef}>
      {children}
    </div>
  );
}
