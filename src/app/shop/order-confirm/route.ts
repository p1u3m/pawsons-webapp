import { getStripeClient } from "@/lib/stripe/server";
import { syncShopOrder } from "@/lib/shop/confirm-order";

export const runtime = "nodejs";
export async function GET(request: Request) {
  if (process.env.STRIPE_MODE !== "sandbox")
    return new Response(null, { status: 404 });
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId?.startsWith("cs_test_"))
    return new Response(null, {
      status: 303,
      headers: { Location: "/shop?payment=invalid" },
    });
  try {
    const session =
      await getStripeClient().checkout.sessions.retrieve(sessionId);
    const state = await syncShopOrder(session);
    if (state !== "invalid")
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/shop/order-result?session_id=${encodeURIComponent(sessionId)}`,
        },
      });
  } catch {
    /* Keep the cart and show a recoverable error. */
  }
  return new Response(null, {
    status: 303,
    headers: { Location: "/shop?payment=unconfirmed" },
  });
}
