import { getStripeClient } from "@/lib/stripe/server";
import { syncShopOrder } from "@/lib/shop/confirm-order";

export const runtime = "nodejs";
export async function GET(request: Request) {
  if (process.env.STRIPE_MODE !== "sandbox")
    return new Response(null, { status: 404 });
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId?.startsWith("cs_test_"))
    return Response.json({ status: "invalid" }, { status: 400 });
  try {
    const session =
      await getStripeClient().checkout.sessions.retrieve(sessionId);
    const status = await syncShopOrder(session);
    return Response.json(
      { status },
      {
        status: status === "invalid" ? 404 : 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
