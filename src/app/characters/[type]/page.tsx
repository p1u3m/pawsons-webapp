import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import CharacterGallery from "@/components/character-gallery";
import { ChipLink, houseVars } from "@/components/character-ui";
import { roundButton } from "@/components/paper-ui";
import {
  profileHero,
  profileIntro,
  profileIntroCopy,
  profileKeyword,
  profileKeywords,
  profilePage,
  profilePortrait,
  profilePortraitArt,
  profilePrimary,
  profileRole,
  profileTagline,
  profileTaglineBody,
  profileTaglineLead,
  profileTopNav,
} from "@/components/profile-ui";
import reference from "@/lib/character-details.json";
import { characters, getCharacter, houseSigilSrc } from "@/lib/data";

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

const secondaryAction =
  "h-auto min-h-11 justify-center px-3 py-2.5 text-center whitespace-normal max-md:gap-1.5 max-md:text-[13px]";
const paginationLink =
  "group flex min-w-0 items-center gap-4 py-5 last:justify-end last:text-right max-md:gap-2";
const paginationName =
  "text-[20px] group-hover:text-(--house-ink) max-md:text-[18px]";
const paginationType =
  "ml-2.5 inline-block text-[12px] text-(--house-ink) not-italic max-md:ml-0 max-md:block";

