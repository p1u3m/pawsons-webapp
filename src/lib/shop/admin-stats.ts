import type { createClient } from "@/lib/supabase/server";
import {
  orderDetailColumns,
  type FulfillmentStatus,
  type OrderDetail,
  type OrderStatus,
} from "@/lib/shop/orders";

type Supabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;
export type AdminOrder = {
  id: string;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  email: string | null;
  customer_name: string | null;
  total_satang: number;
  created_at: string;
  shop_order_items: { title: string; quantity: number }[] | null;
};
/** Paid orders that still need packing or a tracking number. */
const toShip: FulfillmentStatus[] = ["unfulfilled", "preparing"];

/** Store KPIs for the admin pages. Counts use head requests so no rows are downloaded. */
export async function getShopStats(supabase: Supabase) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const count = (status: OrderStatus) =>
    supabase
      .from("shop_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", status);
  const [paid, pending, canceled, shipQueue, recentPaid] = await Promise.all([
    count("paid"),
    count("pending"),
    count("canceled"),
    count("paid").in("fulfillment_status", toShip),
    // Sandbox volume is small; the 1000-row cap keeps this bounded if that changes.
    supabase
      .from("shop_orders")
      .select("total_satang")
      .eq("status", "paid")
      .gte("paid_at", since)
      .limit(1000),
  ]);
  const failed = [paid, pending, canceled, shipQueue, recentPaid].some((result) => result.error);
  return {
    failed,
    counts: {
      paid: paid.count ?? 0,
      pending: pending.count ?? 0,
      canceled: canceled.count ?? 0,
    } satisfies Record<OrderStatus, number>,
    toShip: shipQueue.count ?? 0,
    revenue30d: (recentPaid.data ?? []).reduce((sum, row) => sum + row.total_satang, 0),
    paid30d: recentPaid.data?.length ?? 0,
  };
}

export async function getRecentOrders(
  supabase: Supabase,
  { status, queue, limit }: { status?: OrderStatus; queue?: "to_ship"; limit: number },
) {
  let query = supabase
    .from("shop_orders")
    .select(
      "id,status,fulfillment_status,email,customer_name,total_satang,created_at,shop_order_items(title,quantity)",
    )
    // Oldest first so the packing queue is worked in order.
    .order("created_at", { ascending: queue === "to_ship" })
    .limit(limit);
  if (status) query = query.eq("status", status);
  if (queue === "to_ship") query = query.eq("status", "paid").in("fulfillment_status", toShip);
  const { data, error } = await query;
  return { orders: (data ?? []) as AdminOrder[], error };
}

export async function getAdminOrder(supabase: Supabase, id: string) {
  const { data } = await supabase
    .from("shop_orders")
    .select(orderDetailColumns)
    .eq("id", id)
    .maybeSingle();
  return data as OrderDetail | null;
}
