import Link from "next/link";
import { CaretRightIcon, ReceiptIcon } from "@phosphor-icons/react/dist/ssr";
import { BackLink, PageIntro } from "@/components/character-ui";
import { OrdersSignInPrompt } from "@/components/shop/sign-in-prompt";
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
    <div className="wrap store store-orders-page">
      <BackLink href="/shop">กลับไปหน้า Shop</BackLink>
      <PageIntro label="MY ORDERS" title="คำสั่งซื้อของฉัน">
        ดูสินค้าที่สั่งไป สถานะการจัดส่ง และเลขพัสดุ
      </PageIntro>
      {!user ? (
        <OrdersSignInPrompt />
      ) : error ? (
        <p className="store-alert" role="alert">
          โหลดคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </p>
      ) : orders.length ? (
        <ul className="store-orders">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/shop/orders/${order.id}`} className="store-order-row">
                <span className="store-order-row-main">
                  <span className="store-order-row-head">
                    <strong>{orderNumber(order.id)}</strong>
                    <span className={`store-status is-${order.fulfillment_status}`}>
                      {customerStatus(order)}
                    </span>
                  </span>
                  <span className="store-order-row-items">
                    {order.shop_order_items
                      ?.map((item) => `${item.title} × ${item.quantity}`)
                      .join(", ")}
                  </span>
                  <time dateTime={order.created_at}>
                    {orderDate.format(new Date(order.created_at))}
                  </time>
                </span>
                <strong className="store-order-row-total">{formatPrice(order.total_satang)}</strong>
                <CaretRightIcon size={18} aria-hidden="true" className="store-order-row-caret" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="store-empty">
          <ReceiptIcon size={32} aria-hidden="true" />
          <p>ยังไม่มีคำสั่งซื้อ</p>
          <span>เมื่อสั่งซื้อแล้ว รายการจะแสดงที่นี่พร้อมสถานะการจัดส่ง</span>
          <Link className="store-cta" href="/shop">
            เลือกสินค้า
          </Link>
        </div>
      )}
    </div>
  );
}
