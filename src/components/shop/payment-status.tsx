"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  HourglassMediumIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import type { ShopOrderState } from "@/lib/shop/confirm-order";

const copy = {
  paid: {
    Icon: CheckCircleIcon,
    title: "ชำระเงินทดสอบสำเร็จ",
    body: "Stripe ยืนยันยอดแล้ว ออเดอร์ทดสอบถูกบันทึกเป็นชำระแล้วในหลังบ้าน ไม่มีการตัดเงินจริงหรือจัดส่งสินค้า",
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
  initialStatus,
}: {
  sessionId: string;
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
      className={`store-result is-${status}`}
      role="status"
      aria-live="polite"
    >
      <span className="store-result-icon">
        <Icon size={34} weight="fill" aria-hidden="true" />
      </span>
      <span className="eyebrow">STRIPE SANDBOX</span>
      <h1>{title}</h1>
      <p>{body}</p>
      {status === "pending" && (
        <span className="store-result-pulse">กำลังตรวจสอบทุก 5 วินาที</span>
      )}
      <div className="store-result-actions">
        {status === "paid" ? (
          <Link className="store-cta" href="/shop">
            เลือกสินค้าต่อ
          </Link>
        ) : (
          <Link className="store-cta" href="/shop?cart=open">
            กลับไปที่ตะกร้า
          </Link>
        )}
      </div>
    </section>
  );
}
