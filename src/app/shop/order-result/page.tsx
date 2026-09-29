import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui";
import { ShopPaymentStatus } from "@/components/shop/payment-status";
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
  if (sessionId?.startsWith("cs_test_")) {
    try {
      status = await syncShopOrder(
        await getStripeClient().checkout.sessions.retrieve(sessionId),
      );
    } catch {
      /* Show an unavailable result. */
    }
  }
  return (
    <div className="wrap store store-result-page">
      <BackLink href="/shop">กลับไปหน้า Shop</BackLink>
      <ShopPaymentStatus sessionId={sessionId ?? ""} initialStatus={status} />
    </div>
  );
}
