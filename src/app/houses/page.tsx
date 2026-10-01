import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { ChipLink, HouseBand, houseVars } from "@/components/character-ui";
import { characters, houses } from "@/lib/data";
import { cn } from "@/lib/utils";
import { HouseCrest, HouseIntro, bandHalo } from "./house-ui";
import HousesMotion from "./houses-motion";

export const metadata = { title: "Four houses" };

export default function Page() {
  return (
    <HousesMotion className="pt-12 md:pt-10">
      <section className="wrap pt-8 pb-4 text-center md:pt-16 md:pb-8">
        {/* Thai stacks marks above and below the line: give it room. */}
        <h1 className="mb-[18px] text-[32px] leading-[1.45] tracking-[-0.02em] md:mb-[22px] md:text-[clamp(34px,4.4vw,52px)] md:leading-[1.4]">
          บ้านทั้งสี่
          <br />
          ในโลกใบเล็ก
        </h1>
        <p className="mx-auto max-w-[340px] text-[15px] leading-[1.7] md:max-w-[460px] md:text-[17px]">
          แต่ละบ้านมีเสน่ห์ต่างกัน แต่ทุกบ้านอบอุ่นในแบบของตัวเอง
        </p>
      </section>

      {houses.map((h, i) => {
        const members = characters.filter((c) => c.house.id === h.id);
        const flip = i % 2 === 1;
        return (
          <HouseBand key={h.id} id={h.id} style={houseVars(h)} aria-labelledby={`house-${h.id}`}>
            <div
              data-flip={flip || undefined}
              className={cn(
                "wrap grid justify-items-center gap-7 md:items-center md:gap-14",
                flip
                  ? "md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
                  : "md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
              )}
            >
              <HouseCrest
                house={h}
                priority={i === 0}
                className={cn("w-[min(62vw,240px)] md:w-[min(100%,340px)]", flip && "md:order-2")}
              />

              <HouseIntro house={h} title={h.name} heading="h2" id={`house-${h.id}`} className={bandHalo}>
                <ul
                  data-members
                  className="mt-[22px] flex flex-wrap justify-center gap-2.5 [text-shadow:none] md:justify-start"
                  aria-label={`สมาชิกบ้าน ${h.name}`}
                >
                  {members.map((c) => (
                    <li key={c.type}>
                      <Link
                        href={`/characters/${c.type.toLowerCase()}`}
                        className="group flex w-[76px] flex-col items-center gap-1.5 text-[13px] font-semibold"
                      >
                        {/* Faces are 162×124: keep that ratio. */}
                        <Image
                          src={`/characters/faces/${c.type}.png`}
                          alt=""
                          width={81}
                          height={62}
                          className="h-auto w-[68px] rounded-2xl shadow-ledge-sm transition-transform duration-300 ease-spring group-hover:-translate-y-[3px] group-hover:-rotate-4 motion-reduce:transition-none"
                        />
                        <span>{c.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <ChipLink className="mt-6 [text-shadow:none]" href={`/houses/${h.id}`}>
                  แวะเข้าบ้าน {h.name}
                  <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
                </ChipLink>
              </HouseIntro>
            </div>
          </HouseBand>
        );
      })}
    </HousesMotion>
  );
}
