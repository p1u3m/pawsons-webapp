import { createShopServerClient } from "@/lib/shop/server-client";
import { normalizeCode, type DiscountQuote } from "@/lib/shop/discounts";
import { isSameOrigin, parseCartItems } from "@/lib/shop/request";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Checks a discount code against the cart and returns the new total. Nothing is reserved. */
export async function POST(request: Request) {
  if (!process.env.SUPABASE_SECRET_KEY)
    return Response.json({ error: "ระบบยังไม่พร้อม" }, { status: 503 });
  if (!isSameOrigin(request))
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  // Signed-in only, so codes cannot be guessed anonymously.
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user)
    return Response.json(
      { error: "กรุณาเข้าสู่ระบบก่อนใช้โค้ดส่วนลด", needsLogin: true },
      { status: 401 },
    );
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const items = parseCartItems(raw);
  const code = normalizeCode(String((raw as { code?: unknown })?.code ?? ""));
  if (!items || code.length < 3 || code.length > 32)
    return Response.json({ error: "โค้ดส่วนลดไม่ถูกต้อง" }, { status: 400 });

  const { data, error } = await createShopServerClient().rpc(
    "shop_quote_discount",
    { p_code: code, p_items: items },
  );
  if (error)
    return error.message === "invalid_code"
      ? Response.json(
          { error: "โค้ดนี้ใช้ไม่ได้ อาจหมดอายุ ใช้ครบแล้ว หรือพิมพ์ผิด" },
          { status: 404 },
        )
      : Response.json({ error: "ตรวจโค้ดไม่สำเร็จ" }, { status: 500 });
  const quote = (data as DiscountQuote[] | null)?.[0];
  if (!quote)
    return Response.json({ error: "ตรวจโค้ดไม่สำเร็จ" }, { status: 500 });
  return Response.json(quote);
}
