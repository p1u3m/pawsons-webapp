import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { characters, houses } from "@/lib/data";
import titleStyles from "@/components/section-title.module.css";
import { crestSrc, houseBandStyle } from "./house-style";
import HousesMotion from "./houses-motion";

export const metadata = { title: "Four houses" };

export default function Page() {
  return (
    <HousesMotion>
      <section className="wrap houses-hero">
        <h1>
          บ้านทั้งสี่
          <br />
          ในโลกใบเล็ก
        </h1>
        <p>แต่ละบ้านมีเสน่ห์ต่างกัน แต่ทุกบ้านอบอุ่นในแบบของตัวเอง</p>
      </section>

      {houses.map((h, i) => {
        const members = characters.filter((c) => c.house.id === h.id);
        return (
          <section
            key={h.id}
            id={h.id}
            className="chars-band"
            style={houseBandStyle(h)}
            aria-labelledby={`house-${h.id}`}
          >
            <div className={`wrap houses-row${i % 2 ? " houses-row--flip" : ""}`}>
              <div className="houses-crest doodle-bg doodle-bg--2" aria-hidden="true">
                <Image
                  src={crestSrc(h)}
                  alt=""
                  width={320}
                  height={320}
                  priority={i === 0}
                />
              </div>

              <div className="houses-copy">
                <p className="houses-group">{h.groupTitle}</p>
                <h2 id={`house-${h.id}`}>
                  <span className={`${titleStyles.label} houses-name`}>{h.name}</span>
                  <small>{h.thai}</small>
                </h2>
                <p className="houses-motto" lang="en">
                  “{h.motto}”
                </p>
                <p className="houses-desc">{h.description}</p>

                <ul className="houses-members" aria-label={`สมาชิกบ้าน ${h.name}`}>
                  {members.map((c) => (
                    <li key={c.type}>
                      <Link href={`/characters/${c.type.toLowerCase()}`}>
                        <Image
                          src={`/characters/faces/${c.type}.png`}
                          alt=""
                          width={81}
                          height={62}
                        />
                        <span>{c.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link className="chars-link houses-cta" href={`/houses/${h.id}`}>
                  แวะเข้าบ้าน {h.name}
                  <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </HousesMotion>
  );
}
