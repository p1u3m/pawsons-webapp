import { notFound, redirect } from "next/navigation";
import {
  ArrowSquareOutIcon,
  CheckIcon,
  CreditCardIcon,
  PackageIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { BackLink } from "@/components/character-ui";
import { CopyButton } from "@/components/shop/copy-button";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/shop/price";
import {
  carriers,
  customerStatus,
  eventLabel,
  formatAddress,
  orderDate,
  orderDetailColumns,
  orderNumber,
  trackingUrl,
  type FulfillmentStatus,
  type OrderDetail,
} from "@/lib/shop/orders";

export const metadata = { title: "รายละเอียดคำสั่งซื้อ" };

const steps = [
  { key: "paid", label: "ชำระเงินแล้ว", Icon: CreditCardIcon },
  { key: "preparing", label: "กำลังเตรียมจัดส่ง", Icon: PackageIcon },
  { key: "shipped", label: "จัดส่งแล้ว", Icon: TruckIcon },
] as const;
const stepIndex: Record<FulfillmentStatus, number> = {
  unfulfilled: 0,
  preparing: 1,
  shipped: 2,
};

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

  const events = [...(order.shop_order_events ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  const reachedAt = (kind: string) =>
    events.findLast((event) => event.kind === kind)?.created_at ??
    (kind === "paid" ? order.paid_at : null);
  const current = stepIndex[order.fulfillment_status];
  const address = formatAddress(order.shipping_address);
  const trackHref = trackingUrl(order);

  return (
    <div className="wrap store store-orders-page">
      <BackLink href="/shop/orders">คำสั่งซื้อทั้งหมด</BackLink>
      <header className="store-order-head">
        <div>
          <span className="eyebrow">ORDER {orderNumber(order.id)}</span>
          <h1>{customerStatus(order)}</h1>
          <p>สั่งซื้อเมื่อ {orderDate.format(new Date(order.created_at))}</p>
        </div>
      </header>

      <ol className="store-progress" aria-label="สถานะคำสั่งซื้อ">
        {steps.map(({ key, label, Icon }, index) => {
          const done = index <= current;
          const at = done ? reachedAt(key) : null;
          return (
            <li
              key={key}
              className={done ? "is-done" : undefined}
              aria-current={index === current ? "step" : undefined}
            >
              <span className="store-progress-dot">
                {done ? (
                  <CheckIcon size={16} weight="bold" aria-hidden="true" />
                ) : (
                  <Icon size={16} aria-hidden="true" />
                )}
              </span>
              <span className="store-progress-label">{label}</span>
              {at && (
                <time dateTime={at}>{orderDate.format(new Date(at))}</time>
              )}
            </li>
          );
        })}
      </ol>

      <div className="store-order-grid">
        <div className="store-order-main">
          {order.carrier && order.tracking_number && (
            <section className="store-order-card store-tracking" aria-labelledby="tracking-title">
              <h2 id="tracking-title">
                <TruckIcon size={20} aria-hidden="true" /> ติดตามพัสดุ
              </h2>
              <p className="store-tracking-carrier">{carriers[order.carrier].label}</p>
              <div className="store-tracking-number">
                <code>{order.tracking_number}</code>
                <CopyButton value={order.tracking_number} label="คัดลอกเลขพัสดุ" />
              </div>
              {trackHref && (
                <a className="store-cta" href={trackHref} target="_blank" rel="noreferrer">
                  ติดตามพัสดุ <ArrowSquareOutIcon size={16} aria-hidden="true" />
                </a>
              )}
            </section>
          )}

          <section className="store-order-card" aria-labelledby="items-title">
            <h2 id="items-title">รายการสินค้า</h2>
            <ul className="store-order-items">
              {order.shop_order_items?.map((item) => (
                <li key={item.product_slug}>
                  <span>
                    {item.title}
                    <small>
                      {formatPrice(item.unit_price_satang)} × {item.quantity}
                    </small>
                  </span>
                  <strong>{formatPrice(item.unit_price_satang * item.quantity)}</strong>
                </li>
              ))}
            </ul>
            <dl className="store-order-sum">
              <div>
                <dt>ยอดชำระ</dt>
                <dd>{formatPrice(order.total_satang)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="store-order-side">
          <section className="store-order-card" aria-labelledby="address-title">
            <h2 id="address-title">ที่อยู่จัดส่ง</h2>
            {address.length ? (
              <address>
                {order.customer_name && <strong>{order.customer_name}</strong>}
                {address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                {order.phone && <span>โทร {order.phone}</span>}
              </address>
            ) : (
              <p className="store-note">ไม่มีข้อมูลที่อยู่สำหรับคำสั่งซื้อนี้</p>
            )}
          </section>

          {events.length > 0 && (
            <section className="store-order-card" aria-labelledby="history-title">
              <h2 id="history-title">ประวัติ</h2>
              <ol className="store-order-events">
                {events.map((event) => (
                  <li key={`${event.kind}-${event.created_at}`}>
                    <span>{eventLabel[event.kind]}</span>
                    <time dateTime={event.created_at}>
                      {orderDate.format(new Date(event.created_at))}
                    </time>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
