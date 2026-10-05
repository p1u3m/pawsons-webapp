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
import reference from "@/lib/character-details.json";
import { characters, getCharacter, houseSigilSrc } from "@/lib/data";
import styles from "./profile.module.css";

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

function Keywords({ words, label }: { words: string[]; label: string }) {
  return (
    <ul className={styles.keywords} aria-label={label}>
      {words.map((word) => (
        <li key={word} lang="en">
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
    <article
      className={`${styles.profile} focus-ink motion-reduce:[&_a]:translate-none! motion-reduce:[&_a_svg]:translate-none!`}
      style={houseVars(c.house)}
    >
      <div className={styles.hero}>
        <div className={styles.wrap}>
          <nav className={styles.topNav} aria-label="การนำทางตัวละคร">
            <Link
              href="/characters"
              className={styles.back}
              aria-label="กลับไปหน้าเพื่อนทั้งหมด"
              title="ย้อนกลับ"
            >
              <ArrowLeftIcon size={20} aria-hidden="true" />
            </Link>
          </nav>
          <section className={styles.intro} aria-labelledby="profile-title">
            <div className={styles.portrait}>
              <div className={styles.portraitArt}>
                <Image
                  src={`/characters/reference/chibis/${c.type}.webp`}
                  alt={`${c.name} · ${c.type}`}
                  width={480}
                  height={480}
                  unoptimized
                  preload
                  className={styles.character}
                />
              </div>
            </div>
            <div className={styles.introCopy}>
              <header>
                <h1 id="profile-title" className={styles.name} lang="en">
                  {c.name}
                  <span className={styles.type}>{c.type}</span>
                </h1>
                <h2 className={styles.role} lang="en">
                  {detail.name_en}
                </h2>
              </header>
              <Keywords words={detail.keywords} label="ลักษณะบุคลิก" />
              <div className={styles.tagline}>
                <p lang="en">“{detail.tagline_en}”</p>
                <p>{detail.tagline_th}</p>
              </div>
              <div className={styles.actions}>
                <ChipLink href="/quiz" className={styles.primary}>
                  ค้นหาเพื่อนของคุณ
                  <ArrowUpRightIcon size={18} aria-hidden="true" />
                </ChipLink>
                <div className={styles.secondaryActions}>
                  <ChipLink href={`/contents?character=${c.type}`}>
                    เรื่องเล่าของ {c.name}
                    <ArrowRightIcon size={17} aria-hidden="true" />
                  </ChipLink>
                  <ChipLink href={`/shop?character=${c.type}`}>
                    พา {c.name} กลับบ้าน
                    <ArrowUpRightIcon size={17} aria-hidden="true" />
                  </ChipLink>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className={styles.wrap}>
        <section
          id="about"
          className={styles.about}
          aria-labelledby="about-title"
        >
          <h2 id="about-title" className={styles.sectionTitle}>
            รู้จัก {c.name}
          </h2>
          <p className={styles.description}>{detail.desc}</p>
        </section>
        <section
          id="gallery"
          className={styles.gallery}
          aria-label={`ภาพของ ${c.name}`}
        >
          <CharacterGallery type={c.type} name={c.name} />
        </section>
        <figure className={styles.quote}>
          <span className={styles.quoteMark} aria-hidden="true">
            “
          </span>
          <blockquote>
            <p lang="en">{detail.quote_en}</p>
            <p>{detail.quote_th}</p>
          </blockquote>
          <figcaption>
            <span lang="en">{detail.author_en}</span>
            <span>{detail.author_th}</span>
          </figcaption>
        </figure>
      </div>

      <section
        id="house"
        className={styles.house}
        aria-labelledby="profile-house-title"
      >
        <div className={styles.wrap}>
          <div className={styles.houseIntro}>
            <div className={styles.crest}>
              <Image
                src={houseSigilSrc(c.house)}
                alt={`ตราประจำบ้าน ${c.house.name}`}
                width={300}
                height={300}
                sizes="(max-width: 767px) 180px, 300px"
              />
            </div>
            <div className={styles.houseCopy}>
              <h2 id="profile-house-title" className={styles.houseTitle}>
                {c.house.name} House
              </h2>
              <p className={styles.houseSub} lang="en">
                {house.sub}
              </p>
              <div className={styles.motto}>
                <p>“{house.motto_th}”</p>
                <p lang="en">{house.motto_en}</p>
                <p>{house.latin}</p>
              </div>
              <Keywords words={house.keywords} label="บุคลิกของบ้าน" />
              <div className={styles.houseDescription}>
                {house.desc.split("\n\n").map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <ChipLink
                href={`/houses/${c.house.id}`}
                className={styles.textLink}
              >
                รู้จักบ้าน {c.house.name}
                <ArrowUpRightIcon size={18} aria-hidden="true" />
              </ChipLink>
            </div>
          </div>
          <div className={styles.membersHeading}>
            <h3>สมาชิกในบ้าน</h3>
          </div>
          <div className={styles.members}>
            {members.map((member) => {
              const current = member.type === c.type;
              return (
                <Link
                  key={member.type}
                  href={`/characters/${member.type.toLowerCase()}`}
                  className={styles.member}
                  aria-current={current ? "page" : undefined}
                >
                  <div className={styles.memberArt}>
                    <Image
                      src={member.image}
                      alt=""
                      width={240}
                      height={240}
                      sizes="(max-width: 767px) 40vw, 240px"
                    />
                  </div>
                  <div className={styles.memberCaption}>
                    <strong>{member.name}</strong>
                    <span>{member.type}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <div className={styles.wrap}>
        <nav className={styles.pagination} aria-label="ตัวละครก่อนหน้าและถัดไป">
          <Link href={`/characters/${previous.type.toLowerCase()}`}>
            <ArrowLeftIcon size={20} aria-hidden="true" />
            <FriendFace type={previous.type} />
            <span>
              <small>เพื่อนก่อนหน้า</small>
              <strong>
                {previous.name}
                <em>{previous.type}</em>
              </strong>
            </span>
          </Link>
          <Link href={`/characters/${next.type.toLowerCase()}`}>
            <span>
              <small>เพื่อนถัดไป</small>
              <strong>
                {next.name}
                <em>{next.type}</em>
              </strong>
            </span>
            <FriendFace type={next.type} />
            <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </article>
  );
}

function FriendFace({ type }: { type: string }) {
  return (
    <Image
      className={styles.friendFace}
      src={`/characters/faces/${type}.png`}
      alt=""
      width={162}
      height={124}
      sizes="60px"
    />
  );
}
