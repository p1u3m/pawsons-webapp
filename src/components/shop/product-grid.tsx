import type { ReactNode } from "react";
import { productGrid } from "@/components/shop/shop-ui";

/** Product grid wrapper for server-rendered product cards. */
export function ProductGrid({ children }: { children: ReactNode }) {
  return <div className={productGrid}>{children}</div>;
}
