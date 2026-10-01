import Link from "next/link";
import { characters } from "@/lib/data";
import { HeroChibis } from "@/components/hero-chibis";
import { ExploreDestinations } from "@/components/explore-destinations";
import { pillButton } from "@/components/pill-button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <>
      {/* The bottom padding keeps the content clear of the explore band's wave. */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-8 pt-[100px] pb-[60px] md:pb-[144px] max-md:min-h-[calc(100dvh-10px)] max-md:px-5 max-md:pt-9 max-md:pb-[54px] max-xs:px-4 max-xs:pt-6 max-xs:pb-12">
        <div className="relative z-5 flex flex-col items-center text-center max-md:-mt-6 max-xs:-mt-7 tiny:-mt-5">
          <HeroChibis characters={characters} />

          <h1 className="text-[clamp(42px,5.5vw,72px)] leading-[1.1] tracking-[-2.5px] max-md:text-[34px] max-md:tracking-[-1.2px] max-xs:text-[30px] max-xs:tracking-[-1px] tiny:text-[26px]">
            A little place
            <br />
            to be <span className="relative inline-block text-green">you.</span>
          </h1>

          <p className="max-w-[440px] text-[18px] leading-[1.85] max-md:mt-0.5 max-md:text-[15px]">
            พักจากโลกที่เร่งรีบ แล้วมาเป็นตัวเอง
            <br />
            กับเพื่อนตัวน้อยที่เข้าใจคุณ
          </p>
          <Link href="/quiz" className={cn(pillButton({ variant: "sign" }), "mt-7 max-md:mt-5")}>
            <span>Find your Pawson</span>
          </Link>
        </div>
      </section>

      <ExploreDestinations />
    </>
  );
}
