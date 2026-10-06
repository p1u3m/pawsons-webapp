import {
  ArrowSquareOutIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { updateFulfillment } from "@/app/admin/shop/actions";
import { OrderStatusBadge } from "@/components/admin-status";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetFooter } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/shop/price";
import {
  carriers,
  eventLabel,
  formatAddress,
  fulfillmentLabel,
  orderDate,
  trackingUrl,
  type OrderDetail,
} from "@/lib/shop/orders";

const errorMessage: Record<string, string> = {
  tracking:
    "สถานะ “จัดส่งแล้ว” ต้องเลือกขนส่งและกรอกเลขพัสดุ (ตัวอักษรหรือตัวเลข 6–40 ตัว)",
  fulfillment: "อัปเดตการจัดส่งไม่สำเร็จ กรุณาตรวจข้อมูลแล้วลองอีกครั้ง",
};

const fulfillmentItems = Object.entries(fulfillmentLabel).map(
  ([value, label]) => ({ value, label }),
);
const carrierItems = [
  { value: "", label: "— เลือกขนส่ง —" },
  ...Object.entries(carriers).map(([value, { label }]) => ({ value, label })),
];

/** Order sheet body for /admin/shop: customer, items, fulfillment form and history. */
export function AdminOrderDetail({
  order,
  backHref,
  error,
}: {
  order: OrderDetail;
  backHref: string;
  error?: string;
}) {
  const address = formatAddress(order.shipping_address);
  const trackHref = trackingUrl(order);
  const events = [...(order.shop_order_events ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  const canFulfill = order.status === "paid";

  const body = (
    <div className="grid gap-6 p-4">
      {error && (
        <AdminAlert>
          {errorMessage[error] ?? errorMessage.fulfillment}
        </AdminAlert>
      )}

      <section className="grid gap-3" aria-labelledby="order-items">
        <div className="flex items-center justify-between gap-2">
          <h3 id="order-items" className="text-sm font-medium">
            รายการสินค้า
          </h3>
          <OrderStatusBadge order={order} />
        </div>
        <div className="rounded-lg bg-muted/60 p-3">
          <ul className="grid gap-2 text-sm">
            {order.shop_order_items?.map((item) => (
              <li
                key={item.product_slug}
                className="flex justify-between gap-4"
              >
                <span>
                  {item.title}{" "}
                  <span className="text-muted-foreground">
                    × {item.quantity}
                  </span>
                </span>
                <span className="tabular-nums">
                  {formatPrice(item.unit_price_satang * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {order.discount_satang > 0 && (
            <div className="mt-3 flex justify-between border-t pt-3 text-sm text-muted-foreground">
              <span>ส่วนลด ({order.discount_code})</span>
              <span className="tabular-nums">
                −{formatPrice(order.discount_satang)}
              </span>
            </div>
          )}
          <div
            className={`flex justify-between text-sm font-semibold ${order.discount_satang > 0 ? "mt-2" : "mt-3 border-t pt-3"}`}
          >
            <span>ยอดรวม</span>
            <span className="tabular-nums">
              {formatPrice(order.total_satang)}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-3" aria-labelledby="order-customer">
        <h3 id="order-customer" className="text-sm font-medium">
          ลูกค้าและที่อยู่จัดส่ง
        </h3>
        <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">ชื่อผู้รับ</dt>
          <dd>{order.customer_name || "—"}</dd>
          <dt className="text-muted-foreground">อีเมล</dt>
          <dd className="break-all">{order.email || "—"}</dd>
          <dt className="text-muted-foreground">โทรศัพท์</dt>
          <dd>{order.phone || "—"}</dd>
          <dt className="text-muted-foreground">ที่อยู่</dt>
          <dd className="grid">
            {address.length ? (
              address.map((line) => <span key={line}>{line}</span>)
            ) : (
              <span className="text-muted-foreground">
                ไม่มีที่อยู่ (ออเดอร์ก่อนเริ่มเก็บที่อยู่)
              </span>
            )}
          </dd>
        </dl>
      </section>

      {canFulfill ? (
        <section className="grid gap-3" aria-labelledby="order-shipping">
          <h3 id="order-shipping" className="text-sm font-medium">
            การจัดส่ง
          </h3>
          <input type="hidden" name="order_id" value={order.id} />
          <input type="hidden" name="back" value={backHref} />
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="fulfillment-status">สถานะ</FieldLabel>
              <Select
                name="fulfillment_status"
                defaultValue={order.fulfillment_status}
                items={fulfillmentItems}
              >
                <SelectTrigger id="fulfillment-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fulfillmentItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="carrier">บริษัทขนส่ง</FieldLabel>
                <Select
                  name="carrier"
                  defaultValue={order.carrier ?? ""}
                  items={carrierItems}
                >
                  <SelectTrigger id="carrier" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {carrierItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="tracking-number">เลขพัสดุ</FieldLabel>
                <Input
                  id="tracking-number"
                  name="tracking_number"
                  defaultValue={order.tracking_number ?? ""}
                  pattern="[A-Za-z0-9\- ]{6,48}"
                  autoComplete="off"
                  placeholder="เช่น EF123456789TH"
                />
              </Field>
            </div>
            <FieldDescription>
              กรอกขนส่งและเลขพัสดุแล้วบันทึก สถานะจะเปลี่ยนเป็น “จัดส่งแล้ว”
              ให้เอง และลูกค้าเห็นเลขพัสดุทันที
              {trackHref && (
                <>
                  {" · "}
                  <a href={trackHref} target="_blank" rel="noreferrer">
                    เปิดหน้าติดตามพัสดุ
                  </a>
                </>
              )}
            </FieldDescription>
          </FieldGroup>
        </section>
      ) : (
        <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
          จัดการการจัดส่งได้เมื่อออเดอร์ชำระเงินแล้ว
        </p>
      )}

      {events.length > 0 && (
        <section className="grid gap-3" aria-labelledby="order-history">
          <h3 id="order-history" className="text-sm font-medium">
            ประวัติ
          </h3>
          <ol className="ml-1 grid gap-3 border-l pl-4">
            {events.map((event) => (
              <li
                key={`${event.kind}-${event.created_at}`}
                className="relative grid text-sm"
              >
                <span
                  className="absolute top-1.5 -left-[1.3rem] size-2 rounded-full bg-primary ring-4 ring-background"
                  aria-hidden="true"
                />
                <span>{eventLabel[event.kind]}</span>
                <time
                  dateTime={event.created_at}
                  className="text-xs text-muted-foreground"
                >
                  {orderDate.format(new Date(event.created_at))}
                </time>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );

  if (!canFulfill) return <div className="flex-1 overflow-y-auto">{body}</div>;
  return (
    <form action={updateFulfillment} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">{body}</div>
      <SheetFooter className="flex-row justify-end border-t">
        {trackHref && (
          <Button
            variant="outline"
            render={<a href={trackHref} target="_blank" rel="noreferrer" />}
            nativeButton={false}
          >
            <ArrowSquareOutIcon />
            ติดตามพัสดุ
          </Button>
        )}
        <Button type="submit">บันทึกการจัดส่ง</Button>
      </SheetFooter>
    </form>
  );
}

export function AdminAlert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
    >
      <WarningCircleIcon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
