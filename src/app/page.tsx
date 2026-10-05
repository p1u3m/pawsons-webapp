import Link from "next/link";
import { Sarina } from "next/font/google";
import { characters } from "@/lib/data";
import { HeroChibis } from "@/components/hero-chibis";
import { ExploreDestinations } from "@/components/explore-destinations";
import { pillButton } from "@/components/pill-button";
import { cn } from "@/lib/utils";

const sarina = Sarina({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  return (
    <div>
      <section className="relative flex min-h-[calc(100svh-56px)] items-center justify-center overflow-hidden px-5 pt-8 pb-24 md:min-h-[calc(100svh-64px)] md:px-8 md:pt-12 md:pb-28 tiny:px-4">
        <div className="relative z-5 flex w-full flex-col items-center text-center">
          <HeroChibis
            characters={characters}
            className="mb-5 w-full max-w-[360px] md:mb-7 md:max-w-[640px]"
          />

          <h1 className="text-[clamp(28px,7.7vw,36px)] leading-[1.1] tracking-[-0.025em] md:text-[clamp(42px,5vw,68px)]">
            A little place
            <br />
            <span
              className={cn(
                sarina.className,
                "inline-block bg-[linear-gradient(90deg,#dca4b9_0%,#b7a4d7_20%,#94bfdc_40%,#9fc6b2_60%,#dec58e_80%,#dca4b9_100%)] bg-[length:200%_100%] bg-clip-text px-[0.15em] pb-[0.08em] text-[clamp(30px,8.5vw,38px)] leading-[1.15] font-normal tracking-normal whitespace-nowrap text-green [-webkit-text-fill-color:transparent] md:text-[clamp(48px,4.5vw,68px)] forced-colors:bg-none forced-colors:text-[CanvasText] forced-colors:[-webkit-text-fill-color:currentColor]",
              )}
            >
              to be you.
            </span>
          </h1>

          <p className="mt-5 max-w-[640px] text-body leading-[1.85] text-pretty md:mt-6 md:text-body-lg">
            พักเรื่องวุ่นวายไว้สักครู่ แล้วให้เวลากับตัวเอง
            <br />
            ค่อย ๆ รู้จักตัวเอง ผ่านเพื่อนตัวน้อยในโลกของ Pawsons
          </p>
          <Link
            href="/quiz"
            className={cn(pillButton({ variant: "sign" }), "mt-6 md:mt-7")}
          >
            <span>Find your Pawson</span>
          </Link>
        </div>
      </section>

      <ExploreDestinations />
    </div>
  );
}
