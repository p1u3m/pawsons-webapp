import type Stripe from "stripe";
import { createShopServerClient } from "@/lib/shop/server-client";

export type ShopOrderState = "paid" | "pending" | "failed" | "invalid";

/** Synchronize a sandbox order only after verifying its Stripe session and total. */
export async function syncShopOrder(
  session: Stripe.Checkout.Session,
  paymentFailed = false,
): Promise<ShopOrderState> {
  if (
    session.metadata?.purpose !== "shop_test_order" ||
    !session.metadata.order_id ||
    session.currency !== "thb"
  )
    return "invalid";

  const db = createShopServerClient();
  const { data: order, error } = await db
    .from("shop_orders")
    .select("id,total_satang,stripe_session_id,status")
    .eq("id", session.metadata.order_id)
    .maybeSingle();
  if (error) throw error;
  if (
    !order ||
    order.stripe_session_id !== session.id ||
    order.total_satang !== session.amount_total
  )
    return "invalid";
  if (order.status === "paid") return "paid";
  if (order.status === "canceled") return "failed";

  if (paymentFailed) {
    const { error: updateError } = await db
      .from("shop_orders")
      .update({ status: "canceled" })
      .eq("id", order.id)
      .eq("status", "pending");
    if (updateError) throw updateError;
    return "failed";
  }

  if (session.payment_status !== "paid") return "pending";
  const { data: updated, error: updateError } = await db
    .from("shop_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      email: session.customer_details?.email ?? null,
    })
    .eq("id", order.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (updateError) throw updateError;
  return updated ? "paid" : "pending";
}
