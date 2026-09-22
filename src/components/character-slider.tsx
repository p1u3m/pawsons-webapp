"use client";

import { useRef, useState, useEffect } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
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
      left: (el.children[index] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft,
      behavior: "smooth",
    });
    setCurrentPage(index);
  };

  return (
    <div className="character-slider-container">
      <div
        id="character-pages"
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

      <div className="slider-controls" aria-label="เลื่อนดูตัวละคร">
        <button type="button" className="slider-btn" onClick={() => goToPage(0)} disabled={currentPage === 0} aria-controls="character-pages" aria-label="ก่อนหน้า">
          <CaretLeftIcon size={18} weight="bold" aria-hidden="true" />
        </button>
        <div className="slider-dots">
          {pages.map((_, index) => (
            <button key={index} type="button" className={`slider-dot ${currentPage === index ? "active" : ""}`} onClick={() => goToPage(index)} aria-label={`ไปหน้าที่ ${index + 1}`} aria-current={currentPage === index ? "page" : undefined} aria-controls="character-pages" />
          ))}
        </div>
        <button type="button" className="slider-btn" onClick={() => goToPage(1)} disabled={currentPage === 1} aria-controls="character-pages" aria-label="ถัดไป">
          <CaretRightIcon size={18} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
