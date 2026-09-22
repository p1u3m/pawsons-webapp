import { houseBackground } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { houses, characters } from "@/lib/data";
import { BackLink, CharacterCard } from "@/components/ui";
export function generateStaticParams() {
  return houses.map((h) => ({ house: h.id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ house: string }>;
}) {
  const { house } = await params;
  const h = houses.find((h) => h.id === house);
  if (!h) notFound();
  return (
    <div className="wrap page-space">
      <BackLink href="/houses">บ้านทั้งสี่</BackLink>
      <header
        className="house-banner"
        style={{ background: houseBackground(h), color: h.ink }}
      >
        <Image
          src={`/houses/${h.sigil}`}
          alt={`ตราบ้าน ${h.name}`}
          width={180}
          height={180}
        />
        <span>{h.thai}</span>
        <h1>{h.name} House</h1>
        <p>{h.motto}</p>
        <p>{h.description}</p>
      </header>
      <h2 className="spaced-title">ทำความรู้จักสมาชิกในบ้าน</h2>
      <div className="character-grid">
        {characters
          .filter((c) => c.house.id === h.id)
          .map((c) => (
            <CharacterCard key={c.type} character={c} />
          ))}
      </div>
    </div>
  );
}
