import Link from "next/link";
import { CaretRightIcon, ReceiptIcon } from "@phosphor-icons/react/dist/ssr";
import { BackLink, PageIntro } from "@/components/character-ui";
import { OrdersSignInPrompt } from "@/components/shop/sign-in-prompt";
import { ShopEmpty, shopAlert, shopButton, shopPage } from "@/components/shop/shop-ui";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/shop/price";
import {
  customerStatus,
  orderDate,
  orderNumber,
  type FulfillmentStatus,
  type OrderStatus,
} from "@/lib/shop/orders";

export const metadata = { title: "คำสั่งซื้อของฉัน" };

type OrderRow = {
  id: string;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  total_satang: number;
  created_at: string;
  shop_order_items: { title: string; quantity: number }[] | null;
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  // RLS limits rows to the signed-in customer. Unpaid checkouts are not orders yet.
  const { data, error } =
    supabase && user
      ? await supabase
          .from("shop_orders")
          .select("id,status,fulfillment_status,total_satang,created_at,shop_order_items(title,quantity)")
          .eq("user_id", user.id)
          .eq("status", "paid")
          .order("created_at", { ascending: false })
          .limit(100)
      : { data: null, error: null };
  const orders = (data ?? []) as OrderRow[];

  return (
    <div className={cn("wrap", shopPage, "pb-24")}>
      <BackLink className="text-ink" href="/shop">กลับไปหน้า Shop</BackLink>
      <PageIntro label="MY ORDERS" title="คำสั่งซื้อของฉัน" className="mt-7">
        ดูสินค้าที่สั่งไป สถานะการจัดส่ง และเลขพัสดุ
      </PageIntro>
      {!user ? (
        <OrdersSignInPrompt />
      ) : error ? (
        <p className={shopAlert} role="alert">
          โหลดคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </p>
      ) : orders.length ? (
        <ul className="flex flex-col gap-3.5">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/shop/orders/${order.id}`}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 rounded-card-sm bg-cream px-[22px] py-5 shadow-ledge-sm hover:-translate-y-0.5 max-md:grid-cols-[minmax(0,1fr)_auto] max-md:px-[18px] max-md:py-4"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <strong>{orderNumber(order.id)}</strong>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-[3px] text-[12px] font-semibold",
                        statusTone[order.fulfillment_status],
                      )}
                    >
                      {customerStatus(order)}
                    </span>
                  </span>
                  <span className="truncate text-[14px] text-ink-soft">
                    {order.shop_order_items
                      ?.map((item) => `${item.title} × ${item.quantity}`)
                      .join(", ")}
                  </span>
                  <time dateTime={order.created_at} className="text-[13px] text-ink-muted">
                    {orderDate.format(new Date(order.created_at))}
                  </time>
                </span>
                <strong className="tabular-nums">{formatPrice(order.total_satang)}</strong>
                <CaretRightIcon size={18} aria-hidden="true" className="text-ink-muted max-md:hidden" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ShopEmpty
          icon={<ReceiptIcon size={32} aria-hidden="true" />}
          title="ยังไม่มีคำสั่งซื้อ"
          action={
            <Link className={shopButton} href="/shop">
              เลือกสินค้า
            </Link>
          }
        >
          เมื่อสั่งซื้อแล้ว รายการจะแสดงที่นี่พร้อมสถานะการจัดส่ง
        </ShopEmpty>
      )}
    </div>
  );
}

const statusTone: Record<FulfillmentStatus, string> = {
  unfulfilled: "bg-dandelion text-[#8a600a]",
  preparing: "bg-forget text-[#2f5f8a]",
  shipped: "bg-clover text-green",
};