function Keywords({ words, label }: { words: string[]; label: string }) {
  return (
    <ul className={profileKeywords} aria-label={label}>
      {words.map((word) => (
        <li key={word} lang="en" className={profileKeyword}>
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

  return (
    <article className={profilePage} style={houseVars(c.house)}>
      <div className={profileHero}>
        <div className="wrap">
          <nav className={profileTopNav} aria-label="การนำทางตัวละคร">
            <Link
              href="/characters"
              className={roundButton}
              aria-label="กลับไปหน้าเพื่อนทั้งหมด"
              title="ย้อนกลับ"
            >
              <ArrowLeftIcon size={20} aria-hidden="true" />
            </Link>
          </nav>
          <section className={profileIntro} aria-labelledby="profile-title">
            <div className={profilePortrait}>
              <div className={profilePortraitArt}>
                <Image
                  src={`/characters/reference/chibis/${c.type}.webp`}
                  alt={`${c.name} · ${c.type}`}
                  width={480}
                  height={480}
                  unoptimized
                  preload
                  className="h-auto w-[90%] object-contain max-md:w-[83%]"
                />
              </div>
            </div>
            <div className={profileIntroCopy}>
              <header>
                <h1
                  id="profile-title"
                  className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[clamp(56px,6.5vw,88px)] leading-[1.06] tracking-[-0.025em] text-(--house-ink) max-md:gap-3.5 max-md:text-[52px]"
                  lang="en"
                >
                  {c.name}
                  <span className="rounded-[8px] border border-[color-mix(in_srgb,var(--house-ink)_35%,transparent)] px-3 py-[9px] text-[15px] leading-none font-medium tracking-normal max-md:px-2.5 max-md:py-2 max-md:text-[13px]">
                    {c.type}
                  </span>
                </h1>
                <h2 className={profileRole} lang="en">
                  {detail.name_en}
                </h2>
              </header>
              <Keywords words={detail.keywords} label="ลักษณะบุคลิก" />
              <div className={profileTagline}>
                <p className={profileTaglineLead} lang="en">
                  “{detail.tagline_en}”
                </p>
                <p className={profileTaglineBody}>{detail.tagline_th}</p>
              </div>
              <div className="grid gap-5 max-md:gap-3">
                <ChipLink href="/quiz" className={profilePrimary}>
                  ค้นหาเพื่อนของคุณ
                  <ArrowUpRightIcon size={18} aria-hidden="true" />
                </ChipLink>
                <div className="grid grid-cols-2 gap-3 max-md:gap-2.5">
                  <ChipLink
                    href={`/contents?character=${c.type}`}
                    className={secondaryAction}
                  >
                    เรื่องเล่าของ {c.name}
                    <ArrowRightIcon size={17} aria-hidden="true" />
                  </ChipLink>
                  <ChipLink
                    href={`/shop?character=${c.type}`}
                    className={secondaryAction}
                  >
                    พา {c.name} กลับบ้าน
                    <ArrowUpRightIcon size={17} aria-hidden="true" />
                  </ChipLink>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="wrap">
        <section
          id="about"
          className="grid scroll-mt-0 grid-cols-[0.65fr_1.35fr] items-start gap-16 py-18 max-md:grid-cols-1 max-md:gap-5 max-md:py-12"
          aria-labelledby="about-title"
        >
          <h2
            id="about-title"
            className="text-[28px] leading-[1.4] tracking-[-0.02em] max-md:text-[24px]"
          >
            รู้จัก {c.name}
          </h2>
          <p className="max-w-[70ch] text-[16px] leading-[1.85] text-ink-soft">
            {detail.desc}
          </p>
        </section>
        <section
          id="gallery"
          className="scroll-mt-0"
          aria-label={`ภาพของ ${c.name}`}
        >
          <CharacterGallery type={c.type} name={c.name} />
        </section>
        <figure className="relative mx-auto mt-18 mb-20 max-w-[800px] px-8 pt-8 text-center max-md:my-12 max-md:px-0 max-md:pt-5">
          <span
            className="block text-[88px] leading-[0.75] text-(--house) max-md:text-[72px]"
            aria-hidden="true"
          >
            “
          </span>
          <blockquote>
            <p
              className="text-[clamp(23px,2.5vw,32px)] leading-[1.5] text-balance text-(--house-ink) max-md:text-[22px]"
              lang="en"
            >
              {detail.quote_en}
            </p>
            <p className="mt-4 text-[15px] leading-[1.8] text-ink-soft">
              {detail.quote_th}
            </p>
          </blockquote>
          <figcaption className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[13px] text-(--house-ink) max-md:mt-5">
            <span lang="en">{detail.author_en}</span>
            <span>{detail.author_th}</span>
          </figcaption>
        </figure>
      </div>

      <section
        id="house"
        className="scroll-mt-0 bg-(--band) py-16 max-md:py-12"
        aria-labelledby="profile-house-title"
      >
        <div className="wrap">
          <div className="grid grid-cols-[0.7fr_1.3fr] items-center gap-16 max-md:grid-cols-1 max-md:gap-6">
            <div className="grid place-items-center">
              <Image
                src={houseSigilSrc(c.house)}
                alt={`ตราประจำบ้าน ${c.house.name}`}
                width={300}
                height={300}
                sizes="(max-width: 767px) 180px, 300px"
                className="h-auto w-[min(100%,300px)] max-md:w-[180px]"
              />
            </div>
            <div>
              <h2
                id="profile-house-title"
                className="text-[clamp(28px,3.2vw,44px)] tracking-[-0.02em] text-balance text-(--house-ink) max-md:text-[28px]"
              >
                {c.house.name} House
              </h2>
              <p className="mt-2 text-[16px] text-(--house-ink)" lang="en">
                {house.sub}
              </p>
              <div className="mt-6">
                <p className="mb-1 text-[20px] leading-[1.8] text-(--house-ink)">
                  “{house.motto_th}”
                </p>
                <p
                  className="text-[14px] leading-[1.8] text-(--house-ink)"
                  lang="en"
                >
                  {house.motto_en}
                </p>
                <p className="mt-1.5 text-[14px] leading-[1.8] text-(--house-ink)">
                  {house.latin}
                </p>
              </div>
              <Keywords words={house.keywords} label="บุคลิกของบ้าน" />
              <div className="mt-6 mb-2 text-[16px] leading-[1.85]">
                {house.desc.split("\n\n").map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-(--house-ink)">
                    {paragraph}
                  </p>
                ))}
              </div>
              <ChipLink
                href={`/houses/${c.house.id}`}
                className="h-auto min-h-11"
              >
                รู้จักบ้าน {c.house.name}
                <ArrowUpRightIcon size={18} aria-hidden="true" />
              </ChipLink>
            </div>
          </div>
          <div className="mt-12 mb-6 flex flex-wrap items-baseline justify-between gap-2 border-t border-[color-mix(in_srgb,var(--house-ink)_20%,transparent)] pt-8 max-md:mt-8 max-md:pt-6">
            <h3 className="text-[24px] tracking-normal">สมาชิกในบ้าน</h3>
          </div>
          <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 max-md:gap-3">
            {members.map((member) => {
              const current = member.type === c.type;
              return (
                <Link
                  key={member.type}
                  href={`/characters/${member.type.toLowerCase()}`}
                  className="min-w-0 rounded-tile bg-cream p-3.5 hover:-translate-y-0.5 aria-[current=page]:-outline-offset-1 aria-[current=page]:outline aria-[current=page]:outline-(--house-ink) max-md:p-3"
                  aria-current={current ? "page" : undefined}
                >
                  <div className="grid aspect-square min-h-0 place-items-center overflow-hidden">
                    <Image
                      src={member.image}
                      alt=""
                      width={240}
                      height={240}
                      sizes="(max-width: 767px) 40vw, 240px"
                      className="size-full min-h-0 object-contain"
                    />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <strong className="text-[20px] text-(--house-ink) max-md:text-[18px]">
                      {member.name}
                    </strong>
                    <span className="text-[12px] text-(--house-ink)">
                      {member.type}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <div className="wrap">
        <nav
          className="mt-8 grid grid-cols-2 gap-6 max-md:mt-3 max-md:gap-4"
          aria-label="ตัวละครก่อนหน้าและถัดไป"
        >
          <Link
            href={`/characters/${previous.type.toLowerCase()}`}
            className={paginationLink}
          >
            <ArrowLeftIcon
              size={20}
              aria-hidden="true"
              className="max-md:hidden"
            />
            <FriendFace type={previous.type} />
            <span className="grid min-w-0 gap-1">
              <small className="text-[12px] text-ink-muted">
                เพื่อนก่อนหน้า
              </small>
              <strong className={paginationName}>
                {previous.name}
                <em className={paginationType}>{previous.type}</em>
              </strong>
            </span>
          </Link>
          <Link
            href={`/characters/${next.type.toLowerCase()}`}
            className={paginationLink}
          >
            <span className="grid min-w-0 gap-1">
              <small className="text-[12px] text-ink-muted">เพื่อนถัดไป</small>
              <strong className={paginationName}>
                {next.name}
                <em className={paginationType}>{next.type}</em>
              </strong>
            </span>
            <FriendFace type={next.type} />
            <ArrowRightIcon
              size={20}
              aria-hidden="true"
              className="max-md:hidden"
            />
          </Link>
        </nav>
      </div>
    </article>
  );
}

function FriendFace({ type }: { type: string }) {
  return (
    <Image
      className="h-auto w-[60px] shrink-0 object-contain max-md:w-11"
      src={`/characters/faces/${type}.png`}
      alt=""
      width={162}
      height={124}
      sizes="60px"
    />
  );
}
