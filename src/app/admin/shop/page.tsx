import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  ClockIcon,
  CoinsIcon,
  ImageIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { saveProduct } from "./actions";
import { AdminSheet } from "@/components/admin-sheet";
import { kindLabel, lowStockThreshold } from "@/components/shop/product-card";
import { isAdmin } from "@/lib/supabase/contents";
import { createClient } from "@/lib/supabase/server";
import { getProducts, type ShopProduct } from "@/lib/shop/catalog";
import {
  getRecentOrders,
  getShopStats,
  orderStatusLabel,
  type OrderStatus,
} from "@/lib/shop/admin-stats";
import { formatPrice } from "@/lib/shop/price";
import { characters, getCharacter } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductImageField } from "@/components/admin-product-image-field";
import "./admin-shop.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "ร้านค้า · Pawsons Admin" };

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});
const number = new Intl.NumberFormat("th-TH");

type SearchParams = {
  tab?: string;
  show?: string;
  status?: string;
  q?: string;
  edit?: string;
  new?: string;
  saved?: string;
  error?: string;
};

const productFilters = [
  ["all", "ทั้งหมด"],
  ["active", "แสดงอยู่"],
  ["hidden", "ซ่อนอยู่"],
  ["low", "ใกล้หมด"],
] as const;
const orderStatuses = ["paid", "pending", "canceled"] as const;

const errorMessage: Record<string, string> = {
  invalid: "ข้อมูลสินค้าไม่ถูกต้อง กรุณาตรวจ slug ราคา จำนวน และ TYPE",
  duplicate: "มีสินค้าที่ใช้ slug นี้อยู่แล้ว กรุณาเปลี่ยน slug",
  save: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง",
  image: "รูปต้องเป็น JPG, PNG หรือ WebP และไม่เกิน 5MB",
  upload: "อัปโหลดรูปไม่สำเร็จ ข้อมูลสินค้ายังไม่ถูกบันทึก กรุณาลองอีกครั้ง",
};

