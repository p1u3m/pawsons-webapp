"use client";
import { EmptyState } from "@/components/character-ui";
import { pillButton } from "@/components/pill-button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <EmptyState>
      <h1>ขอพักสักครู่นะ</h1>
      <p className="mb-6">หน้านี้โหลดไม่สำเร็จ ลองอีกครั้งได้เลย</p>
      <button type="button" className={pillButton()} onClick={reset}>
        ลองอีกครั้ง
      </button>
    </EmptyState>
  );
}
