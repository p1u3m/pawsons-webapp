import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import {
  CharacterTile,
  ChipLink,
  DoodleLabel,
  HeroFriends,
  HouseBand,
  characterGrid,
  houseVars,
} from "@/components/character-ui";
import { pillButton } from "@/components/pill-button";
import { characters, houses } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Characters" };

// One friend from each house for the hero: a different four from /contents
// (Felix, Alfred, Julian, Wendy) with similar proportions, so the same sizes
// work without them covering each other.
const heroFriends = [characters[3], characters[6], characters[11], characters[13]];

// A soft halo in the band colour clears the doodles behind the heading.
const bandHalo =
  "[text-shadow:0_0_2px_var(--band),0_0_6px_var(--band),0_0_14px_var(--band),0_0_24px_var(--band)]";

export default function Page() {
  return (
    <div className="focus-ink min-h-[70vh] overflow-x-clip pt-14 md:pt-10">
      <section className="wrap grid gap-2 text-center split:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] split:items-center split:gap-12 split:text-left">
        <div>
          <h1 className="mb-3.5 text-[32px] leading-[1.3] tracking-[-0.02em] split:mb-4 split:text-[clamp(34px,4.4vw,54px)] split:leading-[1.18]">
            ทุกตัวตน
            <br />
            มีเรื่องราวของตัวเอง
          </h1>
          <p className="mx-auto max-w-[320px] text-[15px] leading-[1.7] split:m-0 split:max-w-[460px] split:text-[17px] split:leading-[1.75]">
            16 บุคลิก 4 บ้าน และอีกหลายมุมเล็ก ๆ ที่อยากให้คุณรู้จัก
          </p>
          <Link className={cn(pillButton({ variant: "sign" }), "mt-7 split:mt-8")} href="/quiz">
            <span>ค้นหาเพื่อนของคุณ</span>
          </Link>
        </div>
        <HeroFriends friends={heroFriends} />
      </section>

      {/* One wavy band per house, in that house's colour and pattern. */}
      {houses.map((item) => (
        <HouseBand key={item.id} style={houseVars(item)} aria-labelledby={`house-${item.id}`}>
          <div className="wrap">
            <header className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <h2
                id={`house-${item.id}`}
                className={cn(
                  "flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-1 text-[26px] tracking-normal md:text-[30px]",
                  bandHalo,
                )}
              >
                <DoodleLabel>
                  <span className="inline-block size-2.5 shrink-0 rounded-full bg-(--house)" aria-hidden="true" />
                  {item.name}
                </DoodleLabel>
              </h2>
              <ChipLink href={`/houses/${item.id}`}>
                รู้จักบ้านนี้
                <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
              </ChipLink>
            </header>
            <div className={characterGrid}>
              {characters
                .filter((c) => c.house.id === item.id)
                .map((c) => (
                  <CharacterTile key={c.type} character={c} />
                ))}
            </div>
          </div>
        </HouseBand>
      ))}
    </div>
  );
}
