"use client";
import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="admin-contents-page" role="alert">
      <h1 className="admin-page-title">โหลดข้อมูลไม่สำเร็จ</h1>
      <p className="admin-page-sub">
        ไม่สามารถเชื่อมต่อข้อมูลได้ในขณะนี้ กรุณาลองอีกครั้ง
      </p>
      <Button
        variant="unstyled"
        size="auto"
        className="admin-site-link"
        onClick={reset}
      >
        ลองอีกครั้ง
      </Button>
    </div>
  );
}
