import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import {
  CharacterTile,
  ChipLink,
  HouseBand,
  characterGrid,
  houseVars,
} from "@/components/character-ui";
import { characters, houses } from "@/lib/data";
import { cn } from "@/lib/utils";
import { HouseCrest, HouseIntro, bandHalo, crestSrc } from "../house-ui";

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

const bandTitle = cn("mb-[18px] text-[24px] md:text-[30px]", bandHalo);

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
    <div className="focus-ink min-h-[70vh] overflow-x-clip pt-8 md:pt-10" style={houseVars(h)}>
      <section className="wrap grid gap-4">
        <ChipLink className="justify-self-start" href="/houses">
          <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
          บ้านทั้งสี่
        </ChipLink>
        <div className="grid justify-items-center gap-7 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-14">
          <HouseCrest
            house={h}
            priority
            className="w-[min(56vw,220px)] md:w-[min(100%,260px)] md:justify-self-end"
          />
          <HouseIntro house={h} title={`${h.name} House`} heading="h1" />
        </div>
      </section>

      <HouseBand aria-labelledby="house-members">
        <div className="wrap">
          <h2 id="house-members" className={bandTitle}>
            สมาชิกในบ้าน
          </h2>
          <div className={characterGrid}>
            {members.map((c) => (
              <CharacterTile key={c.type} character={c} />
            ))}
          </div>

          <nav className="mt-14" aria-label="บ้านอื่น ๆ">
            <h2 className={bandTitle}>แวะบ้านอื่นต่อ</h2>
            <div className="grid grid-cols-3 gap-3 md:gap-[18px]">
              {others.map((o) => (
                <Link
                  key={o.id}
                  href={`/houses/${o.id}`}
                  style={houseVars(o)}
                  className="group flex flex-col items-center gap-0.5 rounded-3xl bg-(--band) px-2.5 pt-4 pb-3.5 text-center shadow-ledge transition-transform duration-220 ease-spring hover:-translate-y-1 motion-reduce:transition-none"
                >
                  <Image
                    src={crestSrc(o)}
                    alt=""
                    width={96}
                    height={96}
                    className="mb-2 h-16 w-auto transition-transform duration-350 ease-spring group-hover:-rotate-4 group-hover:scale-106 motion-reduce:transition-none"
                  />
                  <span className="text-[16px] font-bold text-(--house-ink)">{o.name}</span>
                  <span className="text-[12px] text-ink-soft opacity-75">{o.thai}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </HouseBand>
    </div>
  );
}
