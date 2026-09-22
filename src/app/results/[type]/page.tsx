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
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const c = getCharacter(type);
  if (!c) notFound();
  return (
    <div className="wrap result-page">
      <span className="eyebrow">A LITTLE PIECE OF YOU</span>
      <h1>You feel like {c.name}.</h1>
      <p>{c.tagline}</p>
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
          แชร์เพื่อนของคุณ ↗
        </Link>
        <Link
          className="button secondary"
          href={`/characters/${c.type.toLowerCase()}`}
        >
          รู้จัก {c.name} ให้มากขึ้น
        </Link>
      </div>
      <Link href="/quiz" className="text-link">
        ลองทำอีกครั้ง
      </Link>
      <p className="prototype-note">
        ผลจากแบบทดสอบตัวอย่างเพื่อความสนุก
        <br />
        คุณเป็นได้มากกว่าบุคลิกเพียงแบบเดียวเสมอ
      </p>
    </div>
  );
}
