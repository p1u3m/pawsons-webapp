import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { characters, getCharacter, houses, questions } from "@/lib/data";

const art = (type: string) => getCharacter(type)!.image;

const destinations = [
  {
    href: "/characters",
    title: "Characters",
    desc: `ทำความรู้จักเพื่อนทั้ง ${characters.length} ตัว`,
    tone: "lavender",
    art: (
      <span className="explore-art explore-art--faces">
        {["INTJ", "ENFP", "ISFJ", "ESTP"].map((type) => (
          <Image key={type} src={`/characters/faces/${type}.png`} alt="" width={81} height={62} />
        ))}
      </span>
    ),
  },
  {
    href: "/houses",
    title: "Four Houses",
    desc: `บ้าน ${houses.length} หลัง ตามนิสัยที่ใกล้กัน`,
    tone: "clover",
    art: (
      <span className="explore-art explore-art--crests">
        {houses.map((house) => (
          <Image
            key={house.id}
            src={`/characters/reference/crests/${house.id}s.png`}
            alt=""
            width={48}
            height={80}
          />
        ))}
      </span>
    ),
  },
  {
    href: "/contents",
    title: "Little Stories",
    desc: "เรื่องเล็ก ๆ จากบ้านของเพื่อน ๆ",
    tone: "forget",
    art: (
      <span className="explore-art explore-art--story">
        <span className="explore-page" />
        <Image src={art("INFP")} alt="" width={72} height={60} />
      </span>
    ),
  },
  {
    href: "/shop",
    title: "Bring a friend home",
    desc: "ตุ๊กตาและของน่ารักจากเพื่อน ๆ",
    tone: "dandelion",
    art: (
      <span className="explore-art explore-art--shop">
        <Image src={art("ESFP")} alt="" width={88} height={74} />
        <span className="explore-tag">
          <HeartIcon size={14} weight="fill" />
        </span>
      </span>
    ),
  },
];

export function ExploreDestinations() {
  return (
    <section className="minimal-explore" data-reveal>
      <div className="wrap">
        <h2 className="explore-heading">ไปเที่ยวต่อที่ไหนดี?</h2>
        <nav className="explore-grid" aria-label="สำรวจหน้าอื่นใน Pawsons">
          <Link href="/quiz" className="explore-card explore-card--feature">
            <span className="explore-art explore-art--quiz" aria-hidden="true">
              {["INTJ", "ENFP", "ESTP"].map((type) => (
                <Image key={type} src={art(type)} alt="" width={120} height={100} />
              ))}
              <span className="explore-bubble">?</span>
            </span>
            <span className="explore-copy">
              <span className="explore-card-title">Find your Pawson</span>
              <span className="explore-card-desc">
                ตอบ {questions.length} คำถามสั้น ๆ แล้วมาดูว่าเพื่อนตัวไหนคือคุณ
              </span>
              <span className="explore-go">
                เริ่มเลย <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
              </span>
            </span>
          </Link>

          {destinations.map((item) => (
            <Link
              href={item.href}
              className="explore-card"
              data-tone={item.tone}
              key={item.href}
            >
              <span aria-hidden="true">{item.art}</span>
              <span className="explore-copy">
                <span className="explore-card-title">{item.title}</span>
                <span className="explore-card-desc">{item.desc}</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
