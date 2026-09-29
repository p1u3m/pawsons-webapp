import { getStripeClient } from "@/lib/stripe/server";
import { syncShopOrder } from "@/lib/shop/confirm-order";
import type Stripe from "stripe";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (process.env.STRIPE_MODE !== "sandbox")
    return new Response(null, { status: 404 });
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret)
    return Response.json({ error: "Webhook unavailable" }, { status: 503 });
  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
    ].includes(event.type)
  )
    return Response.json({ received: true });
  try {
    const state = await syncShopOrder(
      event.data.object as Stripe.Checkout.Session,
      event.type === "checkout.session.async_payment_failed",
    );
    if (state === "invalid")
      return Response.json({ error: "Order mismatch" }, { status: 400 });
    if (
      event.type === "checkout.session.async_payment_succeeded" &&
      state !== "paid"
    )
      return Response.json({ error: "Payment not confirmed" }, { status: 500 });
    return Response.json({ received: true, state });
  } catch {
    return Response.json({ error: "Order update failed" }, { status: 500 });
  }
}
