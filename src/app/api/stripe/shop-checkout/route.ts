import { getStripeClient } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { createShopServerClient } from "@/lib/shop/server-client";
import type { OrderItem } from "@/lib/shop/orders";

export const runtime = "nodejs";
// Stripe's minimum; an abandoned checkout releases its reserved stock when it expires.
const checkoutLifetimeSeconds = 30 * 60 + 60;

export async function POST(request: Request) {
  if (process.env.STRIPE_MODE !== "sandbox" || !process.env.SUPABASE_SECRET_KEY)
    return Response.json({ error: "ระบบชำระเงินยังไม่พร้อม" }, { status: 503 });
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  let originUrl: URL | null = null;
  try {
    if (origin) originUrl = new URL(origin);
  } catch {
    /* Invalid origin. */
  }
  if (
    !originUrl ||
    !host ||
    originUrl.host !== host ||
    (originUrl.protocol !== "https:" &&
      !(
        originUrl.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(originUrl.hostname)
      ))
  )
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user)
    return Response.json(
      { error: "กรุณาเข้าสู่ระบบก่อนชำระเงิน", needsLogin: true },
      { status: 401 },
    );
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const items = (raw as { items?: unknown })?.items;
  if (
    !Array.isArray(items) ||
    items.length < 1 ||
    items.length > 20 ||
    items.some(
      (item) =>
        !item ||
        typeof item.slug !== "string" ||
        !/^[a-z0-9-]+$/.test(item.slug) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 10,
    ) ||
    new Set(items.map((item) => item.slug)).size !== items.length
  )
    return Response.json({ error: "รายการสินค้าไม่ถูกต้อง" }, { status: 400 });
  const db = createShopServerClient();
  // Reserves stock and prices every line from the catalog in one transaction.
  const { data: orderId, error: placeError } = await db.rpc("shop_place_order", {
    p_user_id: user.id,
    p_email: user.email ?? null,
    p_items: items.map(({ slug, quantity }) => ({ slug, quantity })),
  });
  if (placeError || typeof orderId !== "string")
    return placeError?.message === "unavailable"
      ? Response.json(
          { error: "สินค้าบางรายการหมดหรือไม่พร้อมจำหน่าย" },
          { status: 409 },
        )
      : Response.json({ error: "สร้างออเดอร์ไม่สำเร็จ" }, { status: 500 });
  const stripe = getStripeClient();
  let sessionId: string | undefined;
  try {
    const { data: lines, error: linesError } = await db
      .from("shop_order_items")
      .select("title,unit_price_satang,quantity")
      .eq("order_id", orderId);
    if (linesError || !lines?.length) throw linesError ?? new Error("No items");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "promptpay"],
      currency: "thb",
      customer_email: user.email,
      client_reference_id: user.id,
      shipping_address_collection: { allowed_countries: ["TH"] },
      phone_number_collection: { enabled: true },
      expires_at: Math.floor(Date.now() / 1000) + checkoutLifetimeSeconds,
      line_items: (lines as Omit<OrderItem, "product_slug">[]).map((line) => ({
        price_data: {
          currency: "thb",
          unit_amount: line.unit_price_satang,
          product_data: {
            name: `${line.title} (ทดสอบ)`,
            description: "สินค้าจำลอง ไม่มีการจัดส่งจริง",
          },
        },
        quantity: line.quantity,
      })),
      success_url: `${origin}/shop/order-confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?cart=open`,
      metadata: { purpose: "shop_test_order", order_id: orderId, user_id: user.id },
    });
    sessionId = session.id;
    if (!session.url) throw new Error("No checkout URL");
    const { error: sessionError } = await db
      .from("shop_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);
    if (sessionError) throw sessionError;
    return Response.json({ url: session.url });
  } catch {
    // Never leave a payable session pointing at a canceled order.
    if (sessionId) await stripe.checkout.sessions.expire(sessionId).catch(() => {});
    await db.rpc("shop_cancel_order", { p_order_id: orderId });
    return Response.json(
      { error: "เปิดหน้าชำระเงินไม่สำเร็จ กรุณาลองอีกครั้ง" },
      { status: 502 },
    );
  }
}
