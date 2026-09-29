import type { createClient } from "@/lib/supabase/server";

type Supabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;
export type OrderStatus = "pending" | "paid" | "canceled";
export type AdminOrder = {
  id: string;
  status: OrderStatus;
  email: string | null;
  total_satang: number;
  created_at: string;
  shop_order_items: { title: string; quantity: number }[] | null;
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  paid: "ชำระแล้ว",
  pending: "รอชำระ",
  canceled: "ยกเลิก",
};

/** Store KPIs for the admin pages. Counts use head requests so no rows are downloaded. */
export async function getShopStats(supabase: Supabase) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const count = (status: OrderStatus) =>
    supabase
      .from("shop_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", status);
  const [paid, pending, canceled, recentPaid] = await Promise.all([
    count("paid"),
    count("pending"),
    count("canceled"),
    // Sandbox volume is small; the 1000-row cap keeps this bounded if that changes.
    supabase
      .from("shop_orders")
      .select("total_satang")
      .eq("status", "paid")
      .gte("paid_at", since)
      .limit(1000),
  ]);
  const failed = [paid, pending, canceled, recentPaid].some((result) => result.error);
  return {
    failed,
    counts: {
      paid: paid.count ?? 0,
      pending: pending.count ?? 0,
      canceled: canceled.count ?? 0,
    } satisfies Record<OrderStatus, number>,
    revenue30d: (recentPaid.data ?? []).reduce((sum, row) => sum + row.total_satang, 0),
    paid30d: recentPaid.data?.length ?? 0,
  };
}

export async function getRecentOrders(
  supabase: Supabase,
  { status, limit }: { status?: OrderStatus; limit: number },
) {
  let query = supabase
    .from("shop_orders")
    .select("id,status,email,total_satang,created_at,shop_order_items(title,quantity)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  return { orders: (data ?? []) as AdminOrder[], error };
}
