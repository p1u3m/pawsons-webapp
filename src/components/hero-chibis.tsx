"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Character } from "@/lib/data";
import { cn } from "@/lib/utils";

const SLOTS = 4;
const HOLD = 2.8;

const chibiSrc = (c: Character) =>
  `/characters/reference/chibis/${c.type}.webp`;

/**
 * Four chibis in a row, one per house. Each round every slot swaps to the
 * next member of its house, so four rounds cycle through all 16 characters.
 */
export function HeroChibis({
  characters,
  className,
}: {
  characters: Character[];
  className?: string;
}) {
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
    const chars = root.querySelectorAll<HTMLElement>("[data-chibi]");
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

        if (reduced) {
          gsap.set(chars, { opacity: 1 });
          return;
        }
        tl = gsap.timeline({ delay: HOLD, onComplete: next });

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
            {
              yPercent: -10,
              scaleY: 1.08,
              scaleX: 0.94,
              duration: 0.18,
              ease: "power2.out",
            },
            {
              yPercent: 45,
              scaleY: 0.6,
              scaleX: 1.1,
              opacity: 0,
              duration: 0.3,
              ease: "power2.in",
            },
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
    // A soft paper glow behind the group and a ground shadow under it.
    <div
      ref={rootRef}
      className={cn(
        "relative mb-[30px] flex w-[min(560px,100%)] items-end justify-center pt-6 before:pointer-events-none before:absolute before:bottom-[16%] before:left-1/2 before:z-0 before:aspect-square before:w-[44%] before:-translate-x-1/2 before:rounded-full before:bg-[radial-gradient(circle_at_50%_45%,#fdfcf8_0_58%,rgb(253_252_248/0)_71%)] before:content-[''] after:pointer-events-none after:absolute after:bottom-[11%] after:left-1/2 after:z-0 after:h-[12%] after:w-[78%] after:-translate-x-1/2 after:rounded-full after:bg-[radial-gradient(closest-side,rgb(24_24_24/0.1),rgb(24_24_24/0))] after:content-[''] max-md:mb-[18px] max-xs:mb-4 md:w-[min(728px,100%)]",
        className,
      )}
      role="img"
      aria-label={`Pawsons: ${shown.map((c) => c.name).join(", ")}`}
    >
      {shown.map((c, s) => (
        // The middle two stand in front and a little larger.
        <div
          key={s}
          className={cn(
            "relative -mx-[8%] flex-none",
            s === 1 ? "z-3 w-[41%]" : s === 2 ? "z-2 w-[41%]" : "z-1 w-[33%]",
          )}
        >
          <img
            data-chibi
            className="block h-auto w-full origin-bottom will-change-[transform,opacity]"
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
