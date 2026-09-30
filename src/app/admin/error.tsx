"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <Empty className="border bg-card" role="alert">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningCircleIcon />
        </EmptyMedia>
        <EmptyTitle>โหลดข้อมูลไม่สำเร็จ</EmptyTitle>
        <EmptyDescription>
          ไม่สามารถเชื่อมต่อข้อมูลได้ในขณะนี้ กรุณาลองอีกครั้ง
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={reset}>ลองอีกครั้ง</Button>
      </EmptyContent>
    </Empty>
  );
}
