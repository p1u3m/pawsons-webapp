import { houseBackground } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { characters, getCharacter } from "@/lib/data";
import { CharacterImage } from "@/components/ui";

export function generateStaticParams() {
  return characters.map((c) => ({ type: c.type.toLowerCase() }));
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams?: Promise<{ vibe?: string }>;
}) {
  const { type } = await params;
  const { vibe } = (await searchParams) || {};
  const c = getCharacter(type);
  if (!c) notFound();

  return (
    <div className="wrap result-page">
      <div className="result-card">
        <span className="eyebrow">A LITTLE PIECE OF YOU</span>
        <h1 style={{ marginTop: "16px" }}>You feel like {c.name}.</h1>
        <p>{c.tagline}</p>

        {vibe && (
          <div className="result-vibe-badge">
            <span>🌿 สิ่งที่ขาดไม่ได้ในที่พักใจ: <strong>{vibe}</strong></span>
          </div>
        )}

        <div
          className="result-art"
          style={{ background: houseBackground(c.house) }}
        >
          <CharacterImage character={c} priority />
          <span className="result-type" style={{ color: c.house.ink }}>
            {c.type}
          </span>
        </div>

        <p className="result-description">{c.description}</p>
        <Link href={`/houses/${c.house.id}`} className="house-tag">
          {c.house.name} House ↗
        </Link>

        <div className="action-row">
          <Link className="button" href={`/share/${c.type.toLowerCase()}`}>
            <span>แชร์เพื่อนของคุณ</span>
            <span className="icon-disc" aria-hidden="true">↗</span>
          </Link>
          <Link
            className="button secondary"
            href={`/characters/${c.type.toLowerCase()}`}
          >
            <span>รู้จัก {c.name} ให้มากขึ้น</span>
            <span className="icon-disc" aria-hidden="true">→</span>
          </Link>
        </div>

        <div style={{ marginTop: "24px" }}>
          <Link href="/quiz" className="text-link">
            <span>ลองทำอีกครั้ง</span>
            <span aria-hidden="true">↺</span>
          </Link>
        </div>

        <p className="prototype-note">
          ผลจากแบบทดสอบตัวอย่างเพื่อความสนุก
          <br />
          คุณเป็นได้มากกว่าบุคลิกเพียงแบบเดียวเสมอ
        </p>
      </div>
    </div>
  );
}
