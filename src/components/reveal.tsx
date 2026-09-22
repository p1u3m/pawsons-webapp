"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
gsap.registerPlugin(ScrollTrigger);
export default function Reveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.from(".hero-copy > *", {
          y: 18,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "all",
        });
        gsap.from(".hero-friend", {
          y: 28,
          opacity: 0,
          rotation: 3,
          stagger: 0.12,
          duration: 1,
          ease: "power2.out",
          clearProps: "all",
        });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
          gsap.from(el, {
            y: 20,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          }),
        );
      },
      root,
    );
    return () => media.revert();
  }, [path]);
  return <div ref={root}>{children}</div>;
}
