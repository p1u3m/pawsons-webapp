import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartPanel, CartButton, CartDrawer } from "@/components/shop/cart";
import {
  ProductArt,
  ProductCard,
  lowStockThreshold,
} from "@/components/shop/product-card";
import { BackButton, Dot, FriendLink } from "@/components/paper-ui";
import { productGrid, shopPage, shopTextLink } from "@/components/shop/shop-ui";
import { kindLabel } from "@/lib/shop/kinds";
import { cn } from "@/lib/utils";
import { getCharacter } from "@/lib/data";
import { getProducts, isCheckoutReady } from "@/lib/shop/catalog";
import { formatPrice } from "@/lib/shop/price";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await getProducts()).find((item) => item.slug === slug);
  return { title: product ? `${product.title} · Shop` : "Shop" };
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  const character = getCharacter(product.character_type);
  const related = products
    .filter(
      (item) =>
        item.slug !== product.slug &&
        getCharacter(item.character_type)?.house.id === character?.house.id,
    )
    .slice(0, 4);
  const stock =
    product.stock_qty < 1
      ? { dot: "bg-ink-faint", label: "หมดชั่วคราว" }
      : product.stock_qty <= lowStockThreshold
        ? { dot: "bg-amber", label: `เหลือเพียง ${product.stock_qty} ชิ้น` }
        : { dot: "bg-green", label: `มีสินค้า · คงเหลือ ${product.stock_qty} ชิ้น` };

  return (
    <div className={cn("wrap", shopPage)}>
      <div className="mb-7 flex items-center justify-between gap-4">
        <BackButton href="/shop" label="กลับไปหน้า Shop" />
        <CartButton />
      </div>

      <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start gap-14 max-split:grid-cols-1 max-split:gap-8">
        <ProductArt product={product} size="hero" priority />
        <div>
          <p className="flex flex-wrap items-center gap-1.5 text-caption max-md:text-micro">
            {character && <Dot color={character.house.badgeColor} />}
            {kindLabel[product.kind]}
            {character && ` · บ้าน ${character.house.name}`}
          </p>
          <h1 className="mt-3 mb-2 text-[clamp(28px,3.2vw,40px)] leading-[1.2] tracking-[-0.02em]">
            {product.title}
          </h1>
          <strong className="block text-heading-sm tabular-nums">{formatPrice(product.price_satang)}</strong>
          <p className="mt-2.5 flex items-center gap-2 text-body-sm">
            <span aria-hidden="true" className={cn("size-2 rounded-full", stock.dot)} />
            {stock.label}
          </p>
          {product.description && (
            <p className="mt-[22px] text-body-lg leading-[1.8]">{product.description}</p>
          )}
          <AddToCartPanel product={product} />
          <dl className="mb-6 grid">
            {[
              ["ประเภท", kindLabel[product.kind]],
              ["ต่อออเดอร์", "สูงสุด 10 ชิ้น"],
              ["ชำระเงิน", "PromptPay หรือบัตร ผ่าน Stripe"],
            ].map(([term, value]) => (
              <div key={term} className="grid grid-cols-[110px_1fr] gap-3 border-b border-line py-3 text-body-sm">
                <dt className="text-ink-muted">{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {character && <FriendLink character={character} title={`รู้จัก ${character.name}`} />}
        </div>
      </div>

      {related.length > 0 && character && (
        <section className="mt-20" aria-labelledby="related-heading">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 id="related-heading" className="text-title">
              จากบ้าน {character.house.name}
            </h2>
            <Link className={shopTextLink} href={`/shop?house=${character.house.id}`}>
              ดูทั้งหมด
            </Link>
          </div>
          <div className={productGrid}>
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      )}

      <CartDrawer products={products} checkoutReady={isCheckoutReady()} />
    </div>
  );
}
