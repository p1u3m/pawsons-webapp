import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { ChipLink, HouseBand, houseVars } from "@/components/character-ui";
import { characters, houses } from "@/lib/data";
import { cn } from "@/lib/utils";
import { HouseCrest, crestSrc } from "./house-ui";

export const metadata = { title: "Four houses" };

export default function Page() {
  return (
    <div className="focus-ink overflow-x-clip [--focus-offset:5px] [--focus-ring:var(--color-green)]">
      <section
        className="wrap max-w-[720px] pt-10 pb-3 text-center md:pt-14 md:pb-6"
        aria-labelledby="houses-title"
      >
        <h1
          id="houses-title"
          className="text-[28px] leading-[1.4] tracking-[-0.02em] md:text-[36px]"
        >
          บ้านไหนที่เป็นคุณ
        </h1>
        <nav aria-label="เลือกบ้าน" className="mt-6 md:mt-8">
          <ul className="grid grid-cols-4 gap-2 md:gap-6">
            {houses.map((house) => (
              <li key={house.id} style={houseVars(house)}>
                <a
                  href={`#${house.id}`}
                  className="group flex min-h-[120px] flex-col items-center gap-3 rounded-tile py-1 text-(--house-ink)"
                  aria-label={`ไปยังบ้าน ${house.name}`}
                >
                  <span
                    className={cn(
                      "press relative grid aspect-square w-full max-w-20 place-items-center rounded-[48%_48%_12px_12px] bg-cream [--depth:3px] [--ledge-2:var(--color-ledge-2)] md:max-w-[130px]",
                    )}
                  >
                    <Image
                      src={crestSrc(house)}
                      alt=""
                      width={160}
                      height={160}
                      sizes="(min-width: 768px) 104px, 64px"
                      className="absolute inset-[10%] size-[80%] object-contain group-hover:-translate-y-0.5"
                    />
                  </span>
                  <span
                    className="min-h-9 text-[12px] leading-[1.5] font-semibold [overflow-wrap:anywhere] md:min-h-6 md:text-[15px]"
                    lang="en"
                  >
                    {house.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      {houses.map((house, index) => {
        const members = characters.filter(
          (character) => character.house.id === house.id,
        );
        return (
          <HouseBand
            key={house.id}
            id={house.id}
            style={houseVars(house)}
            className="scroll-mt-0 pt-6 pb-20 [--focus-ring:var(--house-ink)] [--wave:48px] last:pb-16 md:pt-12 md:pb-32 md:[--wave:88px] md:last:pb-22"
            aria-labelledby={`house-${house.id}`}
          >
            <div
              className="wrap group grid justify-items-center gap-7 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-14 md:data-flip:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
              data-flip={index % 2 === 1 || undefined}
            >
              <HouseCrest
                house={house}
                priority={index === 0}
                className="w-[200px] md:w-[min(100%,300px)] md:group-data-flip:order-2"
              />
              <div className="w-full max-w-[520px] text-center md:justify-self-stretch md:text-left">
                <header>
                  <h2
                    id={`house-${house.id}`}
                    className="text-[clamp(28px,8vw,34px)] leading-[1.25] tracking-[-0.02em] text-balance text-(--house-ink) md:text-[clamp(34px,4vw,44px)]"
                    lang="en"
                  >
                    {house.name}
                  </h2>
                  <p className="mt-2 text-[17px] leading-[1.6] text-(--house-ink)">{house.thai}</p>
                  <p
                    className="mt-2 text-[12px] leading-[1.5] text-(--house-ink)"
                    lang="en"
                  >
                    {house.groupTitle}
                  </p>
                </header>
                <p
                  className="mt-6 text-[19px] leading-[1.6] text-balance text-(--house-ink)"
                  lang="en"
                >
                  “{house.motto}”
                </p>
                <p className="mx-auto mt-3 max-w-[42ch] text-[16px] leading-[1.8] text-(--house-ink) md:mx-0">{house.description}</p>
                <ChipLink
                  href={`/houses/${house.id}`}
                  className="mt-6 h-auto min-h-11 px-4 py-2.5 text-center whitespace-normal"
                >
                  รู้จักบ้าน {house.name}
                  <ArrowUpRightIcon size={16} aria-hidden="true" />
                </ChipLink>
                <ul
                  className="mx-auto mt-7 grid max-w-[360px] grid-cols-4 gap-2 md:ml-0"
                  aria-label={`สมาชิกบ้าน ${house.name}`}
                >
                  {members.map((character) => (
                    <li key={character.type}>
                      <Link
                        href={`/characters/${character.type.toLowerCase()}`}
                        className="group/member flex min-h-20 min-w-0 flex-col items-center justify-center gap-2 rounded-tile p-1 text-[13px] leading-[1.4] text-(--house-ink)"
                      >
                        <Image
                          src={`/characters/faces/${character.type}.png`}
                          alt=""
                          width={162}
                          height={124}
                          sizes="(max-width: 767px) 18vw, 76px"
                          className="h-auto w-full max-w-[76px] rounded-tile group-hover/member:-translate-y-0.5"
                        />
                        <span className="[overflow-wrap:anywhere]">{character.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </HouseBand>
        );
      })}
    </div>
  );
}
