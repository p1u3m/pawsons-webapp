import Image from "next/image";
import Link from "next/link";
import { AddToCartIcon } from "@/components/shop/cart";
import { Dot, ImagePlaceholder } from "@/components/paper-ui";
import { getCharacter } from "@/lib/data";
import type { ShopProduct } from "@/lib/shop/catalog";
import { kindLabel } from "@/lib/shop/kinds";
import { formatPrice } from "@/lib/shop/price";
import { cn } from "@/lib/utils";

export const lowStockThreshold = 5;

export function StockBadge({ stock }: { stock: number }) {
  const badge =
    "absolute top-3 left-3 rounded-full bg-cream/92 px-2.5 py-1 text-[12px] font-semibold backdrop-blur-[6px]";
  if (stock < 1)
    return <span className={cn(badge, "text-ink-muted")}>หมดชั่วคราว</span>;
  if (stock <= lowStockThreshold)
    return (
      <span className={cn(badge, "text-[#9b5a10]")}>เหลือ {stock} ชิ้น</span>
    );
  return null;
}

/** Uploaded product photo, or an empty state until one is uploaded. */
export function ProductArt({
  product,
  size = "card",
  priority = false,
  className,
}: {
  product: ShopProduct;
  size?: "card" | "hero";
  priority?: boolean;
  className?: string;
}) {
  const photo = product.image_url;
  return (
    <div
      className={cn(
        "relative grid aspect-square place-items-center overflow-hidden rounded-[22px] bg-[#f4efe1] max-md:rounded-[15px]",
        className,
      )}
    >
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
          className="object-cover transition-transform duration-600 ease-spring group-hover:scale-104"
        />
      ) : (
        <ImagePlaceholder label="ยังไม่มีรูปสินค้า" />
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: ShopProduct }) {
  const character = getCharacter(product.character_type);
  return (
    <article
      data-product
      className="group relative flex flex-col rounded-[30px] bg-cream p-2.5 shadow-ledge transition-[translate,background-color] duration-220 ease-spring hover:-translate-y-[5px] motion-reduce:transition-none max-md:rounded-[20px] max-md:p-1.5"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="relative block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductArt
          product={product}
          className={cn(product.stock_qty < 1 && "opacity-70 grayscale-70")}
        />
        <StockBadge stock={product.stock_qty} />
      </Link>
      <div className="flex flex-1 flex-col gap-1 px-2 pt-3.5 pb-1.5 max-md:px-1.5 max-md:pt-2.5 max-md:pb-1">
        <p className="flex flex-wrap items-center gap-1.5 text-[12px] max-md:text-[11px]">
          {character && <Dot color={character.house.badgeColor} />}
          {character
            ? `${character.name} · ${character.type}`
            : product.character_type}
          <span aria-hidden="true">·</span>
          {kindLabel[product.kind]}
        </p>
        <h3 className="text-[16px] leading-[1.4] font-semibold max-md:text-[14px]">
          {/* The whole card is clickable while the add button stays on top. */}
          <Link
            href={`/shop/${product.slug}`}
            className="after:absolute after:inset-0 after:rounded-[30px] after:content-['']"
          >
            {product.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2.5">
          <strong className="text-[18px] tabular-nums max-md:text-[16px]">
            {formatPrice(product.price_satang)}
          </strong>
          <AddToCartIcon product={product} />
        </div>
      </div>
    </article>
  );
}
