"use client";

import { formatPrice } from "@/lib/shop/price";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  SignInIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/use-auth";
import {
  ShopEmpty,
  shopAlert,
  shopButton,
  shopFineprint,
  shopNote,
  shopPillButton,
  toolbarPillButton,
} from "@/components/shop/shop-ui";
import { ImagePlaceholder } from "@/components/paper-ui";
import { cn } from "@/lib/utils";
import { type ShopProduct } from "@/lib/shop/catalog";

export type CartLine = { slug: string; quantity: number };
const key = "pawsons-test-cart-v1";
const eventName = "pawsons-cart-change";
const openEventName = "pawsons-cart-open";
const maxPerLine = 10;

function parseCart(raw: string): CartLine[] {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (line): line is CartLine =>
        typeof line?.slug === "string" &&
        Number.isInteger(line?.quantity) &&
        line.quantity > 0 &&
        line.quantity <= maxPerLine,
    );
  } catch {
    return [];
  }
}

function readRaw() {
  try {
    return localStorage.getItem(key) ?? "[]";
  } catch {
    return "[]";
  }
}

export function readCart(): CartLine[] {
  return parseCart(readRaw());
}

export function writeCart(lines: CartLine[]) {
  try {
    localStorage.setItem(key, JSON.stringify(lines));
  } catch {
    /* Storage can be unavailable in private windows; the cart stays empty. */
  }
  window.dispatchEvent(new Event(eventName));
}

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Cart lines from localStorage, kept in sync across components and tabs. */
export function useCart() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  return useMemo(() => parseCart(raw), [raw]);
}

export function openCart() {
  window.dispatchEvent(new Event(openEventName));
}

function lineLimit(product: ShopProduct) {
  return Math.max(0, Math.min(product.stock_qty, maxPerLine));
}

function addToCart(product: ShopProduct, quantity: number) {
  const lines = readCart();
  const existing = lines.find((line) => line.slug === product.slug);
  if (existing)
    existing.quantity = Math.min(
      existing.quantity + quantity,
      lineLimit(product),
    );
  else
    lines.push({
      slug: product.slug,
      quantity: Math.min(quantity, lineLimit(product)),
    });
  writeCart(lines);
}

function setLineQuantity(slug: string, quantity: number) {
  const lines = readCart();
  writeCart(
    quantity < 1
      ? lines.filter((line) => line.slug !== slug)
      : lines.map((line) =>
          line.slug === slug ? { ...line, quantity } : line,
        ),
  );
}

function useAddedFlash() {
  const [added, setAdded] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return [
    added,
    () => {
      setAdded(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setAdded(false), 1600);
    },
  ] as const;
}

/** Compact round button for product cards. */
export function AddToCartIcon({ product }: { product: ShopProduct }) {
  const [added, flash] = useAddedFlash();
  const soldOut = product.stock_qty < 1;
  return (
    <button
      type="button"
      className={cn(
        "press relative z-1 grid size-[42px] place-items-center rounded-full border-[1.5px] border-outline bg-cream text-navy [--depth:3px] disabled:opacity-35 max-md:size-9",
        added && "bg-green text-cream",
        "not-disabled:hover:bg-sun not-disabled:hover:text-gold-ink not-disabled:hover:[--ledge:var(--color-gold)]",
      )}
      disabled={soldOut}
      aria-label={
        soldOut
          ? `${product.title} หมดชั่วคราว`
          : `ใส่ ${product.title} ลงตะกร้า`
      }
      onClick={() => {
        addToCart(product, 1);
        flash();
      }}
    >
      {added ? (
        <CheckIcon size={16} weight="bold" aria-hidden="true" />
      ) : (
        <PlusIcon size={16} weight="bold" aria-hidden="true" />
      )}
      <span className="sr-only" aria-live="polite">
        {added ? "เพิ่มลงตะกร้าแล้ว" : ""}
      </span>
    </button>
  );
}

