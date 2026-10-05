"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  HourglassMediumIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Eyebrow } from "@/components/pill-button";
import { shopButton, shopTextLink } from "@/components/shop/shop-ui";
import type { ShopOrderState } from "@/lib/shop/confirm-order";
import { cn } from "@/lib/utils";

const iconTone: Record<ShopOrderState, string> = {
  paid: "bg-clover text-green",
  pending: "bg-dandelion text-[#b88312]",
  failed: "bg-[#fbefec] text-[#b54744]",
  invalid: "bg-paper-soft text-ink-muted",
};

const copy = {
  paid: {
    Icon: CheckCircleIcon,
    title: "ชำระเงินทดสอบสำเร็จ",
    body: "Stripe ยืนยันยอดแล้ว ติดตามสถานะจัดส่งและเลขพัสดุได้ในหน้าคำสั่งซื้อ (โหมดทดสอบ ไม่มีการตัดเงินจริง)",
  },
  pending: {
    Icon: HourglassMediumIcon,
    title: "กำลังรอยืนยันการชำระเงิน",
    body: "หากเลือก PromptPay ให้สแกน QR และยืนยันในแอปธนาคาร หน้านี้จะอัปเดตเองเมื่อ Stripe ยืนยันการชำระเงิน",
  },
  failed: {
    Icon: XCircleIcon,
    title: "การชำระเงินไม่สำเร็จ",
    body: "รายการนี้ไม่สำเร็จ สินค้ายังอยู่ในตะกร้า กลับไปลองใหม่ได้เลย",
  },
  invalid: {
    Icon: WarningCircleIcon,
    title: "ตรวจสอบรายการไม่ได้",
    body: "ไม่พบรายการชำระเงินนี้ กรุณากลับไปที่ตะกร้าแล้วลองอีกครั้ง",
  },
} satisfies Record<
  ShopOrderState,
  { Icon: typeof CheckCircleIcon; title: string; body: string }
>;

export function ShopPaymentStatus({
  sessionId,
  orderId,
  initialStatus,
}: {
  sessionId: string;
  orderId: string | null;
  initialStatus: ShopOrderState;
}) {
  const [status, setStatus] = useState(initialStatus);
  useEffect(() => {
    if (status !== "paid") return;
    localStorage.removeItem("pawsons-test-cart-v1");
    window.dispatchEvent(new Event("pawsons-cart-change"));
  }, [status]);
  useEffect(() => {
    if (status !== "pending" || !sessionId) return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(
          `/api/stripe/shop-order-status?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const result: { status: ShopOrderState } = await response.json();
        if (result.status === "paid" || result.status === "failed")
          setStatus(result.status);
      } catch {
        /* Try again while this page is open. */
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [sessionId, status]);
  const { Icon, title, body } = copy[status];
  return (
    <section
      className="mx-auto mt-6 flex max-w-[560px] flex-col items-center rounded-[34px] bg-cream px-8 py-12 text-center shadow-ledge max-md:px-5 max-md:py-9"
      role="status"
      aria-live="polite"
    >
      <span className={cn("mb-5 grid size-[72px] place-items-center rounded-full", iconTone[status])}>
        <Icon size={34} weight="fill" aria-hidden="true" />
      </span>
      <Eyebrow>STRIPE SANDBOX</Eyebrow>
      <h1 className="mt-3.5 mb-2.5 text-[28px] leading-[1.3]">{title}</h1>
      <p className="leading-[1.75]">{body}</p>
      {status === "pending" && (
        <span className="mt-4 inline-flex items-center gap-2 text-[13px] text-ink-muted before:size-2 before:rounded-full before:bg-[#e0a52b] before:content-['']">
          กำลังตรวจสอบทุก 5 วินาที
        </span>
      )}
      <div className="mt-7 flex flex-col items-center gap-4">
        {status === "paid" ? (
          <>
            {orderId && (
              <Link className={shopButton} href={`/shop/orders/${orderId}`}>
                ดูคำสั่งซื้อ
              </Link>
            )}
            <Link className={shopTextLink} href="/shop">
              เลือกสินค้าต่อ
            </Link>
          </>
        ) : (
          <Link className={shopButton} href="/shop?cart=open">
            กลับไปที่ตะกร้า
          </Link>
        )}
      </div>
    </section>
  );
}
