import { BackLink, PageIntro } from "@/components/ui";
import { getStripeClient } from "@/lib/stripe/server";
import { notFound } from "next/navigation";

export const metadata = { title: "Stripe sandbox test" };

export default async function StripeDemoReturn({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; canceled?: string }>;
}) {
  if (process.env.STRIPE_MODE !== "sandbox") notFound();

  const { session_id: sessionId, canceled } = await searchParams;
  let result: "paid" | "unpaid" | "canceled" | "unavailable" = "unavailable";

  if (canceled === "1") {
    result = "canceled";
  } else if (sessionId?.startsWith("cs_test_")) {
    try {
      const session =
        await getStripeClient().checkout.sessions.retrieve(sessionId);
      if (session.metadata?.purpose === "integration_test") {
        result = session.payment_status === "paid" ? "paid" : "unpaid";
      }
    } catch {
      result = "unavailable";
    }
  }

  const content = {
    paid: {
      title: "ชำระเงินทดสอบสำเร็จ",
      description:
        "Stripe ยืนยันว่าการชำระใน sandbox สำเร็จแล้ว นี่เป็นการทดสอบเท่านั้น ไม่มีการสร้างออเดอร์หรือจัดส่งสินค้า",
    },
    unpaid: {
      title: "การชำระเงินทดสอบยังไม่สำเร็จ",
      description:
        "Stripe ยังไม่ยืนยันการชำระเงินของ session นี้ คุณสามารถลองสร้างลิงก์ทดสอบใหม่ได้",
    },
    canceled: {
      title: "ยกเลิกการชำระเงินทดสอบ",
      description: "ไม่มีการชำระเงินหรือสร้างออเดอร์จากการทดสอบนี้",
    },
    unavailable: {
      title: "ตรวจสอบผลการทดสอบไม่ได้",
      description:
        "ไม่พบ session ทดสอบที่ถูกต้อง หรือยังไม่ได้ตั้งค่าคีย์ sandbox บนเซิร์ฟเวอร์",
    },
  }[result];

  return (
    <main className="wrap page-space">
      <PageIntro label="STRIPE SANDBOX" title={content.title}>
        {content.description}
      </PageIntro>
      <BackLink href="/shop">กลับไปที่ Little Shop</BackLink>
    </main>
  );
}