export function QuantityStepper({
  value,
  max,
  onChange,
  label,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const step =
    "grid h-[46px] w-11 place-items-center rounded-full text-ink not-disabled:hover:bg-ink/5 disabled:opacity-30";
  return (
    <div
      className="inline-flex items-center rounded-full bg-cream shadow-[inset_0_0_0_1.5px_var(--color-outline),0_3px_0_var(--color-ledge)]"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={step}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="ลดจำนวน"
      >
        <MinusIcon size={14} weight="bold" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        className="min-w-6 text-center font-semibold tabular-nums"
      >
        {value}
      </output>
      <button
        type="button"
        className={step}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="เพิ่มจำนวน"
      >
        <PlusIcon size={14} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}

const buyActions = "my-7 flex flex-wrap gap-3 border-b border-line pb-7";
const buyButton = cn(shopButton, "min-w-[180px] flex-1");

/** Quantity + add button for the product detail page; opens the cart drawer. */
export function AddToCartPanel({ product }: { product: ShopProduct }) {
  const [quantity, setQuantity] = useState(1);
  const lines = useCart();
  const inCart =
    lines.find((line) => line.slug === product.slug)?.quantity ?? 0;
  const remaining = lineLimit(product) - inCart;
  if (product.stock_qty < 1)
    return (
      <div className={buyActions}>
        <button type="button" className={buyButton} disabled>
          หมดชั่วคราว
        </button>
      </div>
    );
  return (
    <div className={buyActions}>
      <QuantityStepper
        value={Math.min(quantity, Math.max(remaining, 1))}
        max={Math.max(remaining, 1)}
        onChange={setQuantity}
        label="จำนวนที่ต้องการ"
      />
      <button
        type="button"
        className={buyButton}
        disabled={remaining < 1}
        onClick={() => {
          addToCart(product, Math.min(quantity, remaining));
          setQuantity(1);
          openCart();
        }}
      >
        <ShoppingBagIcon size={16} weight="bold" aria-hidden="true" />
        {remaining < 1 ? "ครบจำนวนสูงสุดในตะกร้าแล้ว" : "ใส่ตะกร้า"}
      </button>
    </div>
  );
}

/**
 * Header button showing the item count; opens the drawer. In the shop
 * toolbar it shrinks to an icon with a badge on phones; on the product page
 * it drops its label on very narrow screens.
 */
export function CartButton({
  placement = "top",
}: {
  placement?: "toolbar" | "top";
}) {
  const count = useCart().reduce((sum, line) => sum + line.quantity, 0);
  const toolbar = placement === "toolbar";
  return (
    <button
      type="button"
      className={cn(shopPillButton, toolbar && toolbarPillButton)}
      onClick={openCart}
      aria-label={`เปิดตะกร้า มีสินค้า ${count} ชิ้น`}
    >
      <ShoppingBagIcon size={16} weight="bold" aria-hidden="true" />
      <span className={toolbar ? undefined : "max-[26.25rem]:hidden"}>
        ตะกร้า
      </span>
      <span
        className={cn(
          "grid h-8 min-w-8 place-items-center rounded-full bg-navy px-2 text-small font-bold tabular-nums",
          count === 0 ? "text-cream/60" : "text-cream",
          toolbar &&
            "max-md:absolute max-md:-top-0.5 max-md:-right-0.5 max-md:h-5 max-md:min-w-5 max-md:bg-amber-soft max-md:text-micro max-md:text-ink max-md:shadow-[0_0_0_2px_var(--color-paper)]",
          toolbar && count === 0 && "max-md:hidden",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function useCartDetails(products: ShopProduct[]) {
  const lines = useCart();
  const validLines = lines.flatMap((line) => {
    const product = products.find((item) => item.slug === line.slug);
    return product && product.stock_qty > 0
      ? [
          {
            ...line,
            quantity: Math.min(line.quantity, lineLimit(product)),
            product,
          },
        ]
      : [];
  });
  const total = validLines.reduce(
    (sum, line) => sum + line.product.price_satang * line.quantity,
    0,
  );
  const count = validLines.reduce((sum, line) => sum + line.quantity, 0);
  return { validLines, total, count };
}

function CartLines({
  lines,
  onNavigate,
}: {
  lines: ReturnType<typeof useCartDetails>["validLines"];
  onNavigate?: () => void;
}) {
  return (
    <ul>
      {lines.map(({ slug, quantity, product }) => {
        return (
          <li
            className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-start gap-3.5 border-b border-line py-4 last:border-b-0 max-[26.25rem]:grid-cols-[52px_minmax(0,1fr)]"
            key={slug}
          >
            <Link
              href={`/shop/${slug}`}
              className="relative grid size-16 place-items-center overflow-hidden rounded-tile bg-paper-soft text-ink-faint max-[26.25rem]:size-[52px]"
              onClick={onNavigate}
              tabIndex={-1}
              aria-hidden="true"
            >
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder />
              )}
            </Link>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Link
                href={`/shop/${slug}`}
                onClick={onNavigate}
                className="text-body leading-[1.4] font-semibold hover:underline"
              >
                {product.title}
              </Link>
              <span className="text-small text-ink-muted">
                {formatPrice(product.price_satang)} / ชิ้น
              </span>
              <div className="mt-2 flex items-center gap-1.5">
                <QuantityStepper
                  value={quantity}
                  max={lineLimit(product)}
                  onChange={(value) => setLineQuantity(slug, value)}
                  label={`จำนวน ${product.title}`}
                />
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-full text-ink-muted hover:bg-danger-tint hover:text-danger-ink"
                  onClick={() => setLineQuantity(slug, 0)}
                  aria-label={`ลบ ${product.title} ออกจากตะกร้า`}
                >
                  <TrashIcon size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <strong className="text-body whitespace-nowrap tabular-nums max-[26.25rem]:col-start-2">
              {formatPrice(product.price_satang * quantity)}
            </strong>
          </li>
        );
      })}
    </ul>
  );
}

function useCheckout(lines: ReturnType<typeof useCartDetails>["validLines"]) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/shop-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map(({ slug, quantity }) => ({ slug, quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.url)
        throw new Error(result.error || "เริ่มการชำระเงินไม่สำเร็จ");
      window.location.assign(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "เกิดข้อผิดพลาด");
      setBusy(false);
    }
  }
  return { checkout, busy, error };
}

function CheckoutBlock({
  total,
  checkoutReady,
  lines,
}: {
  total: number;
  checkoutReady: boolean;
  lines: ReturnType<typeof useCartDetails>["validLines"];
}) {
  const { checkout, busy, error } = useCheckout(lines);
  const { user, loading, signInWithGoogle } = useAuth();
  const blockButton = cn(shopButton, "w-full");
  return (
    <div className="w-full">
      <dl className="mb-[18px]">
        <div className="flex justify-between gap-4 py-1.5 text-body-sm">
          <dt className="text-ink-muted">ยอดสินค้า</dt>
          <dd className="text-right tabular-nums">{formatPrice(total)}</dd>
        </div>
        <div
          data-testid="checkout-total"
          className="mt-2 flex justify-between gap-4 border-t border-line py-1.5 pt-3.5 text-lead"
        >
          <dt className="font-semibold text-ink">รวม</dt>
          <dd className="text-right font-bold tabular-nums">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>
      {checkoutReady && !loading && !user ? (
        <>
          <button
            type="button"
            className={blockButton}
            onClick={signInWithGoogle}
          >
            <SignInIcon size={16} weight="bold" aria-hidden="true" />
            เข้าสู่ระบบเพื่อชำระเงิน
          </button>
          <p className={shopFineprint}>
            ต้องเข้าสู่ระบบก่อนสั่งซื้อ
            เพื่อให้ติดตามคำสั่งซื้อและสถานะจัดส่งได้
          </p>
        </>
      ) : checkoutReady ? (
        <button
          type="button"
          className={blockButton}
          disabled={busy || !lines.length}
          onClick={checkout}
        >
          {busy ? "กำลังไปหน้าชำระเงิน…" : "ชำระเงิน"}
        </button>
      ) : (
        <p className={shopNote}>ยังไม่เปิดให้ชำระเงินในขณะนี้</p>
      )}
      <p className={shopFineprint}>ชำระด้วย PromptPay หรือบัตร ผ่าน Stripe</p>
      {error && (
        <p role="alert" className={cn(shopAlert, "mt-3 mb-0")}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Slide-in cart. Native <dialog> provides the focus trap, Escape and focus return. */
export function CartDrawer({
  products,
  checkoutReady,
  openOnLoad = false,
  notice,
}: {
  products: ShopProduct[];
  checkoutReady: boolean;
  /** Open right away, e.g. after returning from a cancelled Stripe payment. */
  openOnLoad?: boolean;
  /** Message shown at the top of the drawer, e.g. a payment that could not be confirmed. */
  notice?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { validLines, total, count } = useCartDetails(products);
  useEffect(() => {
    const open = () => dialog.current?.showModal();
    window.addEventListener(openEventName, open);
    if (openOnLoad) {
      open();
      // Drop ?cart / ?payment so a refresh does not reopen the drawer.
      const url = new URL(window.location.href);
      url.searchParams.delete("cart");
      url.searchParams.delete("payment");
      window.history.replaceState(window.history.state, "", url);
    }
    return () => window.removeEventListener(openEventName, open);
  }, [openOnLoad]);
  const close = () => dialog.current?.close();
  return (
    <dialog
      ref={dialog}
      className="focus-ink fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-[min(420px,100vw)] max-w-[100vw] translate-x-full overflow-visible border-0 bg-transparent p-0 text-ink transition-[translate,overlay,display] transition-discrete duration-200 backdrop:bg-ink/0 backdrop:transition-[background-color,backdrop-filter,overlay,display] backdrop:transition-discrete backdrop:duration-200 backdrop:backdrop-blur-none open:translate-x-0 open:backdrop:bg-ink/28 open:backdrop:backdrop-blur-[2px] starting:open:translate-x-full starting:open:backdrop:bg-ink/0 starting:open:backdrop:backdrop-blur-none"
      aria-labelledby="store-drawer-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="flex h-full flex-col rounded-l-card bg-paper shadow-[-24px_0_60px_-20px_rgb(24_24_24/0.25)]">
        <header className="flex items-center justify-between gap-4 border-b border-line pt-5 pr-5 pb-4 pl-6">
          <h2 id="store-drawer-title" className="text-title-sm">
            ตะกร้า{" "}
            <span className="ml-1.5 text-body-sm font-normal text-ink-muted">
              {count} ชิ้น
            </span>
          </h2>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full bg-ink/5 text-ink hover:bg-ink/10"
            onClick={close}
            aria-label="ปิดตะกร้า"
          >
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </header>
        {notice && (
          <p className={cn(shopAlert, "mx-6 mt-4 mb-0")} role="alert">
            {notice}
          </p>
        )}
        {validLines.length ? (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-1">
              <CartLines lines={validLines} onNavigate={close} />
            </div>
            <footer className="mx-3 mb-3 flex flex-col items-center gap-3.5 rounded-card bg-cream px-5 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-ledge-sm">
              <CheckoutBlock
                total={total}
                checkoutReady={checkoutReady}
                lines={validLines}
              />
            </footer>
          </>
        ) : (
          <ShopEmpty
            className="m-6 flex-1 justify-center"
            icon={<ShoppingBagIcon size={32} aria-hidden="true" />}
            title="ตะกร้ายังว่างอยู่"
            action={
              <Link className={shopButton} href="/shop" onClick={close}>
                เลือกสินค้า
              </Link>
            }
          >
            เลือกของน่ารัก ๆ จากเพื่อนตัวน้อยได้เลย
          </ShopEmpty>
        )}
      </div>
    </dialog>
  );
}
