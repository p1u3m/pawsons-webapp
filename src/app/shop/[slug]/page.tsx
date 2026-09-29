import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartPanel, CartButton, CartDrawer } from "@/components/shop/cart";
import {
  ProductArt,
  ProductCard,
  kindLabel,
  lowStockThreshold,
} from "@/components/shop/product-card";
import { getCharacter, houseBackground } from "@/lib/data";
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
      ? { tone: "out", label: "หมดชั่วคราว" }
      : product.stock_qty <= lowStockThreshold
        ? { tone: "low", label: `เหลือเพียง ${product.stock_qty} ชิ้น` }
        : { tone: "ok", label: `มีสินค้า · คงเหลือ ${product.stock_qty} ชิ้น` };

  return (
    <div className="wrap store store-detail">
      <div className="store-detail-top">
        <nav className="store-breadcrumb" aria-label="เส้นทาง">
          <Link href="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          {character && (
            <>
              <Link href={`/shop?house=${character.house.id}`}>{character.house.name}</Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span aria-current="page">{product.title}</span>
        </nav>
        <CartButton />
      </div>

      <div className="store-detail-grid">
        <ProductArt product={product} size="hero" priority />
        <div className="store-buy">
          <p className="store-meta">
            {character && (
              <span className="store-dot" style={{ background: character.house.badgeColor }} />
            )}
            {kindLabel[product.kind]}
            {character && ` · บ้าน ${character.house.name}`}
          </p>
          <h1>{product.title}</h1>
          <strong className="store-detail-price">{formatPrice(product.price_satang)}</strong>
          <p className={`store-stock is-${stock.tone}`}>
            <span aria-hidden="true" />
            {stock.label}
          </p>
          {product.description && <p className="store-description">{product.description}</p>}
          <AddToCartPanel product={product} />
          <dl className="store-facts">
            <div>
              <dt>ประเภท</dt>
              <dd>{kindLabel[product.kind]}</dd>
            </div>
            <div>
              <dt>ต่อออเดอร์</dt>
              <dd>สูงสุด 10 ชิ้น</dd>
            </div>
            <div>
              <dt>ชำระเงิน</dt>
              <dd>PromptPay หรือบัตร ผ่าน Stripe</dd>
            </div>
          </dl>
          {character && (
            <Link className="store-friend" href={`/characters/${character.type.toLowerCase()}`}>
              <span
                className="store-friend-avatar"
                style={{ background: houseBackground(character.house) }}
              >
                <Image src={character.image} alt="" width={96} height={96} sizes="56px" />
              </span>
              <span>
                <strong>รู้จัก {character.name}</strong>
                <small>{character.tagline}</small>
              </span>
              <span aria-hidden="true" className="store-friend-arrow">
                ↗
              </span>
            </Link>
          )}
        </div>
      </div>

      {related.length > 0 && character && (
        <section className="store-related" aria-labelledby="related-heading">
          <div className="store-section-head">
            <h2 id="related-heading">จากบ้าน {character.house.name}</h2>
            <Link className="store-text-link" href={`/shop?house=${character.house.id}`}>
              ดูทั้งหมด
            </Link>
          </div>
          <div className="store-grid">
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
