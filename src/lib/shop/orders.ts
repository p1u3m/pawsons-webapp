export type OrderStatus = "pending" | "paid" | "canceled";
export type FulfillmentStatus = "unfulfilled" | "preparing" | "shipped";
export type Carrier = "thailand_post" | "flash" | "kerry" | "jt" | "other";
export type OrderEventKind =
  | "placed"
  | "paid"
  | "canceled"
  | "preparing"
  | "shipped"
  | "tracking_updated";

export type ShippingAddress = {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};

export type OrderItem = {
  product_slug: string;
  title: string;
  unit_price_satang: number;
  quantity: number;
};

export type OrderDetail = {
  id: string;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  email: string | null;
  customer_name: string | null;
  phone: string | null;
  shipping_address: ShippingAddress | null;
  total_satang: number;
  /** Before the discount; null for orders placed before discount codes. */
  subtotal_satang: number | null;
  discount_satang: number;
  discount_code: string | null;
  carrier: Carrier | null;
  tracking_number: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  shop_order_items: OrderItem[] | null;
  shop_order_events: { kind: OrderEventKind; created_at: string }[] | null;
};

export const orderDetailColumns =
  "id,status,fulfillment_status,email,customer_name,phone,shipping_address,total_satang,subtotal_satang,discount_satang,discount_code,carrier,tracking_number,created_at,paid_at,shipped_at,shop_order_items(product_slug,title,unit_price_satang,quantity),shop_order_events(kind,created_at)";

export const orderStatusLabel: Record<OrderStatus, string> = {
  paid: "ชำระแล้ว",
  pending: "รอชำระ",
  canceled: "ยกเลิก",
};

export const fulfillmentLabel: Record<FulfillmentStatus, string> = {
  unfulfilled: "รอเตรียมจัดส่ง",
  preparing: "กำลังเตรียมจัดส่ง",
  shipped: "จัดส่งแล้ว",
};

export const eventLabel: Record<OrderEventKind, string> = {
  placed: "สร้างคำสั่งซื้อ",
  paid: "ชำระเงินสำเร็จ",
  canceled: "ยกเลิกคำสั่งซื้อ",
  preparing: "กำลังเตรียมจัดส่ง",
  shipped: "จัดส่งแล้ว",
  tracking_updated: "อัปเดตเลขพัสดุ",
};

// KEX and J&T have no documented deep link, so they open the carrier's tracking page
// and the customer pastes the copied number.
export const carriers: Record<Carrier, { label: string; trackUrl?: (tracking: string) => string }> = {
  thailand_post: {
    label: "ไปรษณีย์ไทย",
    trackUrl: (n) => `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(n)}`,
  },
  flash: {
    label: "Flash Express",
    trackUrl: (n) => `https://www.flashexpress.co.th/fle/tracking?se=${encodeURIComponent(n)}`,
  },
  kerry: {
    label: "KEX (Kerry)",
    trackUrl: () => "https://th.kex-express.com/th/track/",
  },
  jt: {
    label: "J&T Express",
    trackUrl: () => "https://www.jtexpress.co.th/",
  },
  other: { label: "อื่น ๆ" },
};

export const trackingPattern = /^[A-Za-z0-9-]{6,40}$/;

export function trackingUrl(order: Pick<OrderDetail, "carrier" | "tracking_number">) {
  if (!order.carrier || !order.tracking_number) return null;
  return carriers[order.carrier].trackUrl?.(order.tracking_number) ?? null;
}

export function orderNumber(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

/** Where the customer is in the order lifecycle, as one label. */
export function customerStatus(order: Pick<OrderDetail, "status" | "fulfillment_status">) {
  if (order.status !== "paid") return orderStatusLabel[order.status];
  return fulfillmentLabel[order.fulfillment_status];
}

export function formatAddress(address: ShippingAddress | null) {
  if (!address) return [];
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(" "),
  ].filter((line): line is string => Boolean(line));
}

export const orderDate = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});
