import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  customerStatus,
  type FulfillmentStatus,
  type OrderStatus,
} from "@/lib/shop/orders";

const dotTone = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  blue: "bg-sky-500",
  red: "bg-red-500",
  gray: "bg-neutral-400",
};
export type StatusTone = keyof typeof dotTone;

/** Outline badge with a coloured dot, the one status style used across admin. */
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-normal", className)}>
      <span
        className={cn("size-1.5 rounded-full", dotTone[tone])}
        aria-hidden="true"
      />
      {children}
    </Badge>
  );
}

const orderTone: Record<OrderStatus, StatusTone> = {
  pending: "amber",
  paid: "green",
  canceled: "gray",
};
const fulfillmentTone: Record<FulfillmentStatus, StatusTone> = {
  unfulfilled: "amber",
  preparing: "blue",
  shipped: "green",
};

/** One badge for where the order stands: payment first, then shipping. */
export function OrderStatusBadge({
  order,
}: {
  order: { status: OrderStatus; fulfillment_status: FulfillmentStatus };
}) {
  const tone =
    order.status === "paid"
      ? fulfillmentTone[order.fulfillment_status]
      : orderTone[order.status];
  return <StatusBadge tone={tone}>{customerStatus(order)}</StatusBadge>;
}
