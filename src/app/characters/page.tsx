import MotionLink from "@/components/motion-link";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import {
  CharacterTile,
  ChipLink,
  HeroFriends,
  HouseBand,
  houseVars,
} from "@/components/character-ui";
import { pillButton } from "@/components/pill-button";
import { characters, houses, houseSigilSrc } from "@/lib/data";
import { cn } from "@/lib/utils";
import styles from "./characters.module.css";

export const metadata = { title: "Characters" };
const heroFriends = [
  characters[3],
  characters[6],
  characters[11],
  characters[13],
];

export default function Page() {
  return (
    <div
      className={`${styles.page} focus-ink motion-reduce:[&_a]:translate-none! motion-reduce:[&_a]:scale-100! motion-reduce:[&_svg]:translate-none!`}
    >
      <h1 className="sr-only">
        เพื่อนทั้ง {characters.length} ตัวในโลกของ Pawsons
      </h1>
      {houses.map((house) => (
        <HouseBand
          key={house.id}
          style={houseVars(house)}
          className={styles.band}
          aria-labelledby={`house-${house.id}`}
        >
          <div className={styles.wrap}>
            <header className={styles.houseHeader}>
              <h2 id={`house-${house.id}`}>
                <Image
                  src={houseSigilSrc(house)}
                  alt=""
                  width={48}
                  height={48}
                  className={styles.sigil}
                />
                <span lang="en">{house.name}</span>
              </h2>
              <ChipLink
                href={`/houses/${house.id}`}
                className={styles.houseButton}
              >
                รู้จักบ้านนี้
                <ArrowUpRightIcon size={14} aria-hidden="true" />
              </ChipLink>
            </header>
            <div className={styles.cards}>
              {characters
                .filter((character) => character.house.id === house.id)
                .map((character) => (
                  <CharacterTile key={character.type} character={character} />
                ))}
            </div>
          </div>
        </HouseBand>
      ))}
      <section className={styles.invitation} aria-labelledby="invitation-title">
        <HeroFriends friends={heroFriends} />
        <div className={styles.invitationCopy}>
          <h2 id="invitation-title">
            ทุกตัวตน
            <br />
            มีเรื่องราวของตัวเอง
          </h2>
          <p>
            {characters.length} บุคลิก {houses.length} บ้าน และอีกหลายมุมเล็ก ๆ
            ที่อยากให้คุณรู้จัก
          </p>
          <MotionLink
            href="/quiz"
            className={cn(pillButton({ variant: "sign" }), styles.quizButton)}
          >
            <span>ค้นหาเพื่อนของคุณ</span>
          </MotionLink>
        </div>
      </section>
    </div>
  );
}
