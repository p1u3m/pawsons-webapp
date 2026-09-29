import Link from "next/link";
import Image from "next/image";
import { characters } from "@/lib/data";
import { SlotReel } from "@/components/slot-reel";
import { EXPLORE_WAVY_PATHS } from "@/components/explore-card-shapes";

export default function Home() {
  return (
    <>
      {/* ── MINIMAL HERO: Slot Reel ── */}
      <section className="minimal-hero">
        <div className="hero-center">
          <SlotReel characters={characters} />

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

      {/* ── EXPLORE DESTINATIONS ── */}
      <section className="minimal-explore" data-reveal>
        <div className="wrap">
          <nav className="explore-grid" aria-label="สำรวจหน้าอื่นใน Pawsons">
            {[
              {
                href: "/quiz",
                icon: "icon-little-quirks",
                title: "Find your Pawson",
              },
              {
                href: "/characters",
                icon: "icon-clothing",
                title: "Characters",
              },
              {
                href: "/houses",
                icon: "icon-interior-sets",
                title: "Four Houses",
              },
              {
                href: "/contents",
                icon: "icon-facilites",
                title: "Little Stories",
              },
              {
                href: "/shop",
                icon: "icon-treasures",
                title: "Bring a friend home",
              },
            ].map((item, idx) => (
              <Link href={item.href} className="explore-card" key={item.href}>
                <svg
                  className="explore-card-bg"
                  viewBox="0 0 180 180"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id={`explore-wave-${idx}`}
                      patternUnits="userSpaceOnUse"
                      width="80"
                      height="80"
                    >
                      <image href="/pawson-wave-tile.svg" width="80" height="80" />
                    </pattern>
                  </defs>
                  <path
                    d={EXPLORE_WAVY_PATHS[idx % EXPLORE_WAVY_PATHS.length]}
                    className="explore-card-shape"
                  />
                  <path
                    d={EXPLORE_WAVY_PATHS[idx % EXPLORE_WAVY_PATHS.length]}
                    className="explore-card-pattern"
                    fill={`url(#explore-wave-${idx})`}
                  />
                </svg>
                <span className="explore-card-inner">
                  <span className="explore-card-icon" aria-hidden="true">
                    <Image
                      src={`/explore/placeholders/${item.icon}.png`}
                      alt=""
                      width={110}
                      height={90}
                    />
                  </span>
                  <span className="explore-card-title">{item.title}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </>
  );
}
