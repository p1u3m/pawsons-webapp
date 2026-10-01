import { notFound, redirect } from "next/navigation";
import {
  ArrowSquareOutIcon,
  CheckIcon,
  CreditCardIcon,
  PackageIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { BackLink } from "@/components/character-ui";
import { Eyebrow } from "@/components/pill-button";
import { CopyButton } from "@/components/shop/copy-button";
import { shopButton, shopNote, shopPage } from "@/components/shop/shop-ui";
import { cn } from "@/lib/utils";
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
    <div className={cn("wrap", shopPage, "pb-24")}>
      <BackLink className="text-ink" href="/shop/orders">คำสั่งซื้อทั้งหมด</BackLink>
      <header className="mt-7 mb-6">
        <Eyebrow>ORDER {orderNumber(order.id)}</Eyebrow>
        <h1 className="mt-3 mb-1.5 text-[clamp(28px,4vw,38px)] leading-[1.25]">{customerStatus(order)}</h1>
        <p>สั่งซื้อเมื่อ {orderDate.format(new Date(order.created_at))}</p>
      </header>

      <ol
        className="mb-7 grid grid-cols-4 rounded-[28px] bg-cream px-5 py-6 shadow-ledge-sm max-md:px-2 max-md:py-5"
        aria-label="สถานะคำสั่งซื้อ"
      >
        {steps.map(({ key, label, Icon }, index) => {
          const done = index <= current;
          const at = done ? reachedAt(key) : null;
          return (
            <li
              key={key}
              className={cn(
                "relative flex flex-col items-center gap-1.5 text-center text-[13px] text-ink-muted max-md:text-[12px]",
                // Connector from the previous step, green once both are done.
                index > 0 &&
                  "before:absolute before:top-[17px] before:right-[calc(50%+24px)] before:left-[calc(-50%+24px)] before:h-[3px] before:rounded-[2px] before:bg-line before:content-['']",
                index > 0 && done && "before:bg-green",
              )}
              aria-current={index === current ? "step" : undefined}
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full",
                  done ? "bg-green text-white" : "bg-paper-soft",
                )}
              >
                {done ? (
                  <CheckIcon size={16} weight="bold" aria-hidden="true" />
                ) : (
                  <Icon size={16} aria-hidden="true" />
                )}
              </span>
              <span className={cn(index === current && "font-bold text-ink")}>{label}</span>
              {at && (
                <time dateTime={at} className="text-[12px] max-md:hidden">
                  {orderDate.format(new Date(at))}
                </time>
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start gap-5 max-md:grid-cols-1">
        <div className="flex flex-col gap-5">
          {order.carrier && order.tracking_number && (
            <section className={card} aria-labelledby="tracking-title">
              <h2 id="tracking-title" className={cardTitle}>
                <TruckIcon size={20} aria-hidden="true" /> ติดตามพัสดุ
              </h2>
              <p className="mb-1.5 text-[14px]">{carriers[order.carrier].label}</p>
              <div className="mb-[18px] flex flex-wrap items-center gap-2.5">
                <code className="font-mono text-[20px] font-bold tracking-[0.04em] [overflow-wrap:anywhere]">
                  {order.tracking_number}
                </code>
                <CopyButton value={order.tracking_number} label="คัดลอกเลขพัสดุ" />
              </div>
              {trackHref && (
                <a className={shopButton} href={trackHref} target="_blank" rel="noreferrer">
                  ติดตามพัสดุ <ArrowSquareOutIcon size={16} aria-hidden="true" />
                </a>
              )}
            </section>
          )}

          <section className={card} aria-labelledby="items-title">
            <h2 id="items-title" className={cardTitle}>
              รายการสินค้า
            </h2>
            <ul className="flex flex-col">
              {order.shop_order_items?.map((item) => (
                <li
                  key={item.product_slug}
                  className="flex justify-between gap-4 border-b border-line py-3 text-[15px]"
                >
                  <span className="flex flex-col gap-0.5">
                    {item.title}
                    <small className="text-[13px] text-ink-muted">
                      {formatPrice(item.unit_price_satang)} × {item.quantity}
                    </small>
                  </span>
                  <strong className="whitespace-nowrap tabular-nums">
                    {formatPrice(item.unit_price_satang * item.quantity)}
                  </strong>
                </li>
              ))}
            </ul>
            <dl className="mt-3">
              <div className="flex justify-between text-[17px] font-bold">
                <dt>ยอดชำระ</dt>
                <dd>{formatPrice(order.total_satang)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section className={card} aria-labelledby="address-title">
            <h2 id="address-title" className={cardTitle}>
              ที่อยู่จัดส่ง
            </h2>
            {address.length ? (
              <address className="flex flex-col gap-0.5 text-[14px] leading-[1.6] text-ink-soft not-italic">
                {order.customer_name && <strong className="text-ink">{order.customer_name}</strong>}
                {address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                {order.phone && <span>โทร {order.phone}</span>}
              </address>
            ) : (
              <p className={shopNote}>ไม่มีข้อมูลที่อยู่สำหรับคำสั่งซื้อนี้</p>
            )}
          </section>

          {events.length > 0 && (
            <section className={card} aria-labelledby="history-title">
              <h2 id="history-title" className={cardTitle}>
                ประวัติ
              </h2>
              <ol className="flex flex-col gap-2.5 text-[14px]">
                {events.map((event) => (
                  <li
                    key={`${event.kind}-${event.created_at}`}
                    className="flex justify-between gap-3 max-md:flex-col max-md:gap-0"
                  >
                    <span>{eventLabel[event.kind]}</span>
                    <time dateTime={event.created_at} className="text-[13px] whitespace-nowrap text-ink-muted">
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

const card = "rounded-3xl bg-cream px-6 py-[22px] shadow-ledge-sm";
const cardTitle = "mb-3.5 flex items-center gap-2 text-[17px]";
