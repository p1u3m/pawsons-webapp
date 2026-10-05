import Link from "next/link";
import { Sarina } from "next/font/google";
import { characters } from "@/lib/data";
import { HeroChibis } from "@/components/hero-chibis";
import { ExploreDestinations } from "@/components/explore-destinations";
import { pillButton } from "@/components/pill-button";
import { cn } from "@/lib/utils";
import styles from "./home.module.css";

const sarina = Sarina({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  return (
    <div
      className={`${styles.home}`}
    >
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <HeroChibis characters={characters} className={styles.heroArt} />

          <h1 className={styles.title}>
            A little place
            <br />
            <span className={cn(sarina.className, styles.tagline)}>
              to be you.
            </span>
          </h1>

          <p className={styles.invitation}>
            พักเรื่องวุ่นวายไว้สักครู่ แล้วให้เวลากับตัวเอง
            <br />
            ค่อย ๆ รู้จักตัวเอง ผ่านเพื่อนตัวน้อยในโลกของ Pawsons
          </p>
          <Link
            href="/quiz"
            className={cn(pillButton({ variant: "sign" }), styles.quizAction)}
          >
            <span>Find your Pawson</span>
          </Link>
        </div>
      </section>

      <ExploreDestinations />
    </div>
  );
}
