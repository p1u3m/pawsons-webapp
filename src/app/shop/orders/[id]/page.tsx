import { notFound, redirect } from "next/navigation";
import { BackButton } from "@/components/paper-ui";
import { Eyebrow } from "@/components/pill-button";
import { OrderDetailView } from "@/components/shop/order-ui";
import { shopPage } from "@/components/shop/shop-ui";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { orderDetailColumns, orderNumber, type OrderDetail } from "@/lib/shop/orders";

export const metadata = { title: "รายละเอียดคำสั่งซื้อ" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!supabase || !user) redirect("/shop/orders");
  // RLS returns nothing for someone else's order, which reads as not found.
  const { data } = await supabase
    .from("shop_orders")
    .select(orderDetailColumns)
    .eq("id", id)
    .eq("status", "paid")
    .maybeSingle();
  const order = data as OrderDetail | null;
  if (!order) notFound();

  return (
    <div className={cn("wrap", shopPage, "pb-24")}>
      <div className="mb-7 flex items-center justify-between gap-4">
        <BackButton href="/shop/orders" label="คำสั่งซื้อทั้งหมด" />
        <Eyebrow>ORDER {orderNumber(order.id)}</Eyebrow>
      </div>
      <OrderDetailView order={order} />
    </div>
  );
}
