import Link from "next/link";
import { characters } from "@/lib/data";
import { HeroChibis } from "@/components/hero-chibis";
import { ExploreDestinations } from "@/components/explore-destinations";

export default function Home() {
  return (
    <>
      {/* ── MINIMAL HERO ── */}
      <section className="minimal-hero">
        <div className="hero-center">
          <HeroChibis characters={characters} />

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
          <Link href="/quiz" className="button pawson-sign">
            <span>Find your Pawson</span>
          </Link>
        </div>
      </section>

      <ExploreDestinations />
    </>
  );
}
