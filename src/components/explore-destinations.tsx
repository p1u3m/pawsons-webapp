import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { characters, getCharacter, houses, questions } from "@/lib/data";
import { cn } from "@/lib/utils";

const art = (type: string) => getCharacter(type)!.image;

// Art row of each card; it tilts a little when the card is hovered.
const artBox =
  "relative flex h-24 items-center justify-center transition-[rotate,scale] duration-300 ease-spring group-hover:-rotate-3 group-hover:scale-106 group-focus-visible:-rotate-3 group-focus-visible:scale-106";
const crestTilt = ["-rotate-14 translate-y-2", "-rotate-5", "rotate-5", "rotate-14 translate-y-2"];

const destinations = [
  {
    href: "/characters",
    title: "Characters",
    desc: `ทำความรู้จักเพื่อนทั้ง ${characters.length} ตัว`,
    tone: "bg-lavender",
    art: (
      <span className={cn(artBox, "grid grid-cols-[repeat(2,44px)] content-center gap-1.5")}>
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
            src={`/characters/reference/crests/${house.id}s.png`}
            alt=""
            width={48}
            height={80}
            className={cn("-mx-[5px] w-10 drop-shadow-[0_2px_0_rgb(24_24_24/0.08)]", crestTilt[i])}
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
        <Image src={art("INFP")} alt="" width={72} height={60} className="relative mt-[34px] -mr-[34px] w-16" />
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
        <Image src={art("ESFP")} alt="" width={88} height={74} className="w-[84px]" />
        <span className="absolute top-1.5 -right-2.5 grid size-[30px] rotate-12 place-items-center rounded-full bg-[#e8577d] text-white shadow-[0_2px_0_rgb(24_24_24/0.14)]">
          <HeartIcon size={14} weight="fill" />
        </span>
      </span>
    ),
  },
];

// Card on a solid ledge (--ledge) that rises on hover and sinks when pressed.
const card =
  "group relative flex flex-col items-center gap-3 rounded-[32px] px-4 pt-[22px] pb-5 text-center text-ink shadow-[0_5px_0_var(--ledge)] transition-[translate,scale,box-shadow] duration-220 ease-spring [--ledge:#e2d3a4] hover:-translate-y-[5px] hover:shadow-[0_10px_0_var(--ledge)] focus-visible:-translate-y-[5px] focus-visible:shadow-[0_10px_0_var(--ledge)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink active:translate-y-px active:scale-[0.98] active:shadow-[0_3px_0_var(--ledge)] max-[33.75rem]:rounded-[26px] max-[33.75rem]:px-2.5 max-[33.75rem]:pt-[18px] max-[33.75rem]:pb-4";

export function ExploreDestinations() {
  return (
    <section
      className="band band-wave-top band-pattern pt-[60px] pb-24 [--band:#fff0bd] [--fade-from:40%] [--fade-to:85%] [--pattern:url(/patterns/home.svg)] [--wave:120px] max-md:[--wave:64px] max-[33.75rem]:pt-10 max-[33.75rem]:pb-16"
      data-reveal
    >
      <div className="wrap">
        <h2 className="mb-[22px] text-center text-[clamp(22px,3vw,28px)] tracking-[-0.4px]">
          ไปเที่ยวต่อที่ไหนดี?
        </h2>
        <nav
          className="mx-auto grid max-w-[860px] grid-cols-4 gap-[18px] max-[50rem]:max-w-[520px] max-[50rem]:grid-cols-2 max-[50rem]:gap-3.5"
          aria-label="สำรวจหน้าอื่นใน Pawsons"
        >
          <Link
            href="/quiz"
            className={cn(
              card,
              "col-span-full flex-row justify-center gap-[clamp(20px,5vw,56px)] bg-sun px-[clamp(20px,5vw,48px)] py-[26px] text-left [--ledge:#d8b21e] max-[33.75rem]:flex-col max-[33.75rem]:text-center",
            )}
          >
            <span className={cn(artBox, "h-[110px]")} aria-hidden="true">
              {["INTJ", "ENFP", "ESTP"].map((type, i) => (
                <Image
                  key={type}
                  src={art(type)}
                  alt=""
                  width={120}
                  height={100}
                  className={cn(
                    "-mx-3 w-24",
                    i === 0 && "-rotate-8 translate-y-2",
                    i === 1 && "relative z-1 w-[110px]",
                    i === 2 && "rotate-8 translate-y-2",
                  )}
                />
              ))}
              <span className="absolute -top-3 -right-2 z-2 grid size-9 place-items-center rounded-full bg-cream text-[20px] font-bold text-ink shadow-[0_3px_0_rgb(24_24_24/0.14)]">
                ?
              </span>
            </span>
            <span className="flex max-w-[340px] flex-col items-start gap-1 max-[33.75rem]:items-center">
              <span className="text-[clamp(22px,3vw,28px)] leading-[1.25] font-bold tracking-[-0.3px]">
                Find your Pawson
              </span>
              <span className="text-[15px] leading-[1.5] text-sun-ink">
                ตอบ {questions.length} คำถามสั้น ๆ แล้วมาดูว่าเพื่อนตัวไหนคือคุณ
              </span>
              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[14px] font-bold text-white">
                เริ่มเลย <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
              </span>
            </span>
          </Link>

          {destinations.map((item) => (
            <Link href={item.href} className={cn(card, item.tone)} key={item.href}>
              <span aria-hidden="true">{item.art}</span>
              <span className="flex flex-col items-center gap-1">
                <span className="text-[16px] leading-[1.25] font-bold tracking-[-0.3px] max-[33.75rem]:text-[14.5px]">
                  {item.title}
                </span>
                <span className="text-[13px] leading-[1.5] text-ink-muted max-[33.75rem]:text-[12px]">
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
