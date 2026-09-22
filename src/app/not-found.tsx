import Link from "next/link";
export default function NotFound() {
  return (
    <section className="wrap empty-state">
      <span className="eyebrow">A LITTLE DETOUR</span>
      <h1>ดูเหมือนเราจะหลงทางนิดหน่อย</h1>
      <p>หน้านี้ยังไม่มี แต่เพื่อน ๆ รอคุณอยู่ที่บ้านนะ</p>
      <Link href="/" className="button">
        กลับหน้าแรก ↗
      </Link>
    </section>
  );
}
