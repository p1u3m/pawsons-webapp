"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="wrap empty-state">
      <h1>ขอพักสักครู่นะ</h1>
      <p>หน้านี้โหลดไม่สำเร็จ ลองอีกครั้งได้เลย</p>
      <button className="button" onClick={reset}>
        ลองอีกครั้ง
      </button>
    </section>
  );
}
