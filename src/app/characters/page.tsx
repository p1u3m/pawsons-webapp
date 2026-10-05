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

export const metadata = { title: "Characters" };
const heroFriends = [
  characters[3],
  characters[6],
  characters[11],
  characters[13],
];

export default function Page() {
  return (
    <div className="focus-ink overflow-x-clip [--focus-offset:5px] [--focus-ring:var(--color-green)]">
      <h1 className="sr-only">
        เพื่อนทั้ง {characters.length} ตัวในโลกของ Pawsons
      </h1>
      {houses.map((house) => (
        <HouseBand
          key={house.id}
          style={houseVars(house)}
          className="pt-6 pb-22 [--focus-ring:var(--house-ink)] [--wave:48px] first-of-type:-mt-14 first-of-type:pt-22 first-of-type:[--wave:0px] md:pt-10 md:pb-32 md:[--wave:88px] md:first-of-type:-mt-16 md:first-of-type:pt-27"
          aria-labelledby={`house-${house.id}`}
        >
          <div className="wrap">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3 md:mb-7">
              <h2
                id={`house-${house.id}`}
                className="flex min-w-0 items-center gap-2 text-title leading-[1.4] tracking-[-0.015em] text-(--house-ink) md:gap-3 md:text-heading-sm tiny:text-title"
              >
                <Image
                  src={houseSigilSrc(house)}
                  alt=""
                  width={48}
                  height={48}
                  className="size-9 shrink-0 object-contain md:size-11"
                />
                <span lang="en">{house.name}</span>
              </h2>
              <ChipLink
                href={`/houses/${house.id}`}
                className="h-auto min-h-11 text-small"
              >
                รู้จักบ้านนี้
                <ArrowUpRightIcon size={14} aria-hidden="true" />
              </ChipLink>
            </header>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-4 md:gap-5">
              {characters
                .filter((character) => character.house.id === house.id)
                .map((character) => (
                  <CharacterTile key={character.type} character={character} />
                ))}
            </div>
          </div>
        </HouseBand>
      ))}
      <section
        className="wrap grid justify-items-center gap-6 pt-12 pb-14 text-center md:grid-cols-2 md:items-center md:gap-14 md:py-18 md:text-left"
        aria-labelledby="invitation-title"
      >
        <HeroFriends friends={heroFriends} />
        <div>
          <h2
            id="invitation-title"
            className="text-heading-sm leading-[1.4] tracking-[-0.02em] md:text-heading-lg"
          >
            ทุกตัวตน
            <br />
            มีเรื่องราวของตัวเอง
          </h2>
          <p className="mx-auto mt-4 max-w-[36ch] text-body-lg leading-[1.8] md:mr-auto md:ml-0 md:max-w-[42ch] md:text-body-lg">
            {characters.length} บุคลิก {houses.length} บ้าน และอีกหลายมุมเล็ก ๆ
            ที่อยากให้คุณรู้จัก
          </p>
          <Link
            href="/quiz"
            className={cn(pillButton({ variant: "sign" }), "mt-6")}
          >
            <span>ค้นหาเพื่อนของคุณ</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
