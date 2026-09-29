"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="wrap empty-state">
      <h1>ขอพักสักครู่นะ</h1>
      <p>หน้านี้โหลดไม่สำเร็จ ลองอีกครั้งได้เลย</p>
      <Button variant="unstyled" size="auto" className="button" onClick={reset}>
        ลองอีกครั้ง
      </Button>
    </section>
  );
}
