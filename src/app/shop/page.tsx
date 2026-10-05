import Link from "next/link";
import { Suspense } from "react";
import { ReceiptIcon } from "@phosphor-icons/react/dist/ssr";
import { CartButton, CartDrawer } from "@/components/shop/cart";
import {
  Dot,
  listFilters,
  listingPage,
  listReset,
  listResults,
  listResultsCount,
  listResultsTitle,
  listToolbar,
} from "@/components/paper-ui";
import {
  ShopEmpty,
  shopButton,
  shopPage,
  shopPillButton,
  shopTextLink,
  toolbarPillButton,
} from "@/components/shop/shop-ui";
import { cn } from "@/lib/utils";
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
  // Rendered inline on desktop (kinds scroll sideways, houses stay pinned on
  // the right) and inside the filter sheet on mobile (everything wraps).
  const filters = (inSheet: boolean) => (
    <>
      <nav
        className={cn(
          "flex gap-1.5 pt-0.5 pb-1",
          inSheet
            ? "flex-none flex-wrap"
            : "min-w-0 flex-[1_1_280px] flex-wrap gap-2 pl-0 max-[62.5rem]:flex-[1_1_100%]",
        )}
        aria-label="ประเภทสินค้า"
      >
        {kindChips.map(([value, label, count]) => {
          const active = currentKind === value;
          return (
            <Link
              key={value}
              href={filterHref({ kind: value })}
              aria-current={active ? "page" : undefined}
              scroll={false}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-full pr-2 pl-4 text-[14px] font-semibold whitespace-nowrap",
                !inSheet && "h-auto min-h-10",
                active
                  ? "bg-sun text-gold-ink shadow-[0_2px_0_var(--color-gold)]"
                  : "bg-field text-ink-muted hover:text-ink",
              )}
            >
              {label}
              <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-cream px-1.5 text-[12px] tabular-nums">
                {count}
              </span>
            </Link>
          );
        })}
      </nav>
      <nav
        className={cn(
          "flex gap-1.5",
          inSheet ? "flex-wrap" : "flex-wrap gap-2 max-[62.5rem]:flex-[1_1_100%]",
        )}
        aria-label="บ้าน"
      >
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
              className={cn(
                "inline-flex h-9 items-center gap-[7px] rounded-full px-3.5 text-[13px] font-semibold",
                !inSheet && "h-auto min-h-10 whitespace-nowrap",
                active
                  ? "bg-(--house-bg) text-ink shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--house)_55%,transparent)]"
                  : "bg-cream text-ink-muted shadow-[inset_0_0_0_1.5px_var(--color-outline)] hover:text-ink",
                inSheet && "text-[14px]",
              )}
            >
              <Dot className="bg-(--house)" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className={cn(shopPage, listingPage, "pb-0 max-md:pt-6")}>
      <h1 className="sr-only">ร้าน Pawsons</h1>
      <section className="pt-2 pb-20 max-md:pb-16" aria-label="สินค้า">
        <div className="wrap">
          {/* Desktop: search + orders/cart on top; kind chips | houses below.
              Mobile: search, filter button and cart; filters in the sheet. */}
          <div
            className={cn(
              listToolbar,
              "mb-8 bg-cream shadow-ledge max-md:bg-transparent max-md:shadow-none",
            )}
          >
            <div
              className={cn(
                listFilters,
                "order-2 flex basis-full border-t border-line-strong pt-4 max-md:hidden",
              )}
            >
              {filters(false)}
            </div>
            <Suspense>
              <SearchField
                className="min-w-0 max-md:h-[52px] max-md:max-w-none max-md:flex-[1_1_calc(100%-64px)] max-md:bg-cream max-md:shadow-ledge-sm"
                placeholder="ค้นหาสินค้าหรือตัวละคร"
                label="ค้นหาสินค้า"
              />
            </Suspense>
            <FilterSheet activeCount={activeFilters}>
              {filters(true)}
            </FilterSheet>
            <div className="ml-auto flex items-center gap-3 max-md:w-full max-md:justify-end">
              <Link
                href="/shop/orders"
                className={cn(shopPillButton, "px-[18px]", toolbarPillButton)}
                aria-label="คำสั่งซื้อของฉัน"
              >
                <ReceiptIcon size={18} weight="bold" aria-hidden="true" />
                <span>คำสั่งซื้อ</span>
              </Link>
              <CartButton placement="toolbar" />
            </div>
          </div>

          {selectedCharacter && (
            <div className="-mt-3 mb-7 flex items-center justify-between gap-4 rounded-card-sm bg-cream px-5 py-3.5 shadow-ledge-sm">
              <p className="text-[14px]">
                ของจาก <strong>{selectedCharacter.name}</strong> ·{" "}
                {selectedCharacter.type}
              </p>
              <Link className={shopTextLink} href="/shop">
                ดูสินค้าทั้งหมด
              </Link>
            </div>
          )}

          <div className={listResults}>
            <div>
              <h2 className={listResultsTitle}>
                {currentKind === "all"
                  ? "ของเล็ก ๆ จากเพื่อนตัวน้อย"
                  : kindLabel[currentKind]}
              </h2>
              <p className={listResultsCount}>
                {visible.length} สินค้า
                {currentHouse
                  ? ` · ${houses.find((h) => h.id === currentHouse)?.name}`
                  : ""}
              </p>
            </div>
            {(query ||
              selectedCharacter ||
              currentHouse ||
              currentKind !== "all") && (
              <Link className={listReset} href="/shop">
                ล้างตัวกรอง
              </Link>
            )}
          </div>
          {visible.length ? (
            <ProductGrid>
              {visible.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <ShopEmpty
              title={
                query
                  ? `ไม่พบสินค้าที่ตรงกับ “${q!.trim()}”`
                  : "ยังไม่มีสินค้าในหมวดนี้"
              }
              action={
                <Link className={shopButton} href="/shop">
                  ดูสินค้าทั้งหมด
                </Link>
              }
            >
              {query
                ? "ลองค้นหาด้วยคำอื่น หรือกลับไปดูทั้งหมด"
                : "ลองเปลี่ยนตัวกรอง หรือกลับไปดูทั้งหมด"}
            </ShopEmpty>
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
