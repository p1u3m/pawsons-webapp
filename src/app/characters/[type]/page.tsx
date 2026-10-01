import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import CharacterGallery from "@/components/character-gallery";
import { houseVars } from "@/components/character-ui";
import reference from "@/lib/character-details.json";
import { characters, getCharacter } from "@/lib/data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return characters.map((c) => ({ type: c.type.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const c = getCharacter((await params).type);
  return { title: c ? `${c.name} · ${c.type}` : "Characters" };
}

// Paper chip on a ledge (back link, house chip, secondary actions).
const chip =
  "rounded-full bg-cream font-semibold shadow-ledge-sm transition-transform duration-200 ease-spring hover:-translate-y-px motion-reduce:transition-none";
const topChip = cn(chip, "inline-flex min-h-10 items-center gap-2 px-3.5 py-1 text-[13px] md:min-h-11 md:text-[14px]");
const actionChip = cn(
  chip,
  "group inline-flex h-11 min-w-0 items-center justify-between gap-2 pr-2.5 pl-4 text-[14px] text-(--house-ink) md:h-[50px] md:pr-3 md:pl-5 md:text-[15px]",
);
const sectionHeading = "mb-4 flex flex-wrap items-baseline justify-between gap-2 md:mb-6";
const sectionTitle = "text-[18px] md:text-[24px]";
const mottoNote = "mb-[5px] text-[13px] leading-[1.7] text-(--house-ink) opacity-85 md:text-[15px]";

