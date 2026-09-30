import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowSquareOutIcon,
  CaretRightIcon,
  PlusIcon,
  ReceiptIcon,
} from "@phosphor-icons/react/dist/ssr";
import { saveProduct } from "./actions";
import { AdminMetric } from "@/components/admin-metric";
import { AdminAlert, AdminOrderDetail } from "@/components/admin-order-detail";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminProductsTable } from "@/components/admin-products-table";
import { ProductImageField } from "@/components/admin-product-image-field";
import { AdminLinkSelect } from "@/components/admin-link-select";
import { AdminFlash, AdminSheet } from "@/components/admin-sheet";
import { OrderStatusBadge } from "@/components/admin-status";
import { lowStockThreshold } from "@/components/shop/product-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetFooter } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { characters } from "@/lib/data";
import {
  getAdminOrder,
  getProductSales,
  getRecentOrders,
  getShopStats,
  type ProductSales,
} from "@/lib/shop/admin-stats";
import { getProducts, type ShopProduct } from "@/lib/shop/catalog";
import { kindLabel, productKinds } from "@/lib/shop/kinds";
import { orderDate, orderNumber, orderStatusLabel } from "@/lib/shop/orders";
import { formatPrice } from "@/lib/shop/price";
import { isAdmin } from "@/lib/supabase/contents";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "ร้านค้า · Pawsons Admin" };

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
  order?: string;
  updated?: string;
};

