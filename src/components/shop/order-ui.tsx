import Link from "next/link";
import {
  ArrowSquareOutIcon,
  CaretRightIcon,
  CheckIcon,
  ClockIcon,
  CreditCardIcon,
  PackageIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { CopyButton } from "@/components/shop/copy-button";
import { shopButton, shopNote } from "@/components/shop/shop-ui";
import { formatPrice } from "@/lib/shop/price";
import {
  carriers,
  customerStatus,
  eventLabel,
  formatAddress,
  orderDate,
  orderNumber,
  trackingUrl,
  type FulfillmentStatus,
  type OrderDetail,
  type OrderStatus,
} from "@/lib/shop/orders";
import { cn } from "@/lib/utils";

// Order pages of /shop (list and detail): cream cards on ledges, one tone and
// icon per fulfilment status.

export type OrderSummary = {
  id: string;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  total_satang: number;
  created_at: string;
  shop_order_items: { title: string; quantity: number }[] | null;
};

const tone: Record<FulfillmentStatus, string> = {
  unfulfilled: "bg-dandelion text-amber-ink",
  preparing: "bg-forget text-blue-ink",
  shipped: "bg-clover text-green-ink",
};
const statusIcon = {
  unfulfilled: ClockIcon,
  preparing: PackageIcon,
  shipped: TruckIcon,
} as const;

export function OrderStatusChip({
  order,
}: {
  order: Pick<OrderSummary, "status" | "fulfillment_status">;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-caption font-semibold",
        tone[order.fulfillment_status],
      )}
    >
      {customerStatus(order)}
    </span>
  );
}

/** One order in the list: status icon, number and status, first item, date, total. */
export function OrderListItem({ order }: { order: OrderSummary }) {
  const items = order.shop_order_items ?? [];
  const first = items[0];
  const more = items.length - 1;
  const Icon = statusIcon[order.fulfillment_status];
  return (
    <Link
      href={`/shop/orders/${order.id}`}
      className="press-card flex items-center gap-4 rounded-card-sm bg-cream p-4 pr-5 [--depth:3px] max-md:gap-3 max-md:p-3.5"
    >
      <span
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-tile max-md:size-12",
          tone[order.fulfillment_status],
        )}
        aria-hidden="true"
      >
        <Icon size={26} weight="duotone" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <strong className="tabular-nums">{orderNumber(order.id)}</strong>
          <OrderStatusChip order={order} />
        </span>
        <span className="truncate text-body-sm text-ink-soft">
          {first ? `${first.title} × ${first.quantity}` : "ไม่มีรายการ"}
          {more > 0 && (
            <span className="text-ink-muted"> และอีก {more} รายการ</span>
          )}
        </span>
        <time dateTime={order.created_at} className="text-small text-ink-muted">
          {orderDate.format(new Date(order.created_at))}
        </time>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <strong className="text-body-lg tabular-nums">
          {formatPrice(order.total_satang)}
        </strong>
        <CaretRightIcon
          size={18}
          aria-hidden="true"
          className="text-ink-muted max-md:hidden"
        />
      </span>
    </Link>
  );
}

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

const card = "rounded-card-sm bg-cream p-6 shadow-ledge-sm max-md:p-5";
const cardTitle = "mb-3.5 flex items-center gap-2 text-body-lg";