/** Arrow in a round disc at the end of an action; nudges on hover. */
function Disc({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-spring group-hover:[&_svg]:translate-x-px group-hover:[&_svg]:-translate-y-px motion-reduce:[&_svg]:transition-none",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Keywords({ words, label, className }: { words: string[]; label: string; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label={label}>
      {words.map((word) => (
        <li
          key={word}
          className="rounded-[20px] bg-cream px-3 py-[5px] text-[12px] font-semibold text-(--house-ink) shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--house)_25%,transparent)] md:px-3.5 md:py-1.5 md:text-[14px]"
        >
          {word}
        </li>
      ))}
    </ul>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const c = getCharacter((await params).type);
  if (!c) notFound();
  const detail = reference.characters[c.type];
  const house = reference.houses[detail.house as keyof typeof reference.houses];
  const members = characters.filter((x) => x.house.id === c.house.id);
  const index = characters.findIndex((x) => x.type === c.type);
  const previous =
    characters[(index + characters.length - 1) % characters.length];
  const next = characters[(index + 1) % characters.length];

  // Themed by house: --house (accent), --house-ink, --band (tint), --pattern.
  return (
    <article
      className="focus-ink overflow-x-clip pb-16 text-ink [--focus-offset:4px] [--focus-ring:var(--house)] **:tracking-normal"
      style={houseVars(c.house)}
    >
      {/* On desktop the band runs up behind the sticky header (64px in flow). */}
      <div className="band band-pattern band-wave-bottom pt-6 pb-[calc(var(--wave)+24px)] [--fade-from:35%] [--fade-to:80%] [--pattern-y:0px] [--wave:56px] md:-mt-16 md:pt-[100px] md:[--wave:110px]">
        <div className="wrap max-w-[1040px]">
          <nav className="mb-8 flex items-center justify-between gap-3 md:mb-10" aria-label="การนำทางตัวละคร">
            <Link href="/characters" className={cn(topChip, "text-ink")}>
              <ArrowLeftIcon size={16} aria-hidden="true" />
              เพื่อนทั้งหมด
            </Link>
            <Link className={cn(topChip, "text-(--house-ink)")} href={`/houses/${c.house.id}`}>
              <span className="size-2 shrink-0 rounded-full bg-(--house)" />
              {c.house.name} House
              <ArrowUpRightIcon size={14} aria-hidden="true" />
            </Link>
          </nav>

          {/* Phones: one column. Desktop: portrait on the left, the story on the right. */}
          <section
            className="grid gap-[22px] md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:items-start md:gap-x-16 md:gap-y-5"
            aria-labelledby="profile-title"
          >
            <header className="max-md:text-center md:col-start-2 md:row-start-1">
              <h1
                id="profile-title"
                className="mb-1 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[56px] leading-[1.1] text-(--house) max-md:justify-center md:text-[80px]"
              >
                {c.type}{" "}
                <span className="rounded-full bg-cream px-4 py-1.5 text-[18px] leading-[1.3] text-(--house-ink) shadow-ledge-sm md:px-5 md:py-2 md:text-[24px]">
                  {c.name}
                </span>
              </h1>
              <h2 className="text-[25px] leading-[1.3] md:text-[36px]">{detail.name_en}</h2>
            </header>
            <div className="doodle-bg grid aspect-square w-[min(100%,320px)] place-items-center justify-self-center md:col-start-1 md:row-span-5 md:row-start-1 md:w-full md:max-w-none">
              <Image
                src={`/characters/reference/chibis/${c.type}.webp`}
                alt={`${c.name} · ${c.type}`}
                width={360}
                height={360}
                unoptimized
                preload
                className="size-[84%] object-contain"
              />
            </div>
            <Keywords
              words={detail.keywords}
              label="ลักษณะบุคลิก"
              className="justify-center md:col-start-2 md:row-start-2 md:justify-start"
            />
            <div className="border-l-[3px] border-(--house) py-5 pl-[18px] md:col-start-2 md:row-start-3">
              <p lang="en" className="text-[18px] leading-[1.65] font-bold md:text-[22px]">
                {detail.tagline_en}
              </p>
              <p className="mt-2 text-[14px] leading-[1.65] text-(--house-ink) md:text-[16px]">
                {detail.tagline_th}
              </p>
            </div>
            <p className="text-[16px] leading-[1.9] text-ink-soft md:col-start-2 md:row-start-4 md:text-[18px]">
              {detail.desc}
            </p>
            {/* Main action on its own row, the two secondary chips side by side below. */}
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-3 md:col-start-2 md:row-start-5 md:mt-1 md:self-start">
              <Link
                href="/quiz"
                className="group col-span-full inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[26px] bg-(--house) px-[26px] text-[16px] font-bold text-white shadow-[0_4px_0_color-mix(in_srgb,var(--house)_70%,#000),0_7px_0_color-mix(in_srgb,var(--house)_22%,transparent)] transition-[translate,box-shadow] duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-[0_6px_0_color-mix(in_srgb,var(--house)_70%,#000),0_9px_0_color-mix(in_srgb,var(--house)_22%,transparent)] active:translate-y-1 active:shadow-[0_0_0_color-mix(in_srgb,var(--house)_70%,#000),0_2px_0_color-mix(in_srgb,var(--house)_22%,transparent)] motion-reduce:transition-none md:min-h-14 md:text-[17px]"
              >
                ค้นหาเพื่อนของคุณ
                <Disc className="size-7 bg-white text-(--house) md:size-8">
                  <ArrowUpRightIcon size={16} weight="bold" />
                </Disc>
              </Link>
              <Link href={`/contents?character=${c.type}`} className={actionChip}>
                เรื่องเล่าของ {c.name}
                <Disc className="size-6 bg-(--band) text-(--house-ink) md:size-7">
                  <ArrowRightIcon size={14} weight="bold" />
                </Disc>
              </Link>
              <Link href={`/shop?character=${c.type}`} className={actionChip}>
                พา {c.name} กลับบ้าน
                <Disc className="size-6 bg-(--band) text-(--house-ink) md:size-7">
                  <ArrowUpRightIcon size={14} weight="bold" />
                </Disc>
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="wrap max-w-[1040px]">
        <section className="mt-10 md:mt-14" aria-labelledby="gallery-title">
          <div className={sectionHeading}>
            <h2 id="gallery-title" className={sectionTitle}>
              อีกหลายมุมของ {c.name}
            </h2>
          </div>
          <CharacterGallery type={c.type} name={c.name} />
        </section>

        <figure className="relative mt-9 mb-11 border-t border-[color-mix(in_srgb,var(--house)_25%,transparent)] pt-6 pl-6 md:mt-12 md:mb-14 md:px-14 md:pt-8">
          <span
            className="absolute top-[18px] left-0 text-[42px] leading-none text-(--house) md:top-8 md:text-[64px]"
            aria-hidden="true"
          >
            “
          </span>
          <blockquote>
            <p lang="en" className="mb-3 text-[20px] leading-[1.6] italic md:text-[30px]">
              “{detail.quote_en}”
            </p>
            <p className="text-[14px] leading-[1.8] md:text-[17px]">{detail.quote_th}</p>
          </blockquote>
          <figcaption className="mt-4 flex flex-wrap gap-x-2.5 gap-y-1 text-[12px] text-(--house-ink) md:text-[14px]">
            {detail.author_en}
            <span className="text-ink-muted">{detail.author_th}</span>
          </figcaption>
        </figure>
      </div>

      <section
        className="band band-wave-top band-pattern mt-[calc(var(--wave)+8px)] pt-6 pb-14 [--fade-from:40%] [--fade-to:85%] [--wave:56px] md:pt-8 md:pb-[72px] md:[--wave:110px]"
        aria-labelledby="profile-house-title"
      >
        <div className="wrap max-w-[1040px]">
          {/* Phones: intro, crest, then the lore. Desktop: crest beside the copy. */}
          <div className="mb-8 grid gap-6 md:grid-cols-[280px_minmax(0,1fr)] md:items-center md:gap-14">
            <div className="doodle-bg doodle-3 row-start-2 aspect-square w-[200px] justify-self-center md:row-auto md:w-[280px]">
              <Image
                src={`/characters/reference/crests/${house.slug}.png`}
                alt={`ตราประจำบ้าน ${c.house.name}`}
                width={280}
                height={280}
                sizes="(max-width: 767px) 200px, 280px"
                className="size-full object-contain p-[10%]"
              />
            </div>
            <div className="contents md:block">
              <div className="row-start-1">
                <p className="mb-3 text-[12px] font-bold text-(--house-ink) md:text-[14px]">{house.sub}</p>
                <h2
                  id="profile-house-title"
                  className="mb-4 text-[28px] leading-[1.3] text-(--house-ink) md:text-[40px]"
                >
                  {c.house.name} House
                </h2>
                <div className="mb-[18px]">
                  <p className="mb-[5px] text-[16px] text-(--house-ink) md:text-[19px]">
                    “{house.motto_th}”
                  </p>
                  <p lang="en" className={mottoNote}>
                    {house.motto_en}
                  </p>
                  <p className={mottoNote}>{house.latin}</p>
                </div>
                <Keywords words={house.keywords} label="บุคลิกของบ้าน" />
              </div>
              <div className="row-start-3">
                <div className="mt-5 mb-4">
                  {house.desc.split("\n\n").map((paragraph) => (
                    <p key={paragraph} className="mb-3 text-[14px] leading-[1.9] md:text-[16px]">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 text-[14px] font-bold text-(--house-ink) hover:underline hover:underline-offset-4 md:text-[16px]"
                  href={`/houses/${c.house.id}`}
                >
                  รู้จักบ้าน {c.house.name}
                  <ArrowUpRightIcon size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
          <div className={sectionHeading}>
            <h3 className={sectionTitle}>สมาชิกในบ้าน</h3>
          </div>
          <div className="grid grid-cols-4 gap-2.5 md:gap-6">
            {members.map((member, i) => {
              const current = member.type === c.type;
              return (
                <Link
                  key={member.type}
                  href={`/characters/${member.type.toLowerCase()}`}
                  className="group flex min-w-0 flex-col items-center gap-1 rounded-lg text-center"
                  aria-current={current ? "page" : undefined}
                >
                  {/* A different doodle shape for each friend. */}
                  <div
                    className={cn(
                      "doodle-bg aspect-square w-full p-2 transition-transform duration-220 ease-spring group-hover:-translate-y-[3px] motion-reduce:transition-none md:p-5",
                      ["", "doodle-2", "doodle-3"][i % 3],
                    )}
                  >
                    <Image
                      src={member.image}
                      alt=""
                      width={220}
                      height={220}
                      sizes="(max-width: 767px) 22vw, 220px"
                      className="absolute inset-2 size-[calc(100%-16px)] object-contain md:inset-5 md:size-[calc(100%-40px)]"
                    />
                  </div>
                  <strong className={cn("mt-1.5 text-[12px] [overflow-wrap:anywhere] md:text-[18px]", current && "text-(--house)")}>
                    {member.name}
                  </strong>
                  <span className="text-[10px] text-(--house-ink) md:text-[14px]">{member.type}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="wrap max-w-[1040px] pt-7 md:pt-9">
        <nav className="mt-6 grid grid-cols-2 gap-3" aria-label="ตัวละครก่อนหน้าและถัดไป">
          <Link href={`/characters/${previous.type.toLowerCase()}`} className={pageLink}>
            <ArrowLeftIcon size={18} aria-hidden="true" className={pageArrow} />
            <FriendFace type={previous.type} />
            <span className={pageLabel}>
              <small className={pageSmall}>เพื่อนก่อนหน้า</small>
              <strong className={pageName}>
                {previous.name} · {previous.type}
              </strong>
            </span>
          </Link>
          <Link href={`/characters/${next.type.toLowerCase()}`} className={cn(pageLink, "justify-end text-right")}>
            <span className={pageLabel}>
              <small className={pageSmall}>เพื่อนถัดไป</small>
              <strong className={pageName}>
                {next.name} · {next.type}
              </strong>
            </span>
            <FriendFace type={next.type} />
            <ArrowRightIcon size={18} aria-hidden="true" className={pageArrow} />
          </Link>
        </nav>
      </div>
    </article>
  );
}

// Previous / next friend buttons. Phones hide the arrows: the face shows the way.
const pageLink =
  "flex min-h-16 items-center gap-2.5 rounded-[22px] bg-cream px-4 py-2.5 shadow-ledge-sm transition-transform duration-200 ease-spring hover:-translate-y-0.5 motion-reduce:transition-none max-md:gap-2 max-md:px-3";
const pageArrow = "shrink-0 text-(--house) max-md:hidden";
const pageLabel = "grid min-w-0 gap-1";
const pageSmall = "truncate text-[11px] text-ink-muted md:text-[13px]";
const pageName = "truncate text-[13px] md:text-[16px]";

/** Face of the friend the button leads to (public/characters/faces). */
function FriendFace({ type }: { type: string }) {
  return (
    <Image
      className="aspect-[162/124] h-auto w-10 shrink-0 rounded-xl object-cover md:w-[60px] md:rounded-[14px]"
      src={`/characters/faces/${type}.png`}
      alt=""
      width={162}
      height={124}
      sizes="60px"
    />
  );
}
