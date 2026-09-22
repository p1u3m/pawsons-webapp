import Link from "next/link";
import Image from "next/image";
import { characters, houses } from "@/lib/data";
import { CharacterImage, CharacterCard } from "@/components/ui";
import { CharacterSlider } from "@/components/character-slider";

export default function Home() {
  return (
    <>
      <section className="entry-hero wrap">
        <div className="hero-copy">
          <span className="eyebrow">WELCOME TO PAWSONS</span>
          <h1>
            A little place
            <br />
            to be <span className="gentle-word">you.</span>
          </h1>
          <p>
            พักจากโลกที่เร่งรีบ แล้วมาเป็นตัวเอง
            <br />
            กับเพื่อนตัวน้อยที่เข้าใจคุณ
          </p>
          <Link href="/quiz" className="button pawson-gradient">
            <span>Find your Pawson</span>
            <span className="icon-disc" aria-hidden="true">
              ↗
            </span>
          </Link>
        </div>
        <div className="hero-art" aria-label="เพื่อนจากบ้านทั้งสี่ของ Pawsons">
          <div className="hero-orbit" />
          <div className="hero-friend friend-one">
            <CharacterImage character={characters[0]} priority />
          </div>
          <div className="hero-friend friend-two">
            <CharacterImage character={characters[9]} priority />
          </div>
          <div className="hero-friend friend-three">
            <CharacterImage character={characters[5]} priority />
          </div>
          <div className="hero-friend friend-four">
            <CharacterImage character={characters[15]} priority />
          </div>
          <span className="art-note">come as you are.</span>
        </div>
      </section>

      <section className="explore-section wrap" data-reveal>
        <div className="section-heading">
          <span className="eyebrow">A SANCTUARY FOR YOU</span>
          <h2 style={{ marginTop: "12px" }}>วันนี้อยากแวะไปที่ไหน?</h2>
          <p>ไม่มีทางที่ถูกหรือผิด เริ่มจากสิ่งที่ใจอยากรู้</p>
        </div>
        <div className="entry-grid">
          <Link href="/quiz" className="entry-tile quiz-tile">
            <span className="tile-kicker">A MOMENT FOR YOURSELF</span>
            <h3>
              Which Pawson
              <br />
              feels like you?
            </h3>
            <p>แบบทดสอบเล็ก ๆ เพื่อรู้จักตัวเองอีกนิด</p>
            <span className="tile-link">
              <span>เริ่มทำแบบทดสอบ</span>
              <span className="tile-link-icon" aria-hidden="true">↗</span>
            </span>
            <Image
              src="/houses/บ้านเขียว.png"
              alt=""
              width={160}
              height={160}
            />
          </Link>

          <Link href="/characters" className="entry-tile character-tile">
            <div>
              <span className="tile-kicker" style={{ color: "#674277" }}>OUR LITTLE FRIENDS</span>
              <h3>Characters</h3>
              <p>
                16 ตัวตนที่แตกต่าง
                <br />
                และน่ารักในแบบของตัวเอง
              </p>
            </div>
            <CharacterImage character={characters[7]} />
            <span className="tile-link">
              <span>รู้จักเพื่อน ๆ</span>
              <span className="tile-link-icon" aria-hidden="true">↗</span>
            </span>
          </Link>

          <Link href="/houses" className="entry-tile house-tile">
            <div>
              <span className="tile-kicker" style={{ color: "#7A5E12" }}>THE FOUR HOUSES</span>
              <h3>
                Four houses.
                <br />
                Room for everyone.
              </h3>
            </div>
            <div className="sigil-row">
              {houses.map((h) => (
                <Image
                  key={h.id}
                  src={`/houses/${h.sigil}`}
                  alt={h.name}
                  width={64}
                  height={64}
                />
              ))}
            </div>
            <span className="tile-link">
              <span>สำรวจบ้านทั้งสี่</span>
              <span className="tile-link-icon" aria-hidden="true">↗</span>
            </span>
          </Link>
        </div>

        <div className="entry-small-grid">
          <Link href="/contents">
            <span className="entry-number">01</span>
            <div>
              <h3>Little stories</h3>
              <p>เรื่องเล่าที่อาจเหมือนวันของคุณ</p>
            </div>
            <span className="entry-small-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link href="/shop">
            <span className="entry-number">02</span>
            <div>
              <h3>Bring a friend home</h3>
              <p>พาความน่ารักกลับไปอยู่ใกล้ ๆ</p>
            </div>
            <span className="entry-small-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link href="/letters">
            <span className="entry-number">03</span>
            <div>
              <h3>A letter for you</h3>
              <p>จดหมายจากเพื่อนตัวน้อย · เร็ว ๆ นี้</p>
            </div>
            <span className="entry-small-arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="friends-section wrap" data-reveal>
        <div className="section-heading">
          <span className="eyebrow">FAMILIAR HEARTS</span>
          <h2 style={{ marginTop: "12px" }}>
            Different hearts.
            <br />A familiar feeling.
          </h2>
          <p>บางที คุณอาจเจอตัวเองในใครสักคนที่นี่</p>
        </div>
        <CharacterSlider characters={characters} />
        <div className="section-end">
          <Link className="text-link" href="/characters">
            <span>รู้จักเพื่อนทั้ง 16 ตัว</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="home-letter wrap" data-reveal>
        <Image src="/houses/บ้านเขียว.png" width={90} height={90} alt="" />
        <p>
          “ไม่ต้องเป็นคนที่เก่งที่สุดก็ได้
          <br />
          เป็นตัวเองในวันนี้ ก็เพียงพอแล้ว”
        </p>
        <span>With a little love, Pawsons</span>
      </section>
    </>
  );
}
