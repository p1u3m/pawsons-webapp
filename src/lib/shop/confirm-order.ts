import type Stripe from "stripe";
import { createShopServerClient } from "@/lib/shop/server-client";
import type { ShippingAddress } from "@/lib/shop/orders";

export type ShopOrderState = "paid" | "pending" | "failed" | "invalid";

/**
 * Synchronize a sandbox order only after verifying its Stripe session and total.
 * `closed` marks a failed async payment or an expired session: the order is
 * canceled and its reserved stock returned.
 */
export async function syncShopOrder(
  session: Stripe.Checkout.Session,
  closed = false,
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

  if (closed) {
    const { error: cancelError } = await db.rpc("shop_cancel_order", {
      p_order_id: order.id,
    });
    if (cancelError) throw cancelError;
    return "failed";
  }

  if (session.payment_status !== "paid") return "pending";
  const shipping = session.collected_information?.shipping_details;
  const address: ShippingAddress | null = shipping
    ? {
        line1: shipping.address.line1,
        line2: shipping.address.line2,
        city: shipping.address.city,
        state: shipping.address.state,
        postal_code: shipping.address.postal_code,
        country: shipping.address.country,
      }
    : null;
  const { data: updated, error: updateError } = await db
    .from("shop_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      email: session.customer_details?.email ?? null,
      customer_name: shipping?.name ?? session.customer_details?.name ?? null,
      phone: session.customer_details?.phone ?? null,
      shipping_address: address,
    })
    .eq("id", order.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (updateError) throw updateError;
  return updated ? "paid" : "pending";
}
