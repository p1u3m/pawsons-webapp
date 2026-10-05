import { notFound } from "next/navigation";
import { BackButton } from "@/components/paper-ui";
import { ShopPaymentStatus } from "@/components/shop/payment-status";
import { shopPage } from "@/components/shop/shop-ui";
import { cn } from "@/lib/utils";
import { getStripeClient } from "@/lib/stripe/server";
import { syncShopOrder, type ShopOrderState } from "@/lib/shop/confirm-order";

export const dynamic = "force-dynamic";
export const metadata = { title: "ผลการชำระเงินทดสอบ" };
export default async function OrderResult({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  if (process.env.STRIPE_MODE !== "sandbox") notFound();
  const { session_id: sessionId } = await searchParams;
  let status: ShopOrderState = "invalid";
  let orderId: string | null = null;
  if (sessionId?.startsWith("cs_test_")) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
      status = await syncShopOrder(session);
      if (status !== "invalid") orderId = session.metadata?.order_id ?? null;
    } catch {
      /* Show an unavailable result. */
    }
  }
  return (
    <div className={cn("wrap", shopPage)}>
      <div className="mb-7">
        <BackButton href="/shop" label="กลับไปหน้า Shop" />
      </div>
      <ShopPaymentStatus
        sessionId={sessionId ?? ""}
        orderId={orderId}
        initialStatus={status}
      />
    </div>
  );
}
