import { getStripeClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.STRIPE_MODE !== "sandbox"
  ) {
    return new Response(null, { status: 404 });
  }

  const origin = request.headers.get("origin");
  if (!origin) return new Response(null, { status: 403 });

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return new Response(null, { status: 403 });
  }

  if (
    url.protocol !== "http:" ||
    !["localhost", "127.0.0.1"].includes(url.hostname) ||
    request.headers.get("host") !== url.host
  ) {
    return new Response(null, { status: 403 });
  }

  try {
    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "thb",
            unit_amount: 10000,
            product_data: {
              name: "Pawsons sandbox checkout test",
              description: "Test payment only. No product will be shipped.",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/shop/stripe-demo-return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/stripe-demo-return?canceled=1`,
      metadata: { purpose: "integration_test" },
    });

    if (!session.url) throw new Error("Stripe did not return a Checkout URL");
    return Response.redirect(session.url, 303);
  } catch {
    return Response.redirect(`${origin}/shop?demo=error`, 303);
  }
}