const productFilters = [
  ["all", "ทั้งหมด"],
  ["active", "แสดงอยู่"],
  ["hidden", "ซ่อนอยู่"],
  ["low", "ใกล้หมด"],
  ["out", "หมดสต็อก"],
] as const;
const orderStatuses = ["paid", "pending", "canceled"] as const;
/** "to_ship" is the packing queue: paid orders not yet shipped. */
const orderFilters = ["to_ship", ...orderStatuses] as const;

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
  const show = productFilters.some(([value]) => value === params.show)
    ? params.show!
    : "all";
  const status = orderFilters.find((value) => value === params.status);
  const q = params.q?.trim().toLowerCase() ?? "";
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase unavailable");

  const [
    products,
    stats,
    { orders, error: ordersError },
    openOrder,
    { sales, failed: salesFailed },
  ] = await Promise.all([
    getProducts(true),
    getShopStats(supabase),
    getRecentOrders(
      supabase,
      status === "to_ship"
        ? { queue: "to_ship", limit: 50 }
        : { status, limit: 50 },
    ),
    params.order && /^[0-9a-f-]{36}$/.test(params.order)
      ? getAdminOrder(supabase, params.order)
      : null,
    getProductSales(supabase),
  ]);

  const activeProducts = products.filter((product) => product.active);
  const outOfStock = activeProducts.filter((product) => product.stock_qty < 1);
  const lowStock = activeProducts.filter(
    (product) =>
      product.stock_qty > 0 && product.stock_qty <= lowStockThreshold,
  );
  const stockUnits = products.reduce(
    (sum, product) => sum + product.stock_qty,
    0,
  );
  const stockValue = products.reduce(
    (sum, product) => sum + product.stock_qty * product.price_satang,
    0,
  );
  const topSeller = products
    .map((product) => ({ product, units: sales[product.slug]?.units30d ?? 0 }))
    .filter((entry) => entry.units > 0)
    .sort((a, b) => b.units - a.units)[0];
  const editing = params.edit
    ? products.find((product) => product.slug === params.edit)
    : undefined;
  const creating = params.new === "1";
  const savedProduct = params.saved
    ? products.find((product) => product.slug === params.saved)
    : undefined;
  const href = (next: Partial<SearchParams>) => {
    const merged = { tab, show, status, q: params.q, ...next };
    const search = new URLSearchParams();
    if (merged.tab === "orders") search.set("tab", "orders");
    if (merged.tab !== "orders" && merged.show && merged.show !== "all")
      search.set("show", merged.show);
    if (merged.tab === "orders" && merged.status)
      search.set("status", merged.status);
    if (merged.tab !== "orders" && merged.q) search.set("q", merged.q);
    if (next.edit) search.set("edit", next.edit);
    if (next.new) search.set("new", next.new);
    if (next.order) search.set("order", next.order);
    return `/admin/shop${search.size ? `?${search}` : ""}`;
  };
  const totalOrders =
    stats.counts.paid + stats.counts.pending + stats.counts.canceled;
  const filterCount = (value: (typeof orderFilters)[number]) =>
    value === "to_ship" ? stats.toShip : stats.counts[value];
  const filterLabel = (value: (typeof orderFilters)[number]) =>
    value === "to_ship" ? "รอจัดส่ง" : orderStatusLabel[value];
  const na = (value: string) => (stats.failed ? "—" : value);

  return (
    <>
      <AdminPageHeader
        title={tab === "orders" ? "ออเดอร์" : "สินค้า"}
        description="สินค้า สต็อก และออเดอร์ของร้าน · Stripe Sandbox"
        actions={
          <>
            <Link
              href="/shop"
              target="_blank"
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowSquareOutIcon />
              ดูหน้าร้าน
            </Link>
            <Link
              href={href({ tab: "products", new: "1" })}
              scroll={false}
              className={buttonVariants()}
            >
              <PlusIcon />
              เพิ่มสินค้า
            </Link>
          </>
        }
      />

      {savedProduct && (
        <AdminFlash
          message={`บันทึก “${savedProduct.title}” แล้ว`}
          description={
            savedProduct.active
              ? "แสดงบนหน้าร้านแล้ว"
              : "สินค้านี้ซ่อนอยู่จากหน้าร้าน"
          }
          cleanHref={href({})}
        />
      )}
      {params.updated === "1" && openOrder && !params.error && (
        <AdminFlash
          message="อัปเดตการจัดส่งแล้ว"
          cleanHref={href({ order: openOrder.id })}
        />
      )}

      {tab === "products" ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <AdminMetric
            label="สินค้าทั้งหมด"
            value={number.format(products.length)}
            detail={`แสดงอยู่ ${number.format(activeProducts.length)} · ซ่อน ${number.format(products.length - activeProducts.length)}`}
          />
          <AdminMetric
            label="มูลค่าสต็อก"
            value={formatPrice(stockValue)}
            detail={`${number.format(stockUnits)} ชิ้นในคลัง · คิดตามราคาขาย`}
          />
          <AdminMetric
            label="ต้องเติมสต็อก"
            value={number.format(outOfStock.length + lowStock.length)}
            detail={`หมด ${number.format(outOfStock.length)} · ใกล้หมด ${number.format(lowStock.length)} (แสดงอยู่)`}
            href={href({
              tab: "products",
              show: outOfStock.length ? "out" : "low",
              q: "",
            })}
          />
          <AdminMetric
            label="ขายดี 30 วัน"
            value={topSeller ? topSeller.product.title : "—"}
            detail={
              salesFailed
                ? "โหลดยอดขายไม่สำเร็จ"
                : topSeller
                  ? `${number.format(topSeller.units)} ชิ้นใน 30 วัน`
                  : "ยังไม่มียอดขายใน 30 วัน"
            }
            href={
              topSeller ? href({ edit: topSeller.product.slug }) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <AdminMetric
            label="ยอดชำระ 30 วัน"
            value={na(formatPrice(stats.revenue30d))}
            detail={
              stats.failed
                ? "โหลดข้อมูลไม่สำเร็จ"
                : `${number.format(stats.paid30d)} ออเดอร์ · ข้อมูลทดสอบ`
            }
          />
          <AdminMetric
            label="รอจัดส่ง"
            value={na(number.format(stats.toShip))}
            detail="ชำระแล้ว ยังไม่ได้ส่ง · เก่าสุดก่อน"
            href={href({ tab: "orders", status: "to_ship" })}
          />
          <AdminMetric
            label="รอชำระ"
            value={na(number.format(stats.counts.pending))}
            detail="Checkout ที่ยังไม่ยืนยันยอด"
            href={href({ tab: "orders", status: "pending" })}
          />
          <AdminMetric
            label="ออเดอร์ทั้งหมด"
            value={na(number.format(totalOrders))}
            detail={`ชำระแล้ว ${number.format(stats.counts.paid)} · ยกเลิก ${number.format(stats.counts.canceled)}`}
          />
        </div>
      )}

      <Card>
        <CardContent className="grid grid-cols-[minmax(0,1fr)] gap-4">
          {tab === "products" ? (
            <AdminProductsTable
              // Remount when a link (dashboard, metric) changes the starting filter.
              key={`${show}-${params.q ?? ""}`}
              products={products}
              sales={sales}
              salesFailed={salesFailed}
              initialStatus={show}
              initialQuery={params.q}
              editHref="/admin/shop?edit="
            />
          ) : (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <AdminLinkSelect
                label="กรองสถานะออเดอร์"
                value={status ?? "all"}
                items={[undefined, ...orderFilters].map((value) => ({
                  value: value ?? "all",
                  label: `${value ? filterLabel(value) : "ทั้งหมด"} (${number.format(value ? filterCount(value) : totalOrders)})`,
                  href: href({ status: value }),
                }))}
                className="w-full sm:hidden"
              />
              <nav
                aria-label="กรองสถานะออเดอร์"
                className="hidden w-fit max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-muted p-[3px] sm:inline-flex"
              >
                {[undefined, ...orderFilters].map((value) => (
                  <FilterLink
                    key={value ?? "all"}
                    href={href({ status: value })}
                    active={status === value}
                    count={value ? filterCount(value) : totalOrders}
                  >
                    {value ? filterLabel(value) : "ทั้งหมด"}
                  </FilterLink>
                ))}
              </nav>
              <span className="text-sm text-muted-foreground">
                {status === "to_ship"
                  ? "เก่าสุดก่อน · แสดง 50 รายการ"
                  : "ล่าสุดก่อน · แสดง 50 รายการ"}
              </span>
            </div>
          )}

          {tab === "products" ? null : ordersError ? (
            <AdminAlert>โหลดออเดอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</AdminAlert>
          ) : orders.length ? (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">
                      ออเดอร์
                    </TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      วันที่
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      สถานะ
                    </TableHead>
                    <TableHead className="text-right">ยอดรวม</TableHead>
                    <TableHead className="hidden w-10 sm:table-cell">
                      <span className="sr-only">ดูรายละเอียด</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="relative">
                      <TableCell className="hidden font-mono text-xs sm:table-cell">
                        {orderNumber(order.id)}
                      </TableCell>
                      <TableCell className="max-w-0 w-full">
                        <div className="grid">
                          <Link
                            href={href({ order: order.id })}
                            scroll={false}
                            className="truncate font-medium after:absolute after:inset-0"
                          >
                            <span className="sr-only">
                              ดูออเดอร์ {orderNumber(order.id)}{" "}
                            </span>
                            {order.customer_name ||
                              order.email ||
                              "ยังไม่มีอีเมล"}
                          </Link>
                          {/* Mobile: order number and status move under the name. */}
                          <span className="mb-1 flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
                            <span className="font-mono">
                              {orderNumber(order.id)}
                            </span>
                            <OrderStatusBadge order={order} />
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {order.shop_order_items
                              ?.map(
                                (item) => `${item.title} × ${item.quantity}`,
                              )
                              .join(", ") || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        <time dateTime={order.created_at}>
                          {orderDate.format(new Date(order.created_at))}
                        </time>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <OrderStatusBadge order={order} />
                      </TableCell>
                      <TableCell className="text-right align-top font-medium tabular-nums sm:align-middle">
                        {formatPrice(order.total_satang)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <CaretRightIcon className="size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={<ReceiptIcon />}
              title="ยังไม่มีออเดอร์"
              description={
                status
                  ? `ไม่มีออเดอร์สถานะ “${filterLabel(status)}”`
                  : "ออเดอร์ทดสอบจะแสดงที่นี่"
              }
            />
          )}
        </CardContent>
      </Card>

      {openOrder && (
        <AdminSheet
          title={`ออเดอร์ ${orderNumber(openOrder.id)}`}
          description={orderDate.format(new Date(openOrder.created_at))}
          closeHref={href({})}
        >
          <AdminOrderDetail
            order={openOrder}
            backHref={href({})}
            error={params.error}
          />
        </AdminSheet>
      )}

      {(editing || creating) && (
        <AdminSheet
          title={editing ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
          description={
            editing ? editing.slug : "ข้อมูลจะบันทึกลงแคตตาล็อกของร้านทดลอง"
          }
          closeHref={href({})}
        >
          <ProductForm
            product={editing}
            sales={editing ? sales[editing.slug] : undefined}
            error={params.error}
          />
        </AdminSheet>
      )}
    </>
  );
}

function FilterLink({
  href,
  active,
  count,
  children,
}: {
  href: string;
  active: boolean;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm whitespace-nowrap text-foreground/60 transition-colors hover:text-foreground",
        active && "bg-background text-foreground shadow-sm",
      )}
    >
      {children}
      <span className="text-xs text-muted-foreground tabular-nums">
        {number.format(count)}
      </span>
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

const kindItems = productKinds.map((kind) => ({
  value: kind,
  label: kindLabel[kind],
}));
const typeItems = characters.map((character) => ({
  value: character.type,
  label: `${character.type} · ${character.name}`,
}));

function ProductForm({
  product,
  sales,
  error,
}: {
  product?: ShopProduct;
  sales?: ProductSales;
  error?: string;
}) {
  return (
    <form action={saveProduct} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="mode" value={product ? "edit" : "new"} />
      <div className="flex-1 overflow-y-auto p-4">
        <FieldGroup>
          {error && (
            <AdminAlert>{errorMessage[error] ?? errorMessage.save}</AdminAlert>
          )}
          {product && (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
              {[
                ["ขายแล้ว", `${number.format(sales?.units ?? 0)} ชิ้น`],
                ["รายได้รวม", formatPrice(sales?.revenue ?? 0)],
                ["30 วันล่าสุด", `${number.format(sales?.units30d ?? 0)} ชิ้น`],
                [
                  "ขายล่าสุด",
                  sales?.lastSoldAt
                    ? orderDate.format(new Date(sales.lastSoldAt))
                    : "ยังไม่มี",
                ],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-0.5 bg-card p-3">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="truncate text-sm font-medium tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <Field>
            <FieldLabel>รูปสินค้า</FieldLabel>
            <ProductImageField currentSrc={product?.image_url ?? null} />
          </Field>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>ข้อมูลสินค้า</FieldLegend>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="product-title">ชื่อสินค้า</FieldLabel>
                <Input
                  id="product-title"
                  name="title"
                  defaultValue={product?.title}
                  required
                  maxLength={120}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="product-slug">Slug</FieldLabel>
                <Input
                  id="product-slug"
                  name="slug"
                  defaultValue={product?.slug}
                  readOnly={Boolean(product)}
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="infp-sticker"
                  className="font-mono read-only:bg-muted read-only:text-muted-foreground"
                />
                <FieldDescription>
                  {product
                    ? "slug ใช้ใน URL และแก้ไขไม่ได้"
                    : "ตัวพิมพ์เล็ก a-z ตัวเลข และ - เท่านั้น ใช้ใน URL"}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="product-description">
                  รายละเอียด
                </FieldLabel>
                <Textarea
                  id="product-description"
                  name="description"
                  defaultValue={product?.description}
                  maxLength={1000}
                  rows={3}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="product-kind">ประเภท</FieldLabel>
                  <Select
                    name="kind"
                    defaultValue={product?.kind || productKinds[0]}
                    items={kindItems}
                  >
                    <SelectTrigger id="product-kind" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kindItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="product-type">TYPE</FieldLabel>
                  <Select
                    name="character_type"
                    defaultValue={product?.character_type || "INFP"}
                    items={typeItems}
                  >
                    <SelectTrigger id="product-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>ราคาและสต็อก</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="product-price">ราคา (บาท)</FieldLabel>
                <Input
                  id="product-price"
                  name="price_baht"
                  type="number"
                  min="1"
                  max="100000"
                  step="1"
                  defaultValue={product ? product.price_satang / 100 : 59}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="product-stock">คงเหลือ</FieldLabel>
                <Input
                  id="product-stock"
                  name="stock_qty"
                  type="number"
                  min="0"
                  max="100000"
                  defaultValue={product?.stock_qty ?? 25}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="product-order">ลำดับการแสดง</FieldLabel>
                <Input
                  id="product-order"
                  name="sort_order"
                  type="number"
                  defaultValue={product?.sort_order ?? 100}
                  required
                />
              </Field>
            </div>
          </FieldSet>
          <FieldSeparator />
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="product-active">แสดงบนหน้าร้าน</FieldLabel>
              <FieldDescription>
                ปิดไว้เพื่อซ่อนสินค้าจากลูกค้าโดยไม่ต้องลบ
              </FieldDescription>
            </FieldContent>
            <Switch
              id="product-active"
              name="active"
              defaultChecked={product?.active ?? false}
            />
          </Field>
        </FieldGroup>
      </div>
      <SheetFooter className="flex-row justify-end border-t">
        {product?.active && (
          <Link
            href={`/shop/${product.slug}`}
            target="_blank"
            className={cn(buttonVariants({ variant: "ghost" }), "mr-auto")}
          >
            <ArrowSquareOutIcon />
            ดูบนหน้าร้าน
          </Link>
        )}
        <Button type="submit">
          {product ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มสินค้า"}
        </Button>
      </SheetFooter>
    </form>
  );
}
