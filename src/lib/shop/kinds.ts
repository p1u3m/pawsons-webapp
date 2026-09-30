/**
 * Product kinds, in storefront order. Adding one also needs a migration that
 * widens the `shop_products.kind` check constraint.
 */
export const kindLabel = {
  sticker: "สติกเกอร์",
  postcard: "โปสการ์ด",
} as const;

export type ProductKind = keyof typeof kindLabel;

export const productKinds = Object.keys(kindLabel) as ProductKind[];

export function isProductKind(value: unknown): value is ProductKind {
  return typeof value === "string" && Object.hasOwn(kindLabel, value);
}
