"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Character } from "@/lib/data";

const SLOTS = 4;
const HOLD = 2.8;

const chibiSrc = (c: Character) => `/characters/reference/chibis/${c.type}.webp`;

/**
 * Four chibis in a row, one per house. Each round every slot swaps to the
 * next member of its house, so four rounds cycle through all 16 characters.
 */
export function HeroChibis({ characters }: { characters: Character[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState(0);
  const rounds = Math.ceil(characters.length / SLOTS);
  const pick = (r: number, slot: number) =>
    characters[(slot * rounds + (r % rounds)) % characters.length];

  // Preload the next round so the swap never shows an empty slot.
  useEffect(() => {
    for (let s = 0; s < SLOTS; s++) {
      const img = new window.Image();
      img.src = chibiSrc(pick(round + 1, s));
    }
  }, [round]);

  // Layout effect: the new images get their hidden start state before paint.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const chars = root.querySelectorAll<HTMLElement>(".hero-chibi-img");
    const media = gsap.matchMedia();
    let tl: gsap.core.Timeline | undefined;

    media.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const reduced = ctx.conditions?.reduced;
        const next = () => setRound((r) => r + 1);

        tl = gsap.timeline({ delay: reduced ? HOLD * 1.5 : HOLD, onComplete: next });
        if (reduced) {
          gsap.set(chars, { opacity: 1 });
          tl.to(chars, { opacity: 0, duration: 0.4 });
          return;
        }

        // Enter: pop up from below with a little squash, left to right.
        gsap.fromTo(
          chars,
          { yPercent: 40, scaleX: 1.15, scaleY: 0.6, opacity: 0 },
          {
            yPercent: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            duration: 0.7,
            ease: "back.out(2.2)",
            stagger: 0.09,
          },
        );
        // Exit: hop and drop out of view, same order.
        tl.to(chars, {
          keyframes: [
            { yPercent: -10, scaleY: 1.08, scaleX: 0.94, duration: 0.18, ease: "power2.out" },
            { yPercent: 45, scaleY: 0.6, scaleX: 1.1, opacity: 0, duration: 0.3, ease: "power2.in" },
          ],
          stagger: 0.08,
        });
      },
    );

    const pause = () => tl?.pause();
    const resume = () => tl?.resume();
    root.addEventListener("mouseenter", pause);
    root.addEventListener("mouseleave", resume);
    return () => {
      root.removeEventListener("mouseenter", pause);
      root.removeEventListener("mouseleave", resume);
      media.revert();
    };
  }, [round]);

  const shown = Array.from({ length: SLOTS }, (_, s) => pick(round, s));

  return (
    <div
      ref={rootRef}
      className="hero-chibis"
      role="img"
      aria-label={`Pawsons: ${shown.map((c) => c.name).join(", ")}`}
    >
      {shown.map((c, s) => (
        <div className="hero-chibi" data-slot={s} key={s}>
          <img
            className="hero-chibi-img"
            src={chibiSrc(c)}
            alt=""
            width={500}
            height={500}
            decoding="async"
            fetchPriority={round === 0 ? "high" : "auto"}
          />
        </div>
      ))}
    </div>
  );
}
