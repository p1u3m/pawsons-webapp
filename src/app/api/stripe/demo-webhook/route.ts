import { getStripeClient } from "@/lib/stripe/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.STRIPE_MODE !== "sandbox") {
    return new Response(null, { status: 404 });
  }

  const secret = process.env.STRIPE_DEMO_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Sandbox webhook is not configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return Response.json(
      { error: "Invalid Stripe signature" },
      { status: 400 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true, demo: false });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const demo = session.metadata?.purpose === "integration_test";

  // This endpoint is only a signature probe. It never creates orders or
  // fulfills products; the real order webhook will be a separate endpoint.
  return Response.json({
    received: true,
    demo,
    paid: demo && session.payment_status === "paid",
  });
}
