import { houseBackground } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import { characters, getCharacter } from "@/lib/data";
import { CharacterImage, CharacterCard, BackLink } from "@/components/ui";
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
    <div className="wrap page-space">
      <BackLink />
      <section className="character-detail">
        <div
          className="detail-portrait"
          style={{ background: houseBackground(c.house) }}
        >
          <CharacterImage character={c} priority />
          <span>{c.type}</span>
        </div>
        <div className="detail-copy">
          <Link
            className="house-tag"
            href={`/houses/${c.house.id}`}
            style={{ color: c.house.ink }}
          >
            {c.house.name} House ↗
          </Link>
          <h1>Meet {c.name}.</h1>
          <h2>{c.tagline}</h2>
          <p>{c.description}</p>
          <blockquote>
            “ไม่ว่าจะเป็นวันแบบไหน
            <br />
            คุณก็เป็นตัวเองได้เสมอนะ”
          </blockquote>
          <div className="action-row">
            <Link className="button" href="/quiz">
              Find your Pawson ↗
            </Link>
            <Link
              className="button secondary"
              href={`/contents?character=${c.type}`}
            >
              เรื่องเล่าของ {c.name}
            </Link>
          </div>
          <Link className="text-link" href={`/shop?character=${c.type}`}>
            พา {c.name} กลับบ้าน ↗
          </Link>
        </div>
      </section>
      <section className="related-section">
        <h2>เพื่อนร่วมบ้านของ {c.name}</h2>
        <div className="related-grid">
          {characters
            .filter((x) => x.house.id === c.house.id && x.type !== c.type)
            .map((x) => (
              <CharacterCard key={x.type} character={x} />
            ))}
        </div>
      </section>
    </div>
  );
}
