import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import "./letters.css";

export const metadata = { title: "Personal letters" };

/** Letters are not built yet: Jax holds the spot until they are. */
export default function Page() {
  return (
    <section className="letters">
      <div className="letters-stage">
        {/* Animated WebP: served as is so every frame survives. */}
        <Image
          className="letters-jax"
          src="/letters/jax.webp"
          alt="Jax ถือประแจอยู่ในมือ"
          width={500}
          height={500}
          priority
          unoptimized
        />
      </div>

      <h1>หน้านี้กำลังสร้างอยู่</h1>
      <p>
        Jax กำลังขันน็อตตัวสุดท้ายให้เข้าที่
        <br />
        ข้ามไปก่อนได้เลย แล้วค่อยแวะกลับมาใหม่นะ
      </p>

      <div className="letters-actions">
        <Link className="button pawson-sign" href="/">
          <span>กลับหน้าแรก</span>
        </Link>
        <Link className="text-link" href="/characters">
          ไปหาเพื่อน ๆ ก่อน
          <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
