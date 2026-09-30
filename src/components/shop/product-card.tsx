import Image from "next/image";
import Link from "next/link";
import { AddToCartIcon } from "@/components/shop/cart";
import { NoProductImage } from "@/components/shop/no-product-image";
import { getCharacter } from "@/lib/data";
import type { ShopProduct } from "@/lib/shop/catalog";
import { kindLabel } from "@/lib/shop/kinds";
import { formatPrice } from "@/lib/shop/price";

export const lowStockThreshold = 5;

export function StockBadge({ stock }: { stock: number }) {
  if (stock < 1) return <span className="store-badge is-out">หมดชั่วคราว</span>;
  if (stock <= lowStockThreshold)
    return <span className="store-badge is-low">เหลือ {stock} ชิ้น</span>;
  return null;
}

/** Uploaded product photo, or an empty state until one is uploaded. */
export function ProductArt({
  product,
  size = "card",
  priority = false,
}: {
  product: ShopProduct;
  size?: "card" | "hero";
  priority?: boolean;
}) {
  const photo = product.image_url;
  return (
    <div className={`store-art store-art--${size}`}>
      {photo ? (
        <Image
          src={photo}
          alt={product.title}
          fill
          sizes={
            size === "hero"
              ? "(max-width: 860px) 90vw, 560px"
              : "(max-width: 640px) 45vw, 280px"
          }
          priority={priority}
        />
      ) : (
        <NoProductImage />
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: ShopProduct }) {
  const character = getCharacter(product.character_type);
  return (
    <article className={`store-card${product.stock_qty < 1 ? " is-sold-out" : ""}`}>
      <Link href={`/shop/${product.slug}`} className="store-card-art" tabIndex={-1} aria-hidden="true">
        <ProductArt product={product} />
        <StockBadge stock={product.stock_qty} />
      </Link>
      <div className="store-card-body">
        <p className="store-meta">
          {character && (
            <span className="store-dot" style={{ background: character.house.badgeColor }} />
          )}
          {character ? `${character.name} · ${character.type}` : product.character_type}
          <span aria-hidden="true">·</span>
          {kindLabel[product.kind]}
        </p>
        <h3 className="store-card-title">
          <Link href={`/shop/${product.slug}`}>{product.title}</Link>
        </h3>
        <div className="store-card-foot">
          <strong className="store-price">{formatPrice(product.price_satang)}</strong>
          <AddToCartIcon product={product} />
        </div>
      </div>
    </article>
  );
}
