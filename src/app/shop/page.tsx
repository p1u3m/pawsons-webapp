import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ReceiptIcon } from "@phosphor-icons/react/dist/ssr";
import { CartButton, CartDrawer } from "@/components/shop/cart";
import { FilterSheet } from "@/components/filter-sheet";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { SearchField } from "@/components/search-field";
import { getCharacter, houses } from "@/lib/data";
import { getProducts, isCheckoutReady } from "@/lib/shop/catalog";
import { isProductKind, kindLabel, productKinds } from "@/lib/shop/kinds";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

type ShopSearchParams = {
  character?: string;
  kind?: string;
  house?: string;
  q?: string;
  cart?: string;
  payment?: string;
};

// Messages for a return from Stripe that could not be confirmed.
const paymentNotice: Record<string, string> = {
  unconfirmed: "ยังยืนยันการชำระเงินไม่ได้ กรุณาลองอีกครั้ง",
  invalid: "ไม่พบรายการชำระเงินนี้ กรุณาลองอีกครั้ง",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const { character, kind, house, q, cart, payment } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";
  const products = await getProducts();
  const currentKind = isProductKind(kind) ? kind : "all";
  const selectedCharacter = character ? getCharacter(character) : undefined;
  const currentHouse = houses.find((item) => item.id === house)?.id;
  // Everything but the kind filter, so each kind chip can show its count.
  const matching = products.filter((product) => {
    const productCharacter = getCharacter(product.character_type);
    const matchesQuery =
      !query ||
      [
        product.title,
        product.description,
        product.character_type,
        productCharacter?.name ?? "",
      ].some((text) => text.toLowerCase().includes(query));
    return (
      matchesQuery &&
      (!selectedCharacter ||
        product.character_type === selectedCharacter.type) &&
      (!currentHouse || productCharacter?.house.id === currentHouse)
    );
  });
  const visible =
    currentKind === "all"
      ? matching
      : matching.filter((product) => product.kind === currentKind);
  // Only kinds that exist in the catalog get a chip (plus the selected one).
  const kindChips = [
    ["all", "ทั้งหมด", matching.length] as const,
    ...productKinds
      .filter(
        (value) =>
          value === currentKind ||
          products.some((product) => product.kind === value),
      )
      .map(
        (value) =>
          [
            value,
            kindLabel[value],
            matching.filter((product) => product.kind === value).length,
          ] as const,
      ),
  ];
  const filterHref = (next: { kind?: string; house?: string | null }) => {
    const params = new URLSearchParams();
    if (selectedCharacter) params.set("character", selectedCharacter.type);
    const nextKind = next.kind ?? currentKind;
    if (nextKind !== "all") params.set("kind", nextKind);
    const nextHouse = next.house === undefined ? currentHouse : next.house;
    if (nextHouse) params.set("house", nextHouse);
    if (query) params.set("q", q!.trim());
    return `/shop${params.size ? `?${params}` : ""}`;
  };
  const activeFilters =
    Number(currentKind !== "all") + Number(Boolean(currentHouse));
  // Rendered inline on desktop and inside the filter sheet on mobile.
  const filters = (
    <>
      <nav className="store-kinds" aria-label="ประเภทสินค้า">
        {kindChips.map(([value, label, count]) => (
          <Link
            key={value}
            href={filterHref({ kind: value })}
            aria-current={currentKind === value ? "page" : undefined}
            scroll={false}
          >
            {label}
            <span className="store-kind-count">{count}</span>
          </Link>
        ))}
      </nav>
      <nav className="store-houses" aria-label="บ้าน">
        {houses.map((item) => {
          const active = currentHouse === item.id;
          return (
            <Link
              key={item.id}
              href={filterHref({ house: active ? null : item.id })}
              aria-current={active ? "page" : undefined}
              style={
                {
                  "--house": item.badgeColor,
                  "--house-bg": item.color,
                } as React.CSSProperties
              }
              scroll={false}
            >
              <span className="store-dot" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="store store--landing">
      <section className="wrap store-hero">
        <div className="store-hero-copy">
          <h1>
            พาเพื่อนตัวน้อย
            <br />
            กลับไปอยู่ใกล้ ๆ
          </h1>
          <p>
            สติกเกอร์และโปสการ์ดของชาว Pawsons ของเล็ก ๆ
            ที่อยากให้วันธรรมดาของคุณอบอุ่นขึ้น
          </p>
        </div>
        <div className="store-hero-art" aria-hidden="true">
          {/* Always animates, even with reduced motion; unoptimized keeps the WebP frames intact. */}
          <Image
            src="/shop/hero-character-drive.webp"
            alt=""
            width={500}
            height={500}
            unoptimized
            priority
          />
        </div>
      </section>

      <section className="store-band" aria-label="สินค้า">
        <div className="wrap">
          <div className="store-toolbar">
            <div className="store-toolbar-filters">{filters}</div>
            <Suspense>
              <SearchField
                className="store-search"
                placeholder="ค้นหาสินค้าหรือตัวละคร"
                label="ค้นหาสินค้า"
              />
            </Suspense>
            <FilterSheet activeCount={activeFilters}>{filters}</FilterSheet>
            <div className="store-toolbar-end">
              <Link
                href="/shop/orders"
                className="store-cart-button store-orders-link"
                aria-label="คำสั่งซื้อของฉัน"
              >
                <ReceiptIcon size={18} weight="bold" aria-hidden="true" />
                <span>คำสั่งซื้อ</span>
              </Link>
              <CartButton />
            </div>
          </div>

          {selectedCharacter && (
            <div className="store-filter-banner">
              <p>
                ของจาก <strong>{selectedCharacter.name}</strong> ·{" "}
                {selectedCharacter.type}
              </p>
              <Link className="store-text-link" href="/shop">
                ดูสินค้าทั้งหมด
              </Link>
            </div>
          )}

          {visible.length ? (
            <ProductGrid>
              {visible.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <div className="store-empty">
              <p>
                {query
                  ? `ไม่พบสินค้าที่ตรงกับ “${q!.trim()}”`
                  : "ยังไม่มีสินค้าในหมวดนี้"}
              </p>
              <span>
                {query
                  ? "ลองค้นหาด้วยคำอื่น หรือกลับไปดูทั้งหมด"
                  : "ลองเปลี่ยนตัวกรอง หรือกลับไปดูทั้งหมด"}
              </span>
              <Link className="store-cta" href="/shop">
                ดูสินค้าทั้งหมด
              </Link>
            </div>
          )}
        </div>
      </section>

      <CartDrawer
        products={products}
        checkoutReady={isCheckoutReady()}
        openOnLoad={cart === "open" || Boolean(payment)}
        notice={payment ? paymentNotice[payment] : undefined}
      />
    </div>
  );
}
