"use client";

import { useState, useEffect } from "react";
import type { Character } from "@/lib/data";
import { CharacterImage } from "./ui";

export function SlotReel({ characters }: { characters: Character[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % characters.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [paused, characters.length]);

  const char = characters[index];

  return (
    <>
      {/* SVG filter for organic torn-paper sticker stroke */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="torn-paper-edge" x="-30%" y="-30%" width="160%" height="160%">
            {/* 1. Expand the character silhouette for paper border thickness */}
            <feMorphology in="SourceAlpha" operator="dilate" radius="8" result="dilated" />

            {/* 2. Fractal noise for realistic fibrous torn paper teeth (lightweight 2 octaves) */}
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" result="noise" />

            {/* 3. Displace border into jagged, organic torn edges */}
            <feDisplacementMap in="dilated" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" result="tornEdge" />

            {/* 4. Fill torn border with warm tactile paper white */}
            <feFlood floodColor="#FFFDF9" result="paperWhite" />
            <feComposite in="paperWhite" in2="tornEdge" operator="in" result="tornBorder" />

            {/* 5. Soft realistic drop shadow under the torn paper cutout */}
            <feGaussianBlur in="tornEdge" stdDeviation="6" result="blurShadow" />
            <feOffset in="blurShadow" dx="0" dy="8" result="offsetShadow" />
            <feFlood floodColor="rgba(24, 24, 24, 0.12)" result="shadowColor" />
            <feComposite in="shadowColor" in2="offsetShadow" operator="in" result="dropShadow" />

            {/* 6. Composite: Shadow -> Torn Paper Border -> Original Character */}
            <feMerge>
              <feMergeNode in="dropShadow" />
              <feMergeNode in="tornBorder" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div
        className="slot-container"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-label="Character slot reel"
      >
        <div className="slot-char" key={char.type}>
          <CharacterImage character={char} priority />
        </div>
      </div>
    </>
  );
}
