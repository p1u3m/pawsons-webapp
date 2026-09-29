"use client";
import { useState } from "react";
import { characters, houses } from "@/lib/data";
import { CharacterCard } from "./character-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CharacterDirectory() {
  const [house, setHouse] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = characters.filter(
    (c) =>
      (house === "all" || c.house.id === house) &&
      `${c.name} ${c.type} ${c.tagline}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" aria-label="กรองตามบ้าน">
          <Button
            variant="unstyled"
            size="auto"
            className={house === "all" ? "filter active" : "filter"}
            aria-pressed={house === "all"}
            onClick={() => setHouse("all")}
          >
            เพื่อนทั้งหมด
          </Button>
          {houses.map((h) => (
            <Button
              variant="unstyled"
              size="auto"
              key={h.id}
              className={house === h.id ? "filter active" : "filter"}
              aria-pressed={house === h.id}
              onClick={() => setHouse(h.id)}
            >
              {h.name}
            </Button>
          ))}
        </div>
        <label className="search-label">
          <span className="sr-only">ค้นหาชื่อหรือบุคลิก</span>
          <Input
            className="h-auto"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อ หรือ MBTI…"
          />
        </label>
      </div>

      <p className="result-count" aria-live="polite">
        พบเพื่อน {filtered.length} ตัว
      </p>

      <div className="character-grid">
        {filtered.map((c) => (
          <CharacterCard key={c.type} character={c} />
        ))}
      </div>

      {!filtered.length && (
        <div className="empty-state">
          <h2>ยังไม่เจอเพื่อนที่ตามหา</h2>
          <p>ลองใช้ชื่อหรือบุคลิกอื่น หรือกลับมาดูเพื่อนทั้งหมด</p>
          <Button
            variant="unstyled"
            size="auto"
            className="button"
            onClick={() => {
              setHouse("all");
              setQuery("");
            }}
          >
            <span>ดูเพื่อนทั้งหมด</span>
            <span className="icon-disc" aria-hidden="true">
              ↺
            </span>
          </Button>
        </div>
      )}
    </>
  );
}
