import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { ChipLink, HouseBand, houseVars } from "@/components/character-ui";
import {
  characters,
  houses,
  houseSigilSrc,
  houseBackground,
  type House,
} from "@/lib/data";
import styles from "./house-detail.module.css";
import profile from "../../characters/[type]/profile.module.css";

import { houseDetails } from "./house-details";

export default function HouseDetail({ house }: { house: House }) {
  const mock = houseDetails[house.id];
  const members = characters.filter((c) => c.house.id === house.id);
  return (
    <article className={`${styles.page} focus-ink`} style={houseVars(house)}>
      <header className={profile.hero}>
        <div className={styles.wrap}>
          <nav className={profile.topNav} aria-label="การนำทางบ้าน">
            <Link
              href="/houses"
              className={profile.back}
              aria-label="กลับไปบ้านทั้งสี่"
              title="กลับไปบ้านทั้งสี่"
            >
              <ArrowLeftIcon size={20} aria-hidden="true" />
            </Link>
          </nav>
          <div className={profile.intro}>
            <div className={profile.portrait}>
              <div className={profile.portraitArt}>
                <Image
                  src={houseSigilSrc(house)}
                  alt={`ตราบ้าน ${house.name}`}
                  width={380}
                  height={380}
                  preload
                  className={styles.crest}
                />
              </div>
            </div>
            <div className={profile.introCopy}>
              <h1 className={styles.title} lang="en">
                {house.name} <span>House</span>
              </h1>
              <h2 className={profile.role}>{house.thai}</h2>
              <p className={styles.group} lang="en">
                {house.groupTitle}
              </p>
              <ul className={profile.keywords} aria-label="บรรยากาศของบ้าน">
                {mock.traits.map((trait) => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
              <div className={profile.tagline}>
                <p lang="en">“{house.motto}”</p>
                <p>{house.description}</p>
              </div>
              <ul
                className={styles.heroMembers}
                aria-label={`สมาชิกบ้าน ${house.name}`}
              >
                {members.map((c) => (
                  <li key={c.type}>
                    <Link href={`/characters/${c.type.toLowerCase()}`}>
                      <Image
                        src={`/characters/faces/${c.type}.png`}
                        alt=""
                        width={162}
                        height={124}
                        sizes="76px"
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
      <div className={styles.wrap}>
        <section className={styles.welcome} aria-labelledby="welcome-title">
          <div>
            <h2 id="welcome-title">
              {mock.welcome[0]}
              <br />
              {mock.welcome[1]}
            </h2>
            <p className={styles.mockLabel}>
              เรื่องราวและบันทึกในบ้านเป็นข้อมูลตัวอย่าง
            </p>
          </div>
          <div>
            <p>{mock.story}</p>
            <ChipLink className={styles.welcomeAction} href="#house-members">
              รู้จักเพื่อนในบ้าน <ArrowRightIcon size={18} aria-hidden="true" />
            </ChipLink>
          </div>
        </section>
      </div>
      <HouseBand className={styles.memberBand}>
        <div className={styles.wrap}>
          <section
            id="house-members"
            className={styles.members}
            aria-labelledby="members-title"
          >
            <div className={styles.sectionHeading}>
              <div>
                <h2 id="members-title">เพื่อนร่วมบ้าน {house.name}</h2>
                <p>ต่างคนต่างคิด แต่ทุกคนมีที่ของตัวเอง</p>
              </div>
              <span>สมาชิกทั้ง 4 ตัว</span>
            </div>
            <div className={styles.memberGrid}>
              {members.map((c) => {
                const detail =
                  mock.members[c.type as keyof typeof mock.members];
                return (
                  <Link
                    key={c.type}
                    href={`/characters/${c.type.toLowerCase()}`}
                    className={styles.member}
                  >
                    <div
                      className={styles.memberArt}
                      style={{ background: houseBackground(house) }}
                    >
                      <Image
                        src={`/characters/reference/chibis/${c.type}.webp`}
                        alt={`${c.name} สมาชิกบ้าน ${house.name}`}
                        width={360}
                        height={360}
                        sizes="(max-width: 600px) 44vw, (max-width: 900px) 40vw, 240px"
                      />
                    </div>
                    <div className={styles.memberCopy}>
                      <h3>
                        {c.name}
                        <span className={styles.type}>{c.type}</span>
                      </h3>
                      <p className={styles.role}>{detail.role}</p>
                      <p>{detail.note}</p>
                      <span className={styles.profileLink}>
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
      <div className={styles.wrap}>
        <section className={styles.corners} aria-labelledby="corners-title">
          <div className={styles.cornerIntro}>
            <h2 id="corners-title">
              มุมเล็ก ๆ<br />
              ที่เราเรียกว่าบ้าน
            </h2>
            <p>
              ไม่ว่าจะอยากอยู่กับตัวเอง
              <br />
              หรือแบ่งปันไอเดียกับใครสักคน
            </p>
          </div>
          <div className={styles.cornerList}>
            {mock.corners.map((corner) => (
              <div key={corner.title}>
                <h3>{corner.title}</h3>
                <p>{corner.text}</p>
                <span>{corner.time}</span>
              </div>
            ))}
          </div>
        </section>
        <section className={styles.notes} aria-labelledby="notes-title">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="notes-title">ฝากไว้บนโต๊ะกลางบ้าน</h2>
              <p>ความคิดเล็ก ๆ จากเพื่อนของเรา</p>
            </div>
            <span className={styles.mockLabel}>บันทึกตัวอย่าง</span>
          </div>
          <div className={styles.noteGrid}>
            {members.slice(0, 2).map((c) => (
              <figure key={c.type} className={styles.note}>
                <figcaption>
                  <Image
                    src={`/characters/reference/chibis/${c.type}.webp`}
                    alt=""
                    width={56}
                    height={56}
                  />
                  <span>
                    <strong>{c.name}</strong>
                    <small>
                      {mock.members[c.type as keyof typeof mock.members].role}
                    </small>
                  </span>
                  <span className={styles.noteType}>{c.type}</span>
                </figcaption>
                <blockquote>
                  {mock.members[c.type as keyof typeof mock.members].quote}
                </blockquote>
                <Link
                  href={`/characters/${c.type.toLowerCase()}`}
                  className={styles.noteLink}
                >
                  รู้จัก {c.name} ให้มากขึ้น{" "}
                  <ArrowUpRightIcon size={16} aria-hidden="true" />
                </Link>
              </figure>
            ))}
          </div>
        </section>
        <section className={styles.invitation} aria-labelledby="invite-title">
          <div>
            <h2 id="invite-title">รู้สึกเหมือนอยู่บ้านแล้วหรือยัง?</h2>
            <p>ลองทำความรู้จักตัวเอง แล้วค้นหาบ้านที่เข้ากับคุณ</p>
          </div>
          <ChipLink className={profile.primary} href="/quiz">
            ค้นหาบ้านของฉัน <ArrowUpRightIcon size={18} aria-hidden="true" />
          </ChipLink>
        </section>
        <nav className={styles.otherHouses} aria-label="บ้านอื่น ๆ">
          <div className={styles.sectionHeading}>
            <h2>ยังมีเพื่อนรออยู่อีกสามบ้าน</h2>
            <Link className={styles.textLink} href="/houses">
              สำรวจบ้านทั้งสี่ <ArrowRightIcon size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.otherGrid}>
            {houses
              .filter((h) => h.id !== house.id)
              .map((h) => (
                <Link key={h.id} href={`/houses/${h.id}`} style={houseVars(h)}>
                  <Image src={houseSigilSrc(h)} alt="" width={80} height={80} />
                  <div>
                    <h3>{h.name}</h3>
                    <p>{h.thai}</p>
                  </div>
                  <ArrowUpRightIcon size={20} aria-hidden="true" />
                </Link>
              ))}
          </div>
        </nav>
      </div>
    </article>
  );
}
