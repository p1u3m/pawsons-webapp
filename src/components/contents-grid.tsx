"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { houseBackground } from "@/lib/data";
import type { Character } from "@/lib/data";
import type { ContentRow } from "@/lib/supabase/contents";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  characters: readonly Character[];
  contentRows: ContentRow[];
  selected: Character | null;
};

export default function ContentsGrid({ characters, contentRows, selected }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".sit-card", el);
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            delay: (i % 4) * 0.07,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              once: true,
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div className="sit-grid" ref={gridRef}>
      {characters.map((char, i) => {
        const c = selected || char;
        const row = contentRows.find((r) => r.id === i + 1);
        const title = row?.situation_title ?? `สถานการณ์ที่ ${i + 1}`;
        const isFeatured = i === 0 && !selected;
        const href = `/contents/${i + 1}${selected ? `?character=${selected.type}` : ""}`;

        return (
          <Link
            key={i + 1}
            href={href}
            className={`sit-card ${isFeatured ? "sit-card-featured" : ""}`}
          >
            <div
              className="sit-art"
              style={{ background: houseBackground(c.house) }}
            >
              {row?.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.cover_image_url}
                  alt={title}
                  className="sit-cover-img"
                />
              ) : (
                <Image
                  src={c.image}
                  alt={`${c.name} · ${c.type}`}
                  width={isFeatured ? 320 : 220}
                  height={isFeatured ? 320 : 220}
                  className="sit-char-img"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              )}
            </div>
            <div className="sit-body">
              <span className="sit-meta">
                {c.name} · {c.type}
              </span>
              <h2 className="sit-title">{title}</h2>
              <span className="sit-read">
                อ่านเรื่องนี้
                <span aria-hidden="true" className="sit-arrow">↗</span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
