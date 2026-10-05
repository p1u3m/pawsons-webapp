import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { pillButton, textLink } from "@/components/pill-button";

export const metadata = { title: "Personal letters" };

/** Letters are not built yet: Jax holds the spot until they are. */
export default function Page() {
  return (
    <section className="flex min-h-[calc(100dvh-160px)] flex-col items-center justify-center px-4 pt-6 pb-[120px] text-center md:pt-24">
      {/* Jax on a soft paper glow, standing on a faint ground shadow. */}
      <div className="relative aspect-square w-[min(72vw,340px)] before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:aspect-square before:w-[70%] before:-translate-1/2 before:rounded-full before:bg-[radial-gradient(circle_at_50%_45%,#fdfcf8_0_58%,rgb(253_252_248/0)_71%)] before:content-[''] after:pointer-events-none after:absolute after:bottom-[9%] after:left-1/2 after:h-[9%] after:w-[62%] after:-translate-x-1/2 after:rounded-full after:bg-[radial-gradient(closest-side,rgb(24_24_24/0.1),rgb(24_24_24/0))] after:content-['']">
        {/* Animated WebP: served as is so every frame survives. */}
        <Image
          className="relative z-1 block h-auto w-full"
          src="/letters/jax.webp"
          alt="Jax ถือประแจอยู่ในมือ"
          width={500}
          height={500}
          priority
          unoptimized
        />
      </div>

      <h1 className="mt-1 mb-3 text-[clamp(28px,4vw,40px)] leading-[1.35] text-balance">
        หน้านี้กำลังสร้างอยู่
      </h1>
      <p className="mx-auto max-w-[36ch] text-body-lg leading-[1.8] text-pretty md:text-body-lg">
        Jax กำลังขันน็อตตัวสุดท้ายให้เข้าที่
        <br />
        ข้ามไปก่อนได้เลย แล้วค่อยแวะกลับมาใหม่นะ
      </p>

      <div className="mt-7 flex flex-col items-center gap-3.5 md:flex-row md:gap-7">
        <Link className={pillButton({ variant: "sign" })} href="/">
          <span>กลับหน้าแรก</span>
        </Link>
        <Link className={textLink} href="/characters">
          ไปหาเพื่อน ๆ ก่อน
          <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
