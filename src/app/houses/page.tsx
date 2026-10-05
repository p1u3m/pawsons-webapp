import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { ChipLink, HouseBand, houseVars } from "@/components/character-ui";
import { characters, houses } from "@/lib/data";
import { HouseCrest, crestSrc } from "./house-ui";
import styles from "./houses.module.css";

export const metadata = { title: "Four houses" };

export default function Page() {
  return (
    <div
      className={`${styles.page} focus-ink motion-reduce:[&_a]:translate-none! motion-reduce:[&_svg]:translate-none!`}
    >
      <section className={styles.intro} aria-labelledby="houses-title">
        <h1 id="houses-title">บ้านไหนที่เป็นคุณ</h1>
        <nav aria-label="เลือกบ้าน" className={styles.selector}>
          <ul>
            {houses.map((house) => (
              <li key={house.id} style={houseVars(house)}>
                <a
                  href={`#${house.id}`}
                  className={styles.houseChoice}
                  aria-label={`ไปยังบ้าน ${house.name}`}
                >
                  <span className={styles.choiceArt}>
                    <Image
                      src={crestSrc(house)}
                      alt=""
                      width={160}
                      height={160}
                      sizes="(min-width: 768px) 104px, 64px"
                    />
                  </span>
                  <span className={styles.choiceName} lang="en">
                    {house.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      {houses.map((house, index) => {
        const members = characters.filter(
          (character) => character.house.id === house.id,
        );
        return (
          <HouseBand
            key={house.id}
            id={house.id}
            style={houseVars(house)}
            className={styles.band}
            aria-labelledby={`house-${house.id}`}
          >
            <div
              className={styles.houseLayout}
              data-flip={index % 2 === 1 || undefined}
            >
              <HouseCrest
                house={house}
                priority={index === 0}
                className={styles.crest}
              />
              <div className={styles.copy}>
                <header>
                  <h2 id={`house-${house.id}`} lang="en">
                    {house.name}
                  </h2>
                  <p className={styles.thai}>{house.thai}</p>
                  <p className={styles.group} lang="en">
                    {house.groupTitle}
                  </p>
                </header>
                <p className={styles.motto} lang="en">
                  “{house.motto}”
                </p>
                <p className={styles.description}>{house.description}</p>
                <ChipLink
                  href={`/houses/${house.id}`}
                  className={styles.houseButton}
                >
                  รู้จักบ้าน {house.name}
                  <ArrowUpRightIcon size={16} aria-hidden="true" />
                </ChipLink>
                <ul
                  className={styles.members}
                  aria-label={`สมาชิกบ้าน ${house.name}`}
                >
                  {members.map((character) => (
                    <li key={character.type}>
                      <Link
                        href={`/characters/${character.type.toLowerCase()}`}
                        className={styles.member}
                      >
                        <Image
                          src={`/characters/faces/${character.type}.png`}
                          alt=""
                          width={162}
                          height={124}
                          sizes="(max-width: 767px) 18vw, 76px"
                          className={styles.face}
                        />
                        <span>{character.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </HouseBand>
        );
      })}
    </div>
  );
}
