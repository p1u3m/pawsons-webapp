"use client";
import { useState } from "react";
import { characters, houses } from "@/lib/data";
import { CharacterCard } from "./ui";
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
      <div className="directory-tools">
        <div className="filter-row" aria-label="กรองตามบ้าน">
          <button
            className={house === "all" ? "filter active" : "filter"}
            aria-pressed={house === "all"}
            onClick={() => setHouse("all")}
          >
            เพื่อนทั้งหมด
          </button>
          {houses.map((h) => (
            <button
              key={h.id}
              className={house === h.id ? "filter active" : "filter"}
              aria-pressed={house === h.id}
              onClick={() => setHouse(h.id)}
            >
              {h.name}
            </button>
          ))}
        </div>
        <label className="search-label">
          <span className="sr-only">ค้นหาชื่อหรือบุคลิก</span>
          <input
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
          <button
            className="button"
            onClick={() => {
              setHouse("all");
              setQuery("");
            }}
          >
            ดูเพื่อนทั้งหมด
          </button>
        </div>
      )}
    </>
  );
}
