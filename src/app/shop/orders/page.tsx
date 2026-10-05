import Link from "next/link";
import { ReceiptIcon } from "@phosphor-icons/react/dist/ssr";
import { PageIntro } from "@/components/character-ui";
import { BackButton } from "@/components/paper-ui";
import { OrderListItem, type OrderSummary } from "@/components/shop/order-ui";
import { OrdersSignInPrompt } from "@/components/shop/sign-in-prompt";
import { ShopEmpty, shopAlert, shopButton, shopPage } from "@/components/shop/shop-ui";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "คำสั่งซื้อของฉัน" };

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
  const orders = (data ?? []) as OrderSummary[];

  return (
    <div className={cn("wrap", shopPage, "pb-24")}>
      <div className="mb-7">
        <BackButton href="/shop" label="กลับไปหน้า Shop" />
      </div>
      <PageIntro label="MY ORDERS" title="คำสั่งซื้อของฉัน">
        ดูสินค้าที่สั่งไป สถานะการจัดส่ง และเลขพัสดุ
      </PageIntro>
      {!user ? (
        <OrdersSignInPrompt />
      ) : error ? (
        <p className={shopAlert} role="alert">
          โหลดคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </p>
      ) : orders.length ? (
        <>
          <p className="mb-4 text-small text-ink-muted">
            {orders.length} คำสั่งซื้อ
          </p>
          <ul className="flex flex-col gap-3.5">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderListItem order={order} />
              </li>
            ))}
          </ul>
        </>
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
