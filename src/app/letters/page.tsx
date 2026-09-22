import Link from "next/link";
import { CharacterImage } from "@/components/ui";
import { characters } from "@/lib/data";

export const metadata = { title: "Personal letters" };

export default function Page() {
  return (
    <section className="wrap letters-page">
      <div className="letters-card">
        <div className="letter-illustration">
          <CharacterImage character={characters[9]} />
          <div className="envelope">
            <span>To: you</span>
            <span>with a little love</span>
          </div>
        </div>
        <span className="eyebrow">PERSONAL LETTERS</span>
        <h1 style={{ marginTop: "16px" }}>
          บางความรู้สึกดี ๆ<br />
          ก็คุ้มค่ากับการรอ
        </h1>
        <p>
          จดหมายจากเพื่อนตัวน้อยที่เขียนถึงคุณโดยตรง
          <br />
          ไม่ต้องรีบตอบ แค่ค่อย ๆ อ่านในวันที่พร้อม
        </p>
        <div>
          <span className="coming-label">
            กำลังเตรียมจดหมายฉบับแรก · เร็ว ๆ นี้
          </span>
        </div>
        <div style={{ marginTop: "24px" }}>
          <Link className="text-link" href="/characters">
            <span>ระหว่างรอ แวะไปหาเพื่อน ๆ</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
