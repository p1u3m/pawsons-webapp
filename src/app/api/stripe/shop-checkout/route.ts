import { randomUUID } from "node:crypto";
import { getStripeClient } from "@/lib/stripe/server";
import { createShopServerClient } from "@/lib/shop/server-client";
import type { ShopProduct } from "@/lib/shop/catalog";

export const runtime = "nodejs";
type RequestedItem = { slug: string; quantity: number };

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
  const requested = items as RequestedItem[];
  const db = createShopServerClient();
  const { data, error } = await db
    .from("shop_products")
    .select("slug,title,price_satang,stock_qty,active,is_test")
    .in(
      "slug",
      requested.map((item) => item.slug),
    );
  if (error || !data || data.length !== requested.length)
    return Response.json({ error: "ไม่พบสินค้าบางรายการ" }, { status: 400 });
  const products = data as Pick<
    ShopProduct,
    "slug" | "title" | "price_satang" | "stock_qty" | "active" | "is_test"
  >[];
  if (
    products.some(
      (product) =>
        !product.active ||
        !product.is_test ||
        product.stock_qty <
          requested.find((item) => item.slug === product.slug)!.quantity ||
        product.price_satang < 100,
    )
  )
    return Response.json(
      { error: "สินค้าบางรายการไม่พร้อมจำหน่าย" },
      { status: 400 },
    );
  const total = products.reduce(
    (sum, product) =>
      sum +
      product.price_satang *
        requested.find((item) => item.slug === product.slug)!.quantity,
    0,
  );
  const orderId = randomUUID();
  const { error: orderError } = await db
    .from("shop_orders")
    .insert({ id: orderId, total_satang: total });
  if (orderError)
    return Response.json({ error: "สร้างออเดอร์ไม่สำเร็จ" }, { status: 500 });
  const { error: itemError } = await db.from("shop_order_items").insert(
    products.map((product) => ({
      order_id: orderId,
      product_slug: product.slug,
      title: product.title,
      unit_price_satang: product.price_satang,
      quantity: requested.find((item) => item.slug === product.slug)!.quantity,
    })),
  );
  if (itemError) {
    await db.from("shop_orders").delete().eq("id", orderId);
    return Response.json({ error: "บันทึกรายการไม่สำเร็จ" }, { status: 500 });
  }
  try {
    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "promptpay"],
      currency: "thb",
      line_items: products.map((product) => ({
        price_data: {
          currency: "thb",
          unit_amount: product.price_satang,
          product_data: {
            name: `${product.title} (ทดสอบ)`,
            description: "สินค้าจำลอง ไม่มีการจัดส่งจริง",
          },
        },
        quantity: requested.find((item) => item.slug === product.slug)!
          .quantity,
      })),
      success_url: `${origin}/shop/order-confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?cart=open`,
      metadata: { purpose: "shop_test_order", order_id: orderId },
    });
    if (!session.url) throw new Error("No checkout URL");
    const { error: sessionError } = await db
      .from("shop_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);
    if (sessionError) throw sessionError;
    return Response.json({ url: session.url });
  } catch {
    await db
      .from("shop_orders")
      .update({ status: "canceled" })
      .eq("id", orderId);
    return Response.json(
      { error: "เปิดหน้าชำระเงินไม่สำเร็จ กรุณาลองอีกครั้ง" },
      { status: 502 },
    );
  }
}
