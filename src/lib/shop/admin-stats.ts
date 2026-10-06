import type { createClient } from "@/lib/supabase/server";
import {
  discountColumns,
  discountState,
  type DiscountCode,
} from "@/lib/shop/discounts";
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
const chartDays = 14;
const bangkokDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Bangkok",
});
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
      .select("total_satang,paid_at")
      .eq("status", "paid")
      .gte("paid_at", since)
      .limit(1000),
  ]);
  const failed = [paid, pending, canceled, shipQueue, recentPaid].some(
    (result) => result.error,
  );
  // Paid totals per Bangkok calendar day, oldest first, for the dashboard chart.
  const dayKey = (date: Date) => bangkokDay.format(date);
  const daily = Array.from({ length: chartDays }, (_, i) => {
    const date = new Date(
      Date.now() - (chartDays - 1 - i) * 24 * 60 * 60 * 1000,
    );
    return {
      day: dayKey(date),
      date: date.toISOString(),
      satang: 0,
      orders: 0,
    };
  });
  for (const row of recentPaid.data ?? []) {
    const bucket =
      row.paid_at && daily.find((d) => d.day === dayKey(new Date(row.paid_at)));
    if (bucket) {
      bucket.satang += row.total_satang;
      bucket.orders += 1;
    }
  }
  return {
    failed,
    counts: {
      paid: paid.count ?? 0,
      pending: pending.count ?? 0,
      canceled: canceled.count ?? 0,
    } satisfies Record<OrderStatus, number>,
    toShip: shipQueue.count ?? 0,
    revenue30d: (recentPaid.data ?? []).reduce(
      (sum, row) => sum + row.total_satang,
      0,
    ),
    paid30d: recentPaid.data?.length ?? 0,
    daily,
  };
}

/** Discount code numbers for the dashboard card. */
export async function getDiscountStats(supabase: Supabase) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [codes, paid] = await Promise.all([
    supabase
      .from("discount_codes")
      .select(discountColumns)
      .order("used_count", { ascending: false })
      .limit(200),
    // Sandbox volume is small; the cap keeps this bounded if that changes.
    supabase
      .from("shop_orders")
      .select("discount_satang")
      .eq("status", "paid")
      .gt("discount_satang", 0)
      .gte("paid_at", since)
      .limit(1000),
  ]);
  const all = (codes.data ?? []) as DiscountCode[];
  const usable = all.filter((code) => discountState(code) === "active");
  return {
    failed: Boolean(codes.error || paid.error),
    activeCount: usable.length,
    totalCount: all.length,
    top: usable.slice(0, 3),
    orders30d: paid.data?.length ?? 0,
    given30d: (paid.data ?? []).reduce(
      (sum, row) => sum + row.discount_satang,
      0,
    ),
  };
}

export async function getRecentOrders(
  supabase: Supabase,
  {
    status,
    queue,
    limit,
  }: { status?: OrderStatus; queue?: "to_ship"; limit: number },
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
  if (queue === "to_ship")
    query = query.eq("status", "paid").in("fulfillment_status", toShip);
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

/** Paid orders waiting to ship, for the admin sidebar badge. */
export async function countToShip(supabase: Supabase) {
  const { count } = await supabase
    .from("shop_orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "paid")
    .in("fulfillment_status", toShip);
  return count ?? 0;
}

export type ProductSales = {
  units: number;
  revenue: number;
  units30d: number;
  lastSoldAt: string | null;
};

/** Paid units and revenue per product slug, all time and the last 30 days. */
export async function getProductSales(supabase: Supabase) {
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  // Sandbox volume is small; the cap keeps the download bounded if that changes.
  const { data, error } = await supabase
    .from("shop_order_items")
    .select(
      "product_slug,quantity,unit_price_satang,shop_orders!inner(status,paid_at)",
    )
    .eq("shop_orders.status", "paid")
    .limit(5000);
  const sales: Record<string, ProductSales> = {};
  for (const row of (data ?? []) as unknown as {
    product_slug: string;
    quantity: number;
    unit_price_satang: number;
    shop_orders: { paid_at: string | null };
  }[]) {
    const entry = (sales[row.product_slug] ??= {
      units: 0,
      revenue: 0,
      units30d: 0,
      lastSoldAt: null,
    });
    const paidAt = row.shop_orders.paid_at;
    entry.units += row.quantity;
    entry.revenue += row.quantity * row.unit_price_satang;
    if (paidAt && new Date(paidAt).getTime() >= since)
      entry.units30d += row.quantity;
    if (paidAt && (!entry.lastSoldAt || paidAt > entry.lastSoldAt))
      entry.lastSoldAt = paidAt;
  }
  return { sales, failed: Boolean(error) };
}
