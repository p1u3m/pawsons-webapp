import Link from "next/link";
import Image from "next/image";
import { HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { characters, getCharacter, houses, houseSigilSrc } from "@/lib/data";
import { cn } from "@/lib/utils";

const art = (type: string) => getCharacter(type)!.image;

// Art row of each card; it tilts a little when the card is hovered.
const artBox =
  "relative flex h-24 items-center justify-center transition-[rotate,scale] duration-300 ease-spring group-hover:-rotate-2 group-hover:scale-103 motion-reduce:transform-none motion-reduce:transition-none";
const crestTilt = [
  "-rotate-14 translate-y-2",
  "-rotate-5",
  "rotate-5",
  "rotate-14 translate-y-2",
];

const destinations = [
  {
    href: "/characters",
    title: "Characters",
    desc: `ทำความรู้จักเพื่อนทั้ง ${characters.length} ตัว`,
    tone: "bg-lavender",
    art: (
      <span
        className={cn(
          artBox,
          "grid grid-cols-[repeat(2,44px)] content-center gap-1.5",
        )}
      >
        {["INTJ", "ENFP", "ISFJ", "ESTP"].map((type) => (
          <Image
            key={type}
            src={`/characters/faces/${type}.png`}
            alt=""
            width={81}
            height={62}
            className="w-11 rounded-[14px] odd:-rotate-4 even:rotate-4"
          />
        ))}
      </span>
    ),
  },
  {
    href: "/houses",
    title: "Four Houses",
    desc: `บ้าน ${houses.length} หลัง ตามนิสัยที่ใกล้กัน`,
    tone: "bg-clover",
    art: (
      <span className={artBox}>
        {houses.map((house, i) => (
          <Image
            key={house.id}
            src={houseSigilSrc(house)}
            alt=""
            width={80}
            height={80}
            className={cn(
              "-mx-[5px] w-10 drop-shadow-[0_2px_0_rgb(24_24_24/0.08)]",
              crestTilt[i],
            )}
          />
        ))}
      </span>
    ),
  },
  {
    href: "/contents",
    title: "Little Stories",
    desc: "เรื่องเล็ก ๆ จากบ้านของเพื่อน ๆ",
    tone: "bg-forget",
    art: (
      <span className={cn(artBox, "w-[110px]")}>
        {/* A lined page behind the friend. */}
        <span className="absolute inset-[6px_22px_4px_8px] -rotate-6 rounded-[10px] px-3 pt-4 pb-2.5 shadow-[0_3px_0_rgb(24_24_24/0.08)] [background:repeating-linear-gradient(to_bottom,transparent_0_13px,rgb(24_24_24/0.12)_13px_15px)_content-box,var(--color-cream)]" />
        <Image
          src={art("INFP")}
          alt=""
          width={72}
          height={60}
          className="relative mt-[34px] -mr-[34px] w-16"
        />
      </span>
    ),
  },
  {
    href: "/shop",
    title: "Bring a friend home",
    desc: "ตุ๊กตาและของน่ารักจากเพื่อน ๆ",
    tone: "bg-dandelion",
    art: (
      <span className={artBox}>
        <Image
          src={art("ESFP")}
          alt=""
          width={88}
          height={74}
          className="w-[84px]"
        />
        <span className="absolute top-1.5 -right-2.5 grid size-[30px] rotate-12 place-items-center rounded-full bg-[#e8577d] text-white shadow-[0_2px_0_rgb(24_24_24/0.14)]">
          <HeartIcon size={14} weight="fill" />
        </span>
      </span>
    ),
  },
];

// Card on a solid ledge (--ledge) that rises on hover and sinks when pressed.
const card =
  "group relative flex flex-col items-center gap-3 rounded-[24px] px-4 pt-[22px] pb-5 text-center text-ink shadow-[0_3px_0_var(--ledge)] transition-[translate,scale,box-shadow] duration-220 ease-spring [--ledge:#e2d3a4] hover:-translate-y-[2px] hover:shadow-[0_5px_0_var(--ledge)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink active:translate-y-px active:scale-[0.98] active:shadow-[0_3px_0_var(--ledge)] max-[33.75rem]:rounded-[20px] max-[33.75rem]:px-2.5 max-[33.75rem]:pt-[18px] max-[33.75rem]:pb-4";

export function ExploreDestinations() {
  return (
    <section className="band band-wave-top band-pattern pt-[60px] pb-24 [--band:#fff0bd] [--fade-from:40%] [--fade-to:85%] [--pattern:url(/patterns/home.svg)] [--wave:120px] max-md:[--wave:64px] max-[33.75rem]:pt-10 max-[33.75rem]:pb-16">
      <div className="wrap">
        <h2 className="mb-[22px] text-center text-[clamp(22px,3vw,28px)] tracking-[-0.4px]">
          ไปเที่ยวต่อที่ไหนดี?
        </h2>
        <nav
          className="mx-auto grid max-w-[860px] grid-cols-4 gap-[18px] max-[50rem]:max-w-[520px] max-[50rem]:grid-cols-2 max-[50rem]:gap-3.5"
          aria-label="สำรวจหน้าอื่นใน Pawsons"
        >
          {destinations.map((item) => (
            <Link
              href={item.href}
              className={cn(card, item.tone)}
              key={item.href}
            >
              <span aria-hidden="true">{item.art}</span>
              <span className="flex flex-col items-center gap-1">
                <span className="text-[16px] leading-[1.25] font-bold tracking-[-0.3px] max-[33.75rem]:text-[14.5px]">
                  {item.title}
                </span>
                <span className="text-[13px] leading-[1.5] text-ink-muted max-[33.75rem]:text-[13px]">
                  {item.desc}
                </span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
