"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Even, unhurried deceleration: things drift in and settle, never snap.
const EASE = "power3.out";

/**
 * /houses scroll arrivals. Each band plays once as it comes into view:
 * the crest comes into focus while its paper blob unfolds, the copy
 * rises line by line, then the members step in. Content stays visible
 * without JS; bands already on screen at mount are left alone so
 * nothing flashes out and back in.
 */
export default function HousesMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    const bands = () =>
      gsap.utils
        .toArray<HTMLElement>(".chars-band", el)
        .filter((band) => !ScrollTrigger.isInViewport(band, 0.2));

    mm.add(
      {
        full: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { full } = context.conditions as { full: boolean };

        bands().forEach((band) => {
          const crest = band.querySelector<HTMLElement>(".houses-crest");
          const copy = gsap.utils.toArray<HTMLElement>(
            ".houses-copy > :not(.houses-members)",
            band,
          );
          const members = gsap.utils.toArray<HTMLElement>(
            ".houses-members li",
            band,
          );
          const flipped = !!band.querySelector(".houses-row--flip");

          const tl = gsap.timeline({
            defaults: { ease: EASE },
            scrollTrigger: { trigger: band, start: "top 78%", once: true },
          });

          if (!full) {
            // Reduced motion: no travel, no blur. A quiet fade in order.
            tl.from([crest, ...copy, ...members], {
              opacity: 0,
              duration: 0.6,
              stagger: 0.04,
              ease: "power1.out",
              clearProps: "opacity",
            });
            return;
          }

          if (crest) {
            tl.from(
              crest,
              {
                opacity: 0,
                x: flipped ? 18 : -18,
                y: -10,
                filter: "blur(10px)",
                "--blob-scale": 0.82,
                "--blob-opacity": 0,
                duration: 1.6,
                clearProps: "opacity,transform,filter,--blob-scale,--blob-opacity",
              },
              0,
            );
          }

          tl.from(
            copy,
            {
              opacity: 0,
              y: 16,
              duration: 1.2,
              stagger: 0.09,
              clearProps: "opacity,transform",
            },
            0.25,
          ).from(
            members,
            {
              opacity: 0,
              y: 10,
              scale: 0.92,
              duration: 1,
              stagger: 0.05,
              clearProps: "opacity,transform",
            },
            0.6,
          );
        });
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className="houses">
      {children}
    </div>
  );
}