/** Everything below the page header of one order. */
export function OrderDetailView({ order }: { order: OrderDetail }) {
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
    <>
      <section
        className={cn(card, "mb-5 px-8 py-7 max-md:px-5")}
        aria-labelledby="order-status"
      >
        <p className="text-small text-ink-muted">
          สั่งซื้อเมื่อ {orderDate.format(new Date(order.created_at))}
        </p>
        <h1
          id="order-status"
          className="mt-1 mb-7 text-[clamp(28px,4vw,38px)] leading-[1.25]"
        >
          {customerStatus(order)}
        </h1>

        <ol className="grid grid-cols-3" aria-label="สถานะคำสั่งซื้อ">
          {steps.map(({ key, label, Icon }, index) => {
            const done = index <= current;
            const at = done ? reachedAt(key) : null;
            return (
              <li
                key={key}
                className={cn(
                  "relative flex flex-col items-center gap-2 text-center text-small text-ink-muted max-md:text-caption",
                  // Line from the previous step's centre to this one's.
                  index > 0 &&
                    "before:absolute before:top-[19px] before:right-1/2 before:left-[-50%] before:z-0 before:h-[3px] before:rounded-full before:bg-line before:content-['']",
                  index > 0 && done && "before:bg-green",
                )}
                aria-current={index === current ? "step" : undefined}
              >
                <span
                  className={cn(
                    "relative z-10 grid size-10 place-items-center rounded-full",
                    done ? "bg-green text-white" : "bg-paper-soft",
                    index === current && "ring-4 ring-green/20",
                  )}
                >
                  {done && index < current ? (
                    <CheckIcon size={18} weight="bold" aria-hidden="true" />
                  ) : (
                    <Icon size={18} aria-hidden="true" />
                  )}
                </span>
                <span className={cn(index === current && "font-bold text-ink")}>
                  {label}
                </span>
                {at && (
                  <time dateTime={at} className="text-caption max-md:hidden">
                    {orderDate.format(new Date(at))}
                  </time>
                )}
              </li>
            );
          })}
        </ol>

        {order.carrier && order.tracking_number && (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-line pt-6">
            <div className="min-w-0">
              <p className="text-small text-ink-muted">
                ติดตามพัสดุ · {carriers[order.carrier].label}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                <code className="font-mono text-title-sm font-bold tracking-[0.04em] [overflow-wrap:anywhere]">
                  {order.tracking_number}
                </code>
                <CopyButton
                  value={order.tracking_number}
                  label="คัดลอกเลขพัสดุ"
                />
              </div>
            </div>
            {trackHref && (
              <a
                className={shopButton}
                href={trackHref}
                target="_blank"
                rel="noreferrer"
              >
                ติดตามพัสดุ{" "}
                <ArrowSquareOutIcon size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start gap-5 max-md:grid-cols-1">
        <section className={card} aria-labelledby="items-title">
          <h2 id="items-title" className={cardTitle}>
            รายการสินค้า
          </h2>
          <ul className="flex flex-col">
            {order.shop_order_items?.map((item) => (
              <li
                key={item.product_slug}
                className="flex justify-between gap-4 border-b border-line py-3 text-body first:pt-0"
              >
                <span className="flex flex-col gap-0.5">
                  {item.title}
                  <small className="text-small text-ink-muted">
                    {formatPrice(item.unit_price_satang)} × {item.quantity}
                  </small>
                </span>
                <strong className="whitespace-nowrap tabular-nums">
                  {formatPrice(item.unit_price_satang * item.quantity)}
                </strong>
              </li>
            ))}
          </ul>
          <dl className="mt-4">
            {order.discount_satang > 0 && (
              <div className="mb-2 flex items-baseline justify-between text-body-sm text-green-ink">
                <dt>ส่วนลด ({order.discount_code})</dt>
                <dd className="tabular-nums">
                  −{formatPrice(order.discount_satang)}
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between text-body-lg font-bold">
              <dt>ยอดชำระ</dt>
              <dd className="text-title tabular-nums">
                {formatPrice(order.total_satang)}
              </dd>
            </div>
          </dl>
        </section>

        <aside className="flex flex-col gap-5">
          <section className={card} aria-labelledby="address-title">
            <h2 id="address-title" className={cardTitle}>
              ที่อยู่จัดส่ง
            </h2>
            {address.length ? (
              <address className="flex flex-col gap-0.5 text-body-sm leading-[1.6] text-ink-soft not-italic">
                {order.customer_name && (
                  <strong className="text-ink">{order.customer_name}</strong>
                )}
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
              <ol className="flex flex-col gap-4 border-l-2 border-line pl-5 text-body-sm">
                {events.map((event) => (
                  <li
                    key={`${event.kind}-${event.created_at}`}
                    className="relative flex flex-col gap-0.5 before:absolute before:top-[7px] before:-left-[27px] before:size-2.5 before:rounded-full before:bg-green before:ring-4 before:ring-cream before:content-['']"
                  >
                    <span>{eventLabel[event.kind]}</span>
                    <time
                      dateTime={event.created_at}
                      className="text-small text-ink-muted"
                    >
                      {orderDate.format(new Date(event.created_at))}
                    </time>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
