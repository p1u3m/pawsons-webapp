import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { CharacterTile } from "@/components/character-ui";
import { characters, houses } from "@/lib/data";
import titleStyles from "@/components/section-title.module.css";

type House = (typeof houses)[number];

export const metadata = { title: "Characters" };

// One friend from each house for the hero: a different four from /contents
// (Felix, Alfred, Julian, Wendy) with similar proportions, so the same sizes
// work without them covering each other.
const heroFriends = [
  characters[3],
  characters[6],
  characters[11],
  characters[13],
];

/** Band colour, doodle tile and accent of one house (tiles from scripts/build-patterns.mjs). */
function bandStyle(house: House) {
  return {
    "--pw-band": house.color,
    "--pattern": `url("/patterns/house-${house.id}.svg")`,
    "--house": house.badgeColor,
  } as React.CSSProperties;
}

export default function Page() {
  return (
    <div className="chars">
      <section className="wrap chars-hero">
        <div className="chars-hero-copy">
          <h1>
            ทุกตัวตน
            <br />
            มีเรื่องราวของตัวเอง
          </h1>
          <p>16 บุคลิก 4 บ้าน และอีกหลายมุมเล็ก ๆ ที่อยากให้คุณรู้จัก</p>
          <Link className="button pawson-sign" href="/quiz">
            <span>ค้นหาเพื่อนของคุณ</span>
          </Link>
        </div>
        <div className="chars-hero-art" aria-hidden="true">
          {heroFriends.map((friend) => (
            <Image
              key={friend.type}
              src={friend.image}
              alt=""
              width={480}
              height={480}
              sizes="(max-width: 860px) 45vw, 240px"
              priority
            />
          ))}
        </div>
      </section>

      {/* One wavy band per house, in that house's colour and pattern. */}
      {houses.map((item) => (
        <section
          key={item.id}
          className="chars-band"
          style={bandStyle(item)}
          aria-labelledby={`house-${item.id}`}
        >
          <div className="wrap">
            <header className="chars-shelf-head chars-shelf-head--band">
              <h2 id={`house-${item.id}`}>
                <span className={titleStyles.label}>
                  <span className="chars-dot" aria-hidden="true" />
                  {item.name}
                </span>
              </h2>
              <Link className="chars-link" href={`/houses/${item.id}`}>
                รู้จักบ้านนี้
                <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
              </Link>
            </header>
            <div className="chars-grid">
              {characters
                .filter((c) => c.house.id === item.id)
                .map((c) => (
                  <CharacterTile key={c.type} character={c} />
                ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
