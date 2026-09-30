import { ArrowSquareOutIcon, CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { updateFulfillment } from "@/app/admin/shop/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/shop/price";
import {
  carriers,
  eventLabel,
  formatAddress,
  fulfillmentLabel,
  orderDate,
  orderStatusLabel,
  trackingUrl,
  type OrderDetail,
} from "@/lib/shop/orders";

const errorMessage: Record<string, string> = {
  tracking: "สถานะ “จัดส่งแล้ว” ต้องเลือกขนส่งและกรอกเลขพัสดุ (ตัวอักษรหรือตัวเลข 6–40 ตัว)",
  fulfillment: "อัปเดตการจัดส่งไม่สำเร็จ กรุณาตรวจข้อมูลแล้วลองอีกครั้ง",
};

/** Order sheet body for /admin/shop: customer, items, fulfillment form and history. */
export function AdminOrderDetail({
  order,
  backHref,
  error,
  updated,
}: {
  order: OrderDetail;
  backHref: string;
  error?: string;
  updated: boolean;
}) {
  const address = formatAddress(order.shipping_address);
  const trackHref = trackingUrl(order);
  const events = [...(order.shop_order_events ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  return (
    <div className="ashop-order">
      {updated && !error && (
        <p className="ashop-toast" role="status">
          <CheckCircleIcon size={18} weight="fill" aria-hidden="true" />
          อัปเดตการจัดส่งแล้ว
        </p>
      )}
      {error && (
        <p className="ashop-alert" role="alert">
          {errorMessage[error] ?? errorMessage.fulfillment}
        </p>
      )}

      <section className="ashop-order-card" aria-labelledby="order-customer">
        <h3 id="order-customer">ลูกค้าและที่อยู่จัดส่ง</h3>
        <dl className="ashop-order-dl">
          <dt>ชื่อผู้รับ</dt>
          <dd>{order.customer_name || "—"}</dd>
          <dt>อีเมล</dt>
          <dd>{order.email || "—"}</dd>
          <dt>โทรศัพท์</dt>
          <dd>{order.phone || "—"}</dd>
          <dt>ที่อยู่</dt>
          <dd>
            {address.length ? (
              address.map((line) => <span key={line}>{line}</span>)
            ) : (
              <span className="ashop-muted">ไม่มีที่อยู่ (ออเดอร์ก่อนเริ่มเก็บที่อยู่)</span>
            )}
          </dd>
        </dl>
      </section>

      <section className="ashop-order-card" aria-labelledby="order-items">
        <h3 id="order-items">
          รายการสินค้า <span className={`ashop-pill is-${order.status}`}>{orderStatusLabel[order.status]}</span>
        </h3>
        <ul className="ashop-order-items">
          {order.shop_order_items?.map((item) => (
            <li key={item.product_slug}>
              <span>
                {item.title} <small>× {item.quantity}</small>
              </span>
              <span>{formatPrice(item.unit_price_satang * item.quantity)}</span>
            </li>
          ))}
          <li className="is-total">
            <span>รวม</span>
            <strong>{formatPrice(order.total_satang)}</strong>
          </li>
        </ul>
      </section>

      {order.status === "paid" ? (
        <form action={updateFulfillment} className="ashop-form">
          <input type="hidden" name="order_id" value={order.id} />
          <input type="hidden" name="back" value={backHref} />
          <fieldset>
            <legend>การจัดส่ง</legend>
            <label className="is-wide">
              สถานะ
              <select name="fulfillment_status" defaultValue={order.fulfillment_status}>
                {Object.entries(fulfillmentLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              บริษัทขนส่ง
              <select name="carrier" defaultValue={order.carrier ?? ""}>
                <option value="">— เลือก —</option>
                {Object.entries(carriers).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              เลขพัสดุ
              <Input
                name="tracking_number"
                defaultValue={order.tracking_number ?? ""}
                pattern="[A-Za-z0-9\- ]{6,48}"
                autoComplete="off"
                placeholder="เช่น EF123456789TH"
              />
            </label>
            <p className="ashop-form-hint is-wide">
              กรอกขนส่งและเลขพัสดุแล้วบันทึก สถานะจะเปลี่ยนเป็น “จัดส่งแล้ว” ให้เอง และลูกค้าเห็นเลขพัสดุทันที
              {trackHref && (
                <>
                  {" "}
                  <a href={trackHref} target="_blank" rel="noreferrer">
                    เปิดหน้าติดตามพัสดุ <ArrowSquareOutIcon size={12} aria-hidden="true" />
                  </a>
                </>
              )}
            </p>
          </fieldset>
          <div className="ashop-form-footer">
            <Button type="submit" variant="unstyled" size="auto" className="ashop-button">
              บันทึกการจัดส่ง
            </Button>
          </div>
        </form>
      ) : (
        <p className="ashop-muted">จัดการการจัดส่งได้เมื่อออเดอร์ชำระเงินแล้ว</p>
      )}

      {events.length > 0 && (
        <section className="ashop-order-card" aria-labelledby="order-history">
          <h3 id="order-history">ประวัติ</h3>
          <ol className="ashop-order-events">
            {events.map((event) => (
              <li key={`${event.kind}-${event.created_at}`}>
                <span>{eventLabel[event.kind]}</span>
                <time dateTime={event.created_at}>{orderDate.format(new Date(event.created_at))}</time>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
