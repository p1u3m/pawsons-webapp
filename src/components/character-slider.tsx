"use client";

import { useRef, useState, useEffect } from "react";
import type { Character } from "@/lib/data";
import { CharacterCard } from "@/components/ui";

export function CharacterSlider({ characters }: { characters: Character[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const page1 = characters.slice(0, 8);
  const page2 = characters.slice(8, 16);
  const pages = [page1, page2];

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const pageIndex = Math.round(el.scrollLeft / el.clientWidth);
    if (pageIndex !== currentPage && (pageIndex === 0 || pageIndex === 1)) {
      setCurrentPage(pageIndex);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [currentPage]);

  const goToPage = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: "smooth",
    });
    setCurrentPage(index);
  };

  return (
    <div className="character-slider-container">
      <div className="slider-controls" aria-label="เลื่อนดูตัวละคร">
        <div className="slider-nav-buttons">
          <button
            type="button"
            className="slider-btn"
            onClick={() => goToPage(0)}
            disabled={currentPage === 0}
            aria-label="ดูตัวละคร 1-8"
          >
            ←
          </button>
          <button
            type="button"
            className="slider-btn"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            aria-label="ดูตัวละคร 9-16"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="character-slider-track eight-view"
        tabIndex={0}
        role="region"
        aria-label="รายการเพื่อนทั้ง 16 ตัว แบ่งกลุ่มละ 8 ตัว"
      >
        {pages.map((group, pageIdx) => (
          <div key={pageIdx} className="slider-eight-page">
            {group.map((c) => (
              <CharacterCard key={c.type} character={c} />
            ))}
          </div>
        ))}
      </div>

      <div className="slider-dots" aria-hidden="true">
        {pages.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`slider-dot ${currentPage === idx ? "active" : ""}`}
            onClick={() => goToPage(idx)}
            aria-label={`ไปที่กลุ่มที่ ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
