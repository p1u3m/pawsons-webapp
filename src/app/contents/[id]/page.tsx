import { houseBackground } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { characters, getCharacter, situations } from "@/lib/data";
import { BackLink, CharacterImage } from "@/components/ui";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ character?: string }>;
}) {
  const { id } = await params;
  const { character } = await searchParams;
  const index = Number(id) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= 16) notFound();
  const c = (character && getCharacter(character)) || characters[index];

  return (
    <article className="wrap page-space story-article">
      <BackLink
        href={character ? `/contents?character=${c.type}` : "/contents"}
      >
        กลับไปอ่านเรื่องอื่น
      </BackLink>
      <span className="eyebrow">16 SITUATIONS · {c.name}</span>
      <h1 style={{ marginTop: "14px" }}>{situations[index]}</h1>
      <div
        className="article-art"
        style={{ background: houseBackground(c.house) }}
      >
        <CharacterImage character={c} priority />
      </div>
      <p>
        สำหรับ {c.name} บางวันก็ไม่จำเป็นต้องมีอะไรพิเศษ
        แค่ได้หยุดฟังความรู้สึกของตัวเองสักนิด ก็เป็นการเริ่มต้นที่ดีแล้ว
      </p>
      <p>
        {c.description} วันนี้เลยอยากชวนคุณวางเรื่องที่ยังไม่ต้องรีบไว้ก่อน
        แล้วให้เวลากับสิ่งเล็ก ๆ ที่ทำให้สบายใจ
      </p>
      <blockquote>“ค่อย ๆ ไปก็ได้ เราอยู่ตรงนี้ด้วยกันนะ”</blockquote>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginTop: "28px" }}>
        <Link className="button" href={`/characters/${c.type.toLowerCase()}`}>
          <span>รู้จัก {c.name}</span>
          <span className="icon-disc" aria-hidden="true">↗</span>
        </Link>
        <Link
          className="text-link next-story"
          href={`/contents/${((index + 1) % 16) + 1}${character ? `?character=${c.type}` : ""}`}
        >
          <span>อ่านเรื่องถัดไป</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
