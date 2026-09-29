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
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { NoProductImage } from "@/components/shop/no-product-image";
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
    <Button
      type="button"
      variant="unstyled"
      size="auto"
      className={`store-add-icon${added ? " is-added" : ""}`}
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
        <CheckIcon size={18} weight="bold" aria-hidden="true" />
      ) : (
        <PlusIcon size={18} weight="bold" aria-hidden="true" />
      )}
      <span className="sr-only" aria-live="polite">
        {added ? "เพิ่มลงตะกร้าแล้ว" : ""}
      </span>
    </Button>
  );
}

export function QuantityStepper({
  value,
  max,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={`store-stepper store-stepper--${size}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="ลดจำนวน"
      >
        <MinusIcon size={14} weight="bold" aria-hidden="true" />
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="เพิ่มจำนวน"
      >
        <PlusIcon size={14} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Quantity + add button for the product detail page; opens the cart drawer. */
export function AddToCartPanel({ product }: { product: ShopProduct }) {
  const [quantity, setQuantity] = useState(1);
  const lines = useCart();
  const inCart =
    lines.find((line) => line.slug === product.slug)?.quantity ?? 0;
  const remaining = lineLimit(product) - inCart;
  if (product.stock_qty < 1)
    return (
      <div className="store-buy-actions">
        <Button
          type="button"
          variant="unstyled"
          size="auto"
          className="store-cta"
          disabled
        >
          หมดชั่วคราว
        </Button>
      </div>
    );
  return (
    <div className="store-buy-actions">
      <QuantityStepper
        value={Math.min(quantity, Math.max(remaining, 1))}
        max={Math.max(remaining, 1)}
        onChange={setQuantity}
        label="จำนวนที่ต้องการ"
      />
      <Button
        type="button"
        variant="unstyled"
        size="auto"
        className="store-cta"
        disabled={remaining < 1}
        onClick={() => {
          addToCart(product, Math.min(quantity, remaining));
          setQuantity(1);
          openCart();
        }}
      >
        <ShoppingBagIcon size={18} weight="bold" aria-hidden="true" />
        {remaining < 1 ? "ครบจำนวนสูงสุดในตะกร้าแล้ว" : "ใส่ตะกร้า"}
      </Button>
    </div>
  );
}

/** Header button showing the item count; opens the drawer. */
export function CartButton() {
  const count = useCart().reduce((sum, line) => sum + line.quantity, 0);
  return (
    <Button
      type="button"
      variant="unstyled"
      size="auto"
      className="store-cart-button"
      onClick={openCart}
      aria-label={`เปิดตะกร้า มีสินค้า ${count} ชิ้น`}
    >
      <ShoppingBagIcon size={18} weight="bold" aria-hidden="true" />
      <span>ตะกร้า</span>
      <span className="store-cart-count" data-empty={count === 0 || undefined}>
        {count}
      </span>
    </Button>
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
    <ul className="store-lines">
      {lines.map(({ slug, quantity, product }) => {
        return (
          <li className="store-line" key={slug}>
            <Link
              href={`/shop/${slug}`}
              className="store-line-thumb"
              onClick={onNavigate}
              tabIndex={-1}
              aria-hidden="true"
            >
              {product.image_url ? (
                <Image src={product.image_url} alt="" fill sizes="64px" />
              ) : (
                <NoProductImage label={false} />
              )}
            </Link>
            <div className="store-line-copy">
              <Link href={`/shop/${slug}`} onClick={onNavigate}>
                {product.title}
              </Link>
              <span>{formatPrice(product.price_satang)} / ชิ้น</span>
              <div className="store-line-controls">
                <QuantityStepper
                  size="sm"
                  value={quantity}
                  max={lineLimit(product)}
                  onChange={(value) => setLineQuantity(slug, value)}
                  label={`จำนวน ${product.title}`}
                />
                <button
                  type="button"
                  className="store-line-remove"
                  onClick={() => setLineQuantity(slug, 0)}
                  aria-label={`ลบ ${product.title} ออกจากตะกร้า`}
                >
                  <TrashIcon size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <strong className="store-line-total">
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
  return (
    <div className="store-checkout">
      <dl>
        <div>
          <dt>ยอดสินค้า</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
        <div className="store-checkout-total">
          <dt>รวม</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {checkoutReady ? (
        <Button
          type="button"
          variant="unstyled"
          size="auto"
          className="store-cta store-cta--block"
          disabled={busy || !lines.length}
          onClick={checkout}
        >
          {busy ? "กำลังไปหน้าชำระเงิน…" : "ชำระเงิน"}
        </Button>
      ) : (
        <p className="store-note">ยังไม่เปิดให้ชำระเงินในขณะนี้</p>
      )}
      <p className="store-fineprint">ชำระด้วย PromptPay หรือบัตร ผ่าน Stripe</p>
      {error && (
        <p role="alert" className="store-alert">
          {error}
        </p>
      )}
    </div>
  );
}

function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="store-empty">
      <ShoppingBagIcon size={32} aria-hidden="true" />
      <p>ตะกร้ายังว่างอยู่</p>
      <span>เลือกของน่ารัก ๆ จากเพื่อนตัวน้อยได้เลย</span>
      <Link className="store-cta" href="/shop" onClick={onNavigate}>
        เลือกสินค้า
      </Link>
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
      className="store-drawer"
      aria-labelledby="store-drawer-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="store-drawer-panel">
        <header className="store-drawer-head">
          <h2 id="store-drawer-title">
            ตะกร้า <span>{count} ชิ้น</span>
          </h2>
          <button type="button" onClick={close} aria-label="ปิดตะกร้า">
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </header>
        {notice && (
          <p className="store-alert store-drawer-notice" role="alert">
            {notice}
          </p>
        )}
        {validLines.length ? (
          <>
            <div className="store-drawer-body">
              <CartLines lines={validLines} onNavigate={close} />
            </div>
            <footer className="store-drawer-foot">
              <CheckoutBlock
                total={total}
                checkoutReady={checkoutReady}
                lines={validLines}
              />
            </footer>
          </>
        ) : (
          <EmptyCart onNavigate={close} />
        )}
      </div>
    </dialog>
  );
}
