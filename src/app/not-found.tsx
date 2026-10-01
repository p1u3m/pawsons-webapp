import Link from "next/link";
import { EmptyState } from "@/components/character-ui";
import { Eyebrow, pillButton } from "@/components/pill-button";

export default function NotFound() {
  return (
    <EmptyState>
      <Eyebrow>A LITTLE DETOUR</Eyebrow>
      <h1>ดูเหมือนเราจะหลงทางนิดหน่อย</h1>
      <p className="mb-6">หน้านี้ยังไม่มี แต่เพื่อน ๆ รอคุณอยู่ที่บ้านนะ</p>
      <Link href="/" className={pillButton()}>
        กลับหน้าแรก ↗
      </Link>
    </EmptyState>
  );
}