export default async function AdminShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (!(await isAdmin())) redirect("/");
  const params = await searchParams;
  const tab = params.tab === "orders" ? "orders" : "products";
  const show = productFilters.some(([value]) => value === params.show) ? params.show! : "all";
  const status = orderStatuses.find((value) => value === params.status);
  const q = params.q?.trim().toLowerCase() ?? "";
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase unavailable");

  const [products, stats, { orders, error: ordersError }] = await Promise.all([
    getProducts(true),
    getShopStats(supabase),
    getRecentOrders(supabase, { status, limit: 50 }),
  ]);

  const isLow = (product: ShopProduct) => product.active && product.stock_qty <= lowStockThreshold;
  const lowStockCount = products.filter(isLow).length;
  const visibleProducts = products.filter((product) => {
    const matchesFilter =
      show === "all" ||
      (show === "active" && product.active) ||
      (show === "hidden" && !product.active) ||
      (show === "low" && isLow(product));
    const matchesQuery =
      !q ||
      [product.title, product.slug, product.character_type].some((value) =>
        value.toLowerCase().includes(q),
      );
    return matchesFilter && matchesQuery;
  });
  const editing = params.edit ? products.find((product) => product.slug === params.edit) : undefined;
  const creating = params.new === "1";
  const savedProduct = params.saved
    ? products.find((product) => product.slug === params.saved)
    : undefined;
  const href = (next: Partial<SearchParams>) => {
    const merged = { tab, show, status, q: params.q, ...next };
    const search = new URLSearchParams();
    if (merged.tab === "orders") search.set("tab", "orders");
    if (merged.tab !== "orders" && merged.show && merged.show !== "all") search.set("show", merged.show);
    if (merged.tab === "orders" && merged.status) search.set("status", merged.status);
    if (merged.tab !== "orders" && merged.q) search.set("q", merged.q);
    if (next.edit) search.set("edit", next.edit);
    if (next.new) search.set("new", next.new);
    return `/admin/shop${search.size ? `?${search}` : ""}`;
  };
  const totalOrders = stats.counts.paid + stats.counts.pending + stats.counts.canceled;

  return (
    <div className="admin-contents-page ashop">
      <header className="admin-page-header ashop-header">
        <div>
          <p className="ashop-kicker">
            <span aria-hidden="true" /> STORE · SANDBOX
          </p>
          <h1 className="admin-page-title">ร้านค้า</h1>
          <p className="admin-page-sub">สินค้า สต็อก และออเดอร์ทดสอบของร้าน</p>
        </div>
        <div className="ashop-header-actions">
          <Link href="/shop" className="ashop-button ashop-button--ghost" target="_blank">
            ดูหน้าร้าน <ArrowSquareOutIcon size={16} aria-hidden="true" />
          </Link>
          <Link href={href({ tab: "products", new: "1" })} className="ashop-button" scroll={false}>
            <PlusIcon size={16} weight="bold" aria-hidden="true" /> เพิ่มสินค้า
          </Link>
        </div>
      </header>

      {savedProduct && (
        <p className="ashop-toast" role="status">
          <CheckCircleIcon size={18} weight="fill" aria-hidden="true" />
          บันทึก “{savedProduct.title}” แล้ว
          {savedProduct.active && (
            <Link href={`/shop/${savedProduct.slug}`} target="_blank">
              ดูบนหน้าร้าน
            </Link>
          )}
        </p>
      )}

      <section className="ashop-kpis" aria-label="ภาพรวมร้านค้า">
        <Kpi
          icon={<CoinsIcon size={18} aria-hidden="true" />}
          label="ยอดชำระ 30 วัน"
          value={stats.failed ? "—" : formatPrice(stats.revenue30d)}
          detail={stats.failed ? "โหลดข้อมูลไม่สำเร็จ" : `${number.format(stats.paid30d)} ออเดอร์ · ข้อมูลทดสอบ`}
          tone="green"
        />
        <Kpi
          icon={<CheckCircleIcon size={18} aria-hidden="true" />}
          label="ออเดอร์ชำระแล้ว"
          value={stats.failed ? "—" : number.format(stats.counts.paid)}
          detail={`จากทั้งหมด ${number.format(totalOrders)} ออเดอร์`}
        />
        <Kpi
          icon={<ClockIcon size={18} aria-hidden="true" />}
          label="รอชำระ"
          value={stats.failed ? "—" : number.format(stats.counts.pending)}
          detail="Checkout ที่ยังไม่ยืนยันยอด"
          tone={stats.counts.pending ? "amber" : undefined}
          href={href({ tab: "orders", status: "pending" })}
        />
        <Kpi
          icon={<WarningCircleIcon size={18} aria-hidden="true" />}
          label="สต็อกใกล้หมด"
          value={number.format(lowStockCount)}
          detail={`สินค้าที่แสดงและเหลือ ≤ ${lowStockThreshold} ชิ้น`}
          tone={lowStockCount ? "red" : undefined}
          href={href({ tab: "products", show: "low", q: "" })}
        />
      </section>

      <nav className="ashop-tabs" aria-label="ส่วนของร้านค้า">
        <Link
          aria-current={tab === "products" ? "page" : undefined}
          href={href({ tab: "products" })}
          scroll={false}
        >
          สินค้า <span>{products.length}</span>
        </Link>
        <Link
          aria-current={tab === "orders" ? "page" : undefined}
          href={href({ tab: "orders" })}
          scroll={false}
        >
          ออเดอร์ <span>{totalOrders}</span>
        </Link>
      </nav>

      {tab === "products" ? (
        <section className="ashop-panel" aria-label="รายการสินค้า">
          <div className="ashop-toolbar">
            <nav className="ashop-chips" aria-label="กรองสินค้า">
              {productFilters.map(([value, label]) => (
                <Link
                  key={value}
                  href={href({ show: value })}
                  aria-current={show === value ? "page" : undefined}
                  scroll={false}
                >
                  {label}
                  {value === "low" && lowStockCount > 0 && <span>{lowStockCount}</span>}
                </Link>
              ))}
            </nav>
            <form className="ashop-search" action="/admin/shop" role="search">
              {show !== "all" && <input type="hidden" name="show" value={show} />}
              <MagnifyingGlassIcon size={16} aria-hidden="true" />
              <input
                name="q"
                type="search"
                defaultValue={params.q}
                placeholder="ค้นหาชื่อ slug หรือ TYPE"
                aria-label="ค้นหาสินค้า"
              />
            </form>
          </div>
          {visibleProducts.length ? (
            <div className="ashop-table-wrap">
              <table className="ashop-table">
                <thead>
                  <tr>
                    <th scope="col">สินค้า</th>
                    <th scope="col">ประเภท</th>
                    <th scope="col" className="is-num">ราคา</th>
                    <th scope="col" className="is-num">สต็อก</th>
                    <th scope="col">สถานะ</th>
                    <th scope="col">
                      <span className="sr-only">แก้ไข</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => (
                    <ProductRow
                      key={product.slug}
                      product={product}
                      editHref={href({ edit: product.slug })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="ashop-empty">
              {products.length ? "ไม่พบสินค้าที่ตรงกับตัวกรอง" : "ยังไม่มีสินค้า เพิ่มสินค้าทดสอบรายการแรกได้เลย"}
            </p>
          )}
        </section>
      ) : (
        <section className="ashop-panel" aria-label="ออเดอร์">
          <div className="ashop-toolbar">
            <nav className="ashop-chips" aria-label="กรองสถานะออเดอร์">
              <Link
                href={href({ status: undefined })}
                aria-current={!status ? "page" : undefined}
                scroll={false}
              >
                ทั้งหมด <span>{totalOrders}</span>
              </Link>
              {orderStatuses.map((value) => (
                <Link
                  key={value}
                  href={href({ status: value })}
                  aria-current={status === value ? "page" : undefined}
                  scroll={false}
                >
                  {orderStatusLabel[value]} <span>{stats.counts[value]}</span>
                </Link>
              ))}
            </nav>
            <span className="ashop-toolbar-note">แสดงล่าสุด 50 รายการ</span>
          </div>
          {ordersError ? (
            <p className="ashop-empty" role="alert">
              โหลดออเดอร์ไม่สำเร็จ
            </p>
          ) : orders.length ? (
            <div className="ashop-table-wrap">
              <table className="ashop-table">
                <thead>
                  <tr>
                    <th scope="col">ออเดอร์</th>
                    <th scope="col">ลูกค้า / รายการ</th>
                    <th scope="col" className="is-num">ยอดรวม</th>
                    <th scope="col">วันที่สร้าง</th>
                    <th scope="col">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <code className="ashop-order-id" title={order.id}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </code>
                      </td>
                      <td>
                        <div className="ashop-cell-stack">
                          <strong>{order.email || "ยังไม่มีอีเมล"}</strong>
                          <small>
                            {order.shop_order_items
                              ?.map((item) => `${item.title} × ${item.quantity}`)
                              .join(", ") || "—"}
                          </small>
                        </div>
                      </td>
                      <td className="is-num">
                        <strong>{formatPrice(order.total_satang)}</strong>
                      </td>
                      <td>
                        <time dateTime={order.created_at} className="ashop-date">
                          {dateFormatter.format(new Date(order.created_at))}
                        </time>
                      </td>
                      <td>
                        <StatusPill status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="ashop-empty">
              {status ? `ยังไม่มีออเดอร์สถานะ “${orderStatusLabel[status]}”` : "ยังไม่มีออเดอร์ทดสอบ"}
            </p>
          )}
        </section>
      )}

      {(editing || creating) && (
        <AdminSheet
          title={editing ? "แก้ไขสินค้า" : "เพิ่มสินค้าทดสอบ"}
          description={editing ? editing.slug : "ข้อมูลจะบันทึกลงแคตตาล็อกของร้านทดลอง"}
          closeHref={href({})}
        >
          {params.error && (
            <p className="ashop-alert" role="alert">
              {errorMessage[params.error] ?? errorMessage.save}
            </p>
          )}
          <ProductForm product={editing} />
        </AdminSheet>
      )}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  detail,
  tone,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: "green" | "amber" | "red";
  href?: string;
}) {
  const body = (
    <>
      <span className="ashop-kpi-label">
        <span className="ashop-kpi-icon">{icon}</span>
        {label}
      </span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </>
  );
  const className = `ashop-kpi${tone ? ` is-${tone}` : ""}`;
  return href ? (
    <Link href={href} className={className} scroll={false}>
      {body}
    </Link>
  ) : (
    <article className={className}>{body}</article>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`ashop-pill is-${status}`}>{orderStatusLabel[status]}</span>;
}

function ProductThumb({ product }: { product: ShopProduct }) {
  const photo = product.image_url;
  return (
    <span className={`ashop-thumb${photo ? " is-photo" : ""}`} aria-hidden="true">
      {photo ? <Image src={photo} alt="" fill sizes="44px" /> : <ImageIcon size={18} />}
    </span>
  );
}

function ProductRow({ product, editHref }: { product: ShopProduct; editHref: string }) {
  const character = getCharacter(product.character_type);
  const low = product.stock_qty <= lowStockThreshold;
  return (
    <tr className={product.active ? undefined : "is-muted"}>
      <td>
        <div className="ashop-product">
          <ProductThumb product={product} />
          <div className="ashop-cell-stack">
            <strong>{product.title}</strong>
            <small>{product.slug}</small>
          </div>
        </div>
      </td>
      <td>
        <div className="ashop-cell-stack">
          <span>{kindLabel[product.kind]}</span>
          <small>
            {product.character_type}
            {character && ` · ${character.name}`}
          </small>
        </div>
      </td>
      <td className="is-num">{formatPrice(product.price_satang)}</td>
      <td className="is-num">
        <span className={`ashop-stock${product.stock_qty < 1 ? " is-out" : low ? " is-low" : ""}`}>
          {number.format(product.stock_qty)}
        </span>
      </td>
      <td>
        <span className={`ashop-pill ${product.active ? "is-live" : "is-hidden"}`}>
          {product.active ? "แสดงอยู่" : "ซ่อนอยู่"}
        </span>
      </td>
      <td className="is-action">
        <Link href={editHref} className="ashop-icon-button" scroll={false} aria-label={`แก้ไข ${product.title}`}>
          <PencilSimpleIcon size={16} aria-hidden="true" />
        </Link>
      </td>
    </tr>
  );
}

function ProductForm({ product }: { product?: ShopProduct }) {
  return (
    <form action={saveProduct} className="ashop-form">
      <input type="hidden" name="mode" value={product ? "edit" : "new"} />
      <fieldset className="is-single">
        <legend>รูปสินค้า</legend>
        <ProductImageField
          currentSrc={product?.image_url ?? null}
        />
      </fieldset>
      <fieldset>
        <legend>ข้อมูลสินค้า</legend>
        <label className="is-wide">
          ชื่อสินค้า
          <Input name="title" defaultValue={product?.title} required maxLength={120} />
        </label>
        <label className="is-wide">
          Slug
          <Input
            name="slug"
            defaultValue={product?.slug}
            readOnly={Boolean(product)}
            required
            pattern="[a-z0-9-]+"
            placeholder="infp-sticker"
            aria-describedby="slug-hint"
          />
          <small id="slug-hint">
            {product ? "slug ใช้ใน URL และแก้ไขไม่ได้" : "ตัวพิมพ์เล็ก a-z ตัวเลข และ - เท่านั้น ใช้ใน URL"}
          </small>
        </label>
        <label className="is-wide">
          รายละเอียด
          <Textarea name="description" defaultValue={product?.description} maxLength={1000} rows={3} />
        </label>
        <label>
          ประเภท
          <select name="kind" defaultValue={product?.kind || "sticker"}>
            <option value="sticker">สติกเกอร์</option>
            <option value="postcard">โปสการ์ด</option>
          </select>
        </label>
        <label>
          TYPE
          <select name="character_type" defaultValue={product?.character_type || "INFP"}>
            {characters.map((character) => (
              <option key={character.type} value={character.type}>
                {character.type} · {character.name}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>ราคาและสต็อก</legend>
        <label>
          ราคา (บาท)
          <Input
            name="price_baht"
            type="number"
            min="1"
            max="100000"
            step="1"
            defaultValue={product ? product.price_satang / 100 : 59}
            required
          />
        </label>
        <label>
          จำนวนคงเหลือ (จำลอง)
          <Input
            name="stock_qty"
            type="number"
            min="0"
            max="100000"
            defaultValue={product?.stock_qty ?? 25}
            required
          />
        </label>
        <label>
          ลำดับการแสดง
          <Input name="sort_order" type="number" defaultValue={product?.sort_order ?? 100} required />
        </label>
      </fieldset>
      <label className="ashop-switch">
        <input name="active" type="checkbox" role="switch" defaultChecked={product?.active ?? false} />
        <span className="ashop-switch-track" aria-hidden="true" />
        <span>
          <strong>แสดงบนหน้าร้าน</strong>
          <small>ปิดไว้เพื่อซ่อนสินค้าจากลูกค้าโดยไม่ต้องลบ</small>
        </span>
      </label>
      <div className="ashop-form-footer">
        <Button type="submit" variant="unstyled" size="auto" className="ashop-button">
          {product ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มสินค้า"}
        </Button>
      </div>
    </form>
  );
}
