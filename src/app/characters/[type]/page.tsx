import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import CharacterGallery from "@/components/character-gallery";
import reference from "@/lib/character-details.json";
import { characters, getCharacter } from "@/lib/data";
import "../character-detail.css";

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
    <article
      className="character-profile"
      style={
        {
          "--profile-accent": c.house.badgeColor,
          "--profile-ink": c.house.ink,
          "--profile-tint": c.house.color,
          "--profile-pattern": `url("/patterns/house-${c.house.id}.svg")`,
        } as React.CSSProperties
      }
    >
      <div className="profile-hero">
        <div className="wrap profile-wrap">
          <nav className="profile-top" aria-label="การนำทางตัวละคร">
            <Link href="/characters" className="profile-back">
              <ArrowLeftIcon size={16} aria-hidden="true" />
              เพื่อนทั้งหมด
            </Link>
            <Link className="profile-house-chip" href={`/houses/${c.house.id}`}>
              <span />
              {c.house.name} House
              <ArrowUpRightIcon size={14} aria-hidden="true" />
            </Link>
          </nav>

          <section className="profile-intro" aria-labelledby="profile-title">
            <header className="profile-heading">
              <h1 id="profile-title">
                {c.type} <span className="profile-name-pill">{c.name}</span>
              </h1>
              <h2>{detail.name_en}</h2>
            </header>
            <div className="profile-portrait doodle-bg">
              <Image
                src={`/characters/reference/chibis/${c.type}.webp`}
                alt={`${c.name} · ${c.type}`}
                width={360}
                height={360}
                unoptimized
                preload
              />
            </div>
            <ul className="profile-keywords" aria-label="ลักษณะบุคลิก">
              {detail.keywords.map((word) => (
                <li key={word}>{word}</li>
              ))}
            </ul>
            <div className="profile-tagline">
              <p lang="en">{detail.tagline_en}</p>
              <p>{detail.tagline_th}</p>
            </div>
            <p className="profile-description">{detail.desc}</p>
            <div className="profile-cta-row">
              <Link href="/quiz" className="profile-button">
                ค้นหาเพื่อนของคุณ
                <span className="profile-icon-disc" aria-hidden="true">
                  <ArrowUpRightIcon size={16} weight="bold" />
                </span>
              </Link>
              <Link
                href={`/contents?character=${c.type}`}
                className="profile-chip"
              >
                เรื่องเล่าของ {c.name}
                <span className="profile-icon-disc" aria-hidden="true">
                  <ArrowRightIcon size={14} weight="bold" />
                </span>
              </Link>
              <Link href={`/shop?character=${c.type}`} className="profile-chip">
                พา {c.name} กลับบ้าน
                <span className="profile-icon-disc" aria-hidden="true">
                  <ArrowUpRightIcon size={14} weight="bold" />
                </span>
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="wrap profile-wrap">
        <section
          className="profile-gallery-section"
          aria-labelledby="gallery-title"
        >
          <div className="profile-section-heading">
            <h2 id="gallery-title">อีกหลายมุมของ {c.name}</h2>
          </div>
          <CharacterGallery type={c.type} name={c.name} />
        </section>

        <figure className="profile-quote">
          <span className="profile-quote-mark" aria-hidden="true">
            “
          </span>
          <blockquote>
            <p lang="en">“{detail.quote_en}”</p>
            <p>{detail.quote_th}</p>
          </blockquote>
          <figcaption>
            {detail.author_en}
            <span>{detail.author_th}</span>
          </figcaption>
        </figure>
      </div>

      <section className="profile-house" aria-labelledby="profile-house-title">
        <div className="wrap profile-wrap">
          <div className="profile-house-story">
            <div className="profile-house-crest doodle-bg doodle-bg--3">
              <Image
                src={`/characters/reference/crests/${house.slug}.png`}
                alt={`ตราประจำบ้าน ${c.house.name}`}
                width={280}
                height={280}
                sizes="(max-width: 767px) 200px, 280px"
              />
            </div>
            <div className="profile-house-copy">
              <div className="profile-house-intro">
                <p className="profile-eyebrow">{house.sub}</p>
                <h2 id="profile-house-title">{c.house.name} House</h2>
                <div className="profile-motto">
                  <p>“{house.motto_th}”</p>
                  <p lang="en">{house.motto_en}</p>
                  <p>{house.latin}</p>
                </div>
                <ul className="profile-keywords" aria-label="บุคลิกของบ้าน">
                  {house.keywords.map((word) => (
                    <li key={word}>{word}</li>
                  ))}
                </ul>
              </div>
              <div className="profile-house-lore">
                <div className="profile-house-description">
                  {house.desc.split("\n\n").map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <Link
                  className="profile-text-link"
                  href={`/houses/${c.house.id}`}
                >
                  รู้จักบ้าน {c.house.name}
                  <ArrowUpRightIcon size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
          <div className="profile-section-heading">
            <h3>สมาชิกในบ้าน</h3>
          </div>
          <div className="profile-members">
            {members.map((member, i) => (
              <Link
                key={member.type}
                href={`/characters/${member.type.toLowerCase()}`}
                className="profile-member"
                aria-current={member.type === c.type ? "page" : undefined}
              >
                {/* A different doodle shape for each friend. */}
                <div className={`doodle-bg doodle-bg--${(i % 3) + 1}`}>
                  <Image
                    src={member.image}
                    alt=""
                    width={220}
                    height={220}
                    sizes="(max-width: 767px) 22vw, 220px"
                  />
                </div>
                <strong>{member.name}</strong>
                <span>{member.type}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap profile-wrap profile-bottom">
        <nav
          className="profile-pagination"
          aria-label="ตัวละครก่อนหน้าและถัดไป"
        >
          <Link href={`/characters/${previous.type.toLowerCase()}`}>
            <ArrowLeftIcon size={18} aria-hidden="true" />
            <Image
              className="profile-face"
              src={`/characters/faces/${previous.type}.png`}
              alt=""
              width={162}
              height={124}
              sizes="60px"
            />
            <span>
              <small>เพื่อนก่อนหน้า</small>
              <strong>
                {previous.name} · {previous.type}
              </strong>
            </span>
          </Link>
          <Link href={`/characters/${next.type.toLowerCase()}`}>
            <span>
              <small>เพื่อนถัดไป</small>
              <strong>
                {next.name} · {next.type}
              </strong>
            </span>
            <Image
              className="profile-face"
              src={`/characters/faces/${next.type}.png`}
              alt=""
              width={162}
              height={124}
              sizes="60px"
            />
            <ArrowRightIcon size={18} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </article>
  );
}
