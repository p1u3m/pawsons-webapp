import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { characters, getCharacter, houseBackground } from "@/lib/data";
import { getAllContents } from "@/lib/supabase/contents";
import ContentsGrid from "@/components/contents-grid";

export const metadata = { title: "Little Stories · Pawsons" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ character?: string }>;
}) {
  const { character } = await searchParams;
  const selected = character ? getCharacter(character) : undefined;
  const contentRows = await getAllContents();

  return (
    <div className="wrap page-space">
      {/* ── INTRO ── */}
      <div className="contents-intro">
        <div className="contents-intro-left">
          {selected && (
            <Link className="back-link" href="/contents">
              <span aria-hidden="true">←</span>
              <span>ดูเรื่องราวของทุกคน</span>
            </Link>
          )}
          <h1 className="contents-headline">
            {selected ? `วันเล็ก ๆ ของ ${selected.name}` : "เรื่องธรรมดา"}
          </h1>
          {!selected && (
            <p className="contents-sub">
              ที่ไม่ธรรมดาสำหรับเรา — บางเรื่องทำให้ยิ้ม บางเรื่องทำให้รู้ว่าเราไม่ได้รู้สึกแบบนี้คนเดียว
            </p>
          )}
        </div>
        <div className="contents-intro-right">
          <span className="contents-count-pill">16 เรื่อง</span>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="content-tabs">
        <span className="filter active">16 Situations</span>
        {["Dukdik", "Franchise Rosters", "Pair Conflicts"].map((t) => (
          <span key={t} className="pending-tab">
            {t}
            <small>เร็ว ๆ นี้</small>
          </span>
        ))}
      </div>

      {/* ── GRID (client for GSAP scroll reveal) ── */}
      <ContentsGrid
        characters={characters}
        contentRows={contentRows}
        selected={selected ?? null}
      />
    </div>
  );
}
