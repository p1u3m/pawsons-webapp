import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { ChipLink, HouseBand, houseVars } from "@/components/character-ui";
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
  profileTagline,
  profileTaglineBody,
  profileTaglineLead,
  profileTopNav,
} from "@/components/profile-ui";
import {
  characters,
  houses,
  houseSigilSrc,
  houseBackground,
  type House,
} from "@/lib/data";

import { houseDetails } from "./house-details";

const sectionTitle =
  "text-[28px] leading-[1.4] tracking-[-0.02em] text-balance max-md:text-[24px]";
const sectionHeading =
  "mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 max-md:gap-2";
const sectionHeadingNote = "mt-2 text-[14px] text-(--house-ink)";
const smallNote = "text-[12px] leading-[1.8] text-(--house-ink)";
const textLink =
  "inline-flex min-h-11 items-center gap-2 text-[14px] text-(--house-ink) underline-offset-4 hover:underline";

export default function HouseDetail({ house }: { house: House }) {
  const mock = houseDetails[house.id];
  const members = characters.filter((c) => c.house.id === house.id);
  return (
    <article className={profilePage} style={houseVars(house)}>
      <header className={profileHero}>
        <div className="wrap">
          <nav className={profileTopNav} aria-label="การนำทางบ้าน">
            <Link
              href="/houses"
              className={roundButton}
              aria-label="กลับไปบ้านทั้งสี่"
              title="กลับไปบ้านทั้งสี่"
            >
              <ArrowLeftIcon size={20} aria-hidden="true" />
            </Link>
          </nav>
          <div className={profileIntro}>
            <div className={profilePortrait}>
              <div className={profilePortraitArt}>
                <Image
                  src={houseSigilSrc(house)}
                  alt={`ตราบ้าน ${house.name}`}
                  width={380}
                  height={380}
                  preload
                  className="h-auto w-[78%] object-contain"
                />
              </div>
            </div>
            <div className={profileIntroCopy}>
              <h1
                className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1 text-[clamp(48px,5.2vw,72px)] leading-[1.06] tracking-[-0.025em] [overflow-wrap:anywhere] text-(--house-ink) max-md:gap-x-3 max-md:gap-y-2 max-md:text-[clamp(42px,12vw,52px)] md:max-[62.5rem]:text-[54px]"
                lang="en"
              >
                {house.name}{" "}
                <span className="text-[0.62em] font-medium">House</span>
              </h1>
              <h2 className="mt-3 text-[28px] leading-[1.4] tracking-[-0.02em] text-balance max-md:mt-2 max-md:text-[24px]">
                {house.thai}
              </h2>
              <p className="mt-3 text-[12px] text-(--house-ink)" lang="en">
                {house.groupTitle}
              </p>
              <ul className={profileKeywords} aria-label="บรรยากาศของบ้าน">
                {mock.traits.map((trait) => (
                  <li key={trait} className={profileKeyword}>
                    {trait}
                  </li>
                ))}
              </ul>
              <div className={profileTagline}>
                <p className={profileTaglineLead} lang="en">
                  “{house.motto}”
                </p>
                <p className={profileTaglineBody}>{house.description}</p>
              </div>
              <ul
                className="mt-7 grid max-w-[360px] grid-cols-4 gap-2 max-md:mt-6 md:max-[62.5rem]:mt-5"
                aria-label={`สมาชิกบ้าน ${house.name}`}
              >
                {members.map((c) => (
                  <li key={c.type}>
                    <Link
                      href={`/characters/${c.type.toLowerCase()}`}
                      className="flex min-h-20 flex-col items-center gap-2 rounded-tile p-1 text-[13px] text-(--house-ink)"
                    >
                      <Image
                        src={`/characters/faces/${c.type}.png`}
                        alt=""
                        width={162}
                        height={124}
                        sizes="76px"
                        className="h-auto w-[76px] max-w-full rounded-tile"
                      />
                      <span>{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </header>
      <div className="wrap">
        <section
          className="grid grid-cols-[0.65fr_1.35fr] items-start gap-16 pt-18 pb-10 max-md:grid-cols-1 max-md:gap-5 max-md:pt-12 max-md:pb-5"
          aria-labelledby="welcome-title"
        >
          <div>
            <h2 id="welcome-title" className={sectionTitle}>
              {mock.welcome[0]}
              <br />
              {mock.welcome[1]}
            </h2>
            <p className={`mt-[18px] ${smallNote}`}>
              เรื่องราวและบันทึกในบ้านเป็นข้อมูลตัวอย่าง
            </p>
          </div>
          <div>
            <p className="max-w-[70ch] text-[16px] leading-[1.85] text-ink-soft">
              {mock.story}
            </p>
            <ChipLink
              className="mt-6 h-auto min-h-12 px-5 py-3 text-(--house-ink)"
              href="#house-members"
            >
              รู้จักเพื่อนในบ้าน <ArrowRightIcon size={18} aria-hidden="true" />
            </ChipLink>
          </div>
        </section>
      </div>
      <HouseBand className="mt-[60px] pt-9 pb-16 [--wave:44px] last:pb-16 max-md:mt-12 max-md:pt-6 max-md:pb-10 max-md:[--wave:28px]">
        <div className="wrap">
          <section
            id="house-members"
            className="scroll-mt-28 max-md:scroll-mt-20"
            aria-labelledby="members-title"
          >
            <div className={sectionHeading}>
              <div>
                <h2 id="members-title" className={sectionTitle}>
                  เพื่อนร่วมบ้าน {house.name}
                </h2>
                <p className={sectionHeadingNote}>
                  ต่างคนต่างคิด แต่ทุกคนมีที่ของตัวเอง
                </p>
              </div>
              <span className="text-[12px] text-(--house-ink) max-md:text-[11px]">
                สมาชิกทั้ง 4 ตัว
              </span>
            </div>
            <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 max-md:gap-3">
              {members.map((c) => {
                const detail =
                  mock.members[c.type as keyof typeof mock.members];
                return (
                  <Link
                    key={c.type}
                    href={`/characters/${c.type.toLowerCase()}`}
                    className="group/member flex min-w-0 flex-col rounded-card-sm bg-cream p-2.5 press [--ledge-2:var(--color-ledge-2)] max-md:p-1.5"
                  >
                    <div
                      className="grid aspect-square place-items-center overflow-hidden rounded-tile"
                      style={{ background: houseBackground(house) }}
                    >
                      <Image
                        src={`/characters/reference/chibis/${c.type}.webp`}
                        alt={`${c.name} สมาชิกบ้าน ${house.name}`}
                        width={360}
                        height={360}
                        sizes="(max-width: 600px) 44vw, (max-width: 900px) 40vw, 240px"
                        className="size-[82%] object-contain"
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-2 pt-3.5 pb-2 max-md:px-1.5 max-md:pt-2.5 max-md:pb-1.5">
                      <h3 className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-[18px] text-ink max-md:text-[16px]">
                        {c.name}
                        <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--house)_12%,transparent)] px-2 py-0.5 text-[11px] leading-[1.5] font-bold tracking-[0.04em] text-(--house)">
                          {c.type}
                        </span>
                      </h3>
                      <p className="mt-2 text-[13px] leading-[1.8] font-semibold text-(--house-ink) max-md:text-[12px]">
                        {detail.role}
                      </p>
                      <p className="mt-2.5 flex-1 text-[13px] leading-[1.8] text-ink-soft">
                        {detail.note}
                      </p>
                      <span className="mt-4 inline-flex min-h-7 items-center gap-2 text-[12px] text-(--house-ink) underline-offset-4 group-hover/member:underline">
                        ทำความรู้จัก{" "}
                        <ArrowRightIcon size={15} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </HouseBand>
      <div className="wrap">
        <section
          className="grid grid-cols-[0.65fr_1.35fr] items-start gap-16 pt-18 pb-8 max-md:grid-cols-1 max-md:gap-6 max-md:pt-12 max-md:pb-6"
          aria-labelledby="corners-title"
        >
          <div>
            <h2 id="corners-title" className={sectionTitle}>
              มุมเล็ก ๆ<br className="max-md:hidden" />
              ที่เราเรียกว่าบ้าน
            </h2>
            <p className="mt-4 text-[14px] leading-[1.85] text-ink-soft">
              ไม่ว่าจะอยากอยู่กับตัวเอง
              <br />
              หรือแบ่งปันไอเดียกับใครสักคน
            </p>
          </div>
          <div>
            {mock.corners.map((corner) => (
              <div
                key={corner.title}
                className="border-b border-line-strong py-6 first:pt-0 last:border-b-0 last:pb-0"
              >
                <h3 className="text-[21px] text-(--house-ink)">
                  {corner.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-[1.85] text-ink-soft">
                  {corner.text}
                </p>
                <span className="mt-2 block text-[12px] text-(--house-ink)">
                  {corner.time}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section
          className="pt-10 pb-16 max-md:pt-6 max-md:pb-10"
          aria-labelledby="notes-title"
        >
          <div className={sectionHeading}>
            <div>
              <h2 id="notes-title" className={sectionTitle}>
                ฝากไว้บนโต๊ะกลางบ้าน
              </h2>
              <p className={sectionHeadingNote}>
                ความคิดเล็ก ๆ จากเพื่อนของเรา
              </p>
            </div>
            <span className="text-[12px] leading-[1.8] text-(--house-ink) max-md:text-[11px]">
              บันทึกตัวอย่าง
            </span>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-6 max-md:mt-6 max-md:grid-cols-1 max-md:gap-4">
            {members.slice(0, 2).map((c) => (
              <figure
                key={c.type}
                className="flex min-w-0 flex-col items-start gap-6 rounded-tile bg-cream px-8 py-7 shadow-card nth-2:bg-(--band) max-md:px-5 max-md:py-6"
              >
                <figcaption className="flex w-full items-center gap-3 text-(--house-ink)">
                  <Image
                    src={`/characters/reference/chibis/${c.type}.webp`}
                    alt=""
                    width={56}
                    height={56}
                    className="size-14 shrink-0 object-contain"
                  />
                  <span>
                    <strong className="block text-[20px] font-semibold">
                      {c.name}
                    </strong>
                    <small className="mt-1 block text-[12px] leading-[1.6]">
                      {mock.members[c.type as keyof typeof mock.members].role}
                    </small>
                  </span>
                  <span className="ml-auto text-[12px]">{c.type}</span>
                </figcaption>
                <blockquote className="max-w-[36ch] flex-1 text-[21px] leading-[1.8] text-pretty text-(--house-ink) max-md:text-[19px]">
                  {mock.members[c.type as keyof typeof mock.members].quote}
                </blockquote>
                <Link
                  href={`/characters/${c.type.toLowerCase()}`}
                  className="inline-flex min-h-11 items-center gap-2 text-[13px] text-(--house-ink) underline-offset-4 hover:underline"
                >
                  รู้จัก {c.name} ให้มากขึ้น{" "}
                  <ArrowUpRightIcon size={16} aria-hidden="true" />
                </Link>
              </figure>
            ))}
          </div>
        </section>
        <section
          className="flex items-center justify-between gap-8 border-y border-line-strong py-8 max-md:flex-col max-md:items-stretch max-md:gap-5 max-md:py-7"
          aria-labelledby="invite-title"
        >
          <div>
            <h2 id="invite-title" className={sectionTitle}>
              รู้สึกเหมือนอยู่บ้านแล้วหรือยัง?
            </h2>
            <p className="mt-2 text-[14px] text-ink-soft">
              ลองทำความรู้จักตัวเอง แล้วค้นหาบ้านที่เข้ากับคุณ
            </p>
          </div>
          <ChipLink className={`${profilePrimary} gap-3 shrink-0`} href="/quiz">
            ค้นหาบ้านของฉัน <ArrowUpRightIcon size={18} aria-hidden="true" />
          </ChipLink>
        </section>
        <nav className="pt-12 max-md:pt-8" aria-label="บ้านอื่น ๆ">
          <div className={`${sectionHeading} max-md:flex-col`}>
            <h2 className={sectionTitle}>ยังมีเพื่อนรออยู่อีกสามบ้าน</h2>
            <Link className={textLink} href="/houses">
              สำรวจบ้านทั้งสี่ <ArrowRightIcon size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="mx-auto mt-8 grid max-w-[720px] grid-cols-3 gap-6 max-md:mt-5 max-md:gap-2">
            {houses
              .filter((h) => h.id !== house.id)
              .map((h) => (
                <Link
                  key={h.id}
                  href={`/houses/${h.id}`}
                  style={houseVars(h)}
                  className="group flex flex-col items-center gap-3.5 rounded-tile p-2 text-center text-(--house-ink) max-md:p-1"
                >
                  <Image
                    src={houseSigilSrc(h)}
                    alt=""
                    width={80}
                    height={80}
                    className="size-[110px] rounded-[48%_48%_12px_12px] bg-cream object-contain p-[18px] group-hover:-translate-y-0.5 max-md:aspect-square max-md:h-auto max-md:w-[min(100%,80px)] max-md:p-3"
                  />
                  <div>
                    <h3 className="text-[18px] [overflow-wrap:anywhere] text-(--house-ink) max-md:text-[13px]">
                      {h.name}
                    </h3>
                    <p className="mt-1.5 text-[13px] max-md:text-[11px]">
                      {h.thai}
                    </p>
                  </div>
                  <ArrowUpRightIcon
                    size={20}
                    aria-hidden="true"
                    className="hidden"
                  />
                </Link>
              ))}
          </div>
        </nav>
      </div>
    </article>
  );
}
