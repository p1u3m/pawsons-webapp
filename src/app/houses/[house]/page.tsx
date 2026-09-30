import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { CharacterTile } from "@/components/character-ui";
import { characters, houses } from "@/lib/data";
import titleStyles from "@/components/section-title.module.css";
import { crestSrc, houseBandStyle } from "../house-style";

export function generateStaticParams() {
  return houses.map((h) => ({ house: h.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ house: string }>;
}) {
  const { house } = await params;
  const h = houses.find((h) => h.id === house);
  return { title: h ? `${h.name} House` : "Four houses" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ house: string }>;
}) {
  const { house } = await params;
  const h = houses.find((h) => h.id === house);
  if (!h) notFound();
  const members = characters.filter((c) => c.house.id === h.id);
  const others = houses.filter((o) => o.id !== h.id);

  return (
    <div className="houses houses--detail" style={houseBandStyle(h)}>
      <section className="wrap houses-detail-hero">
        <Link className="chars-link houses-back" href="/houses">
          <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
          บ้านทั้งสี่
        </Link>
        <div className="houses-row">
          <div className="houses-crest doodle-bg doodle-bg--2" aria-hidden="true">
            <Image src={crestSrc(h)} alt="" width={320} height={320} priority />
          </div>
          <div className="houses-copy">
            <p className="houses-group">{h.groupTitle}</p>
            <h1>
              <span className={`${titleStyles.label} houses-name`}>
                {h.name} House
              </span>
              <small>{h.thai}</small>
            </h1>
            <p className="houses-motto" lang="en">
              “{h.motto}”
            </p>
            <p className="houses-desc">{h.description}</p>
          </div>
        </div>
      </section>

      <section className="chars-band" aria-labelledby="house-members">
        <div className="wrap">
          <h2 id="house-members" className="houses-band-title">
            สมาชิกในบ้าน
          </h2>
          <div className="chars-grid">
            {members.map((c) => (
              <CharacterTile key={c.type} character={c} />
            ))}
          </div>

          <nav className="houses-others" aria-label="บ้านอื่น ๆ">
            <h2 className="houses-band-title">แวะบ้านอื่นต่อ</h2>
            <div className="houses-jump">
              {others.map((o) => (
                <Link key={o.id} href={`/houses/${o.id}`} style={houseBandStyle(o)}>
                  <Image src={crestSrc(o)} alt="" width={96} height={96} />
                  <span className="houses-jump-name">{o.name}</span>
                  <span className="houses-jump-thai">{o.thai}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </section>
    </div>
  );
}
