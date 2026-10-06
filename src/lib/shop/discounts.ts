export type DiscountKind = "percent" | "fixed";

export type DiscountCode = {
  id: string;
  code: string;
  kind: DiscountKind;
  /** percent: 1-100. fixed: satang. */
  value: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
};

export const discountColumns =
  "id,code,kind,value,max_uses,used_count,expires_at,active,created_at";

export const codePattern = /^[A-Z0-9_-]{3,32}$/;

/** What the cart shows after a code is checked. */
export type DiscountQuote = {
  subtotal_satang: number;
  discount_satang: number;
  total_satang: number;
  code: string;
};

export function normalizeCode(raw: string) {
  return raw.trim().toUpperCase();
}

export function discountLabel(code: Pick<DiscountCode, "kind" | "value">) {
  return code.kind === "percent"
    ? `ลด ${code.value}%`
    : `ลด ฿${new Intl.NumberFormat("th-TH").format(code.value / 100)}`;
}

export type DiscountState = "active" | "off" | "expired" | "used_up";

export function discountState(
  code: Pick<DiscountCode, "active" | "expires_at" | "max_uses" | "used_count">,
  now = Date.now(),
): DiscountState {
  if (!code.active) return "off";
  if (code.expires_at && new Date(code.expires_at).getTime() <= now)
    return "expired";
  if (code.max_uses !== null && code.used_count >= code.max_uses)
    return "used_up";
  return "active";
}

export const discountStateLabel: Record<DiscountState, string> = {
  active: "ใช้งานได้",
  off: "ปิดอยู่",
  expired: "หมดอายุ",
  used_up: "ใช้ครบแล้ว",
};
