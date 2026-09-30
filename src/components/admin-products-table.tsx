"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowSquareOutIcon,
  CopyIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  ImageIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PackageIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  deleteProducts,
  duplicateProduct,
  setProductsActive,
  updateStock,
} from "@/app/admin/shop/actions";
import { StatusBadge } from "@/components/admin-status";
import { lowStockThreshold } from "@/components/shop/product-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { characters, getCharacter } from "@/lib/data";
import type { ProductSales } from "@/lib/shop/admin-stats";
import type { ShopProduct } from "@/lib/shop/catalog";
import { kindLabel, productKinds } from "@/lib/shop/kinds";
import { formatPrice } from "@/lib/shop/price";
import { cn } from "@/lib/utils";

const number = new Intl.NumberFormat("th-TH");
const noSales: ProductSales = {
  units: 0,
  revenue: 0,
  units30d: 0,
  lastSoldAt: null,
};

const statusFilters = {
  all: "ทั้งหมด",
  active: "แสดงอยู่",
  hidden: "ซ่อนอยู่",
  low: "ใกล้หมด",
  out: "หมดสต็อก",
} as const;
type StatusFilter = keyof typeof statusFilters;

const sorts = {
  order: "ลำดับการแสดง",
  bestselling: "ขายดีที่สุด",
  trending: "ขายดี 30 วัน",
  stock: "สต็อกน้อยสุด",
  priceHigh: "ราคาสูง → ต่ำ",
  priceLow: "ราคาต่ำ → สูง",
  title: "ชื่อ ก–ฮ / A–Z",
} as const;
type Sort = keyof typeof sorts;

const kindItems = [
  { value: "all", label: "ทุกประเภท" },
  ...productKinds.map((kind) => ({ value: kind, label: kindLabel[kind] })),
];
const typeItems = [
  { value: "all", label: "ทุก TYPE" },
  ...characters.map((c) => ({ value: c.type, label: `${c.type} · ${c.name}` })),
];
const sortItems = (Object.keys(sorts) as Sort[]).map((value) => ({
  value,
  label: sorts[value],
}));

const isLow = (product: ShopProduct) =>
  product.active &&
  product.stock_qty > 0 &&
  product.stock_qty <= lowStockThreshold;

/** Product list for /admin/shop: filter, sort, inline stock and visibility, bulk actions. */
export function AdminProductsTable({
  products,
  sales,
  salesFailed,
  initialStatus,
  initialQuery,
  editHref,
}: {
  products: ShopProduct[];
  sales: Record<string, ProductSales>;
  salesFailed: boolean;
  initialStatus?: string;
  initialQuery?: string;
  /** Base URL that opens the edit sheet, e.g. "/admin/shop?edit=". */
  editHref: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(products);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [status, setStatus] = useState<StatusFilter>(
    initialStatus && initialStatus in statusFilters
      ? (initialStatus as StatusFilter)
      : "all",
  );
  const [kind, setKind] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<Sort>("order");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => setRows(products), [products]);

  const salesOf = (slug: string) => sales[slug] ?? noSales;
  const counts: Record<StatusFilter, number> = {
    all: rows.length,
    active: rows.filter((p) => p.active).length,
    hidden: rows.filter((p) => !p.active).length,
    low: rows.filter(isLow).length,
    out: rows.filter((p) => p.stock_qty < 1).length,
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter(
      (p) =>
        (status === "all" ||
          (status === "active" && p.active) ||
          (status === "hidden" && !p.active) ||
          (status === "low" && isLow(p)) ||
          (status === "out" && p.stock_qty < 1)) &&
        (kind === "all" || p.kind === kind) &&
        (type === "all" || p.character_type === type) &&
        (!q ||
          [
            p.title,
            p.slug,
            p.character_type,
            getCharacter(p.character_type)?.name ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)),
    );
    const by: Record<Sort, (a: ShopProduct, b: ShopProduct) => number> = {
      order: (a, b) =>
        a.sort_order - b.sort_order || a.slug.localeCompare(b.slug),
      bestselling: (a, b) => salesOf(b.slug).units - salesOf(a.slug).units,
      trending: (a, b) => salesOf(b.slug).units30d - salesOf(a.slug).units30d,
      stock: (a, b) => a.stock_qty - b.stock_qty,
      priceHigh: (a, b) => b.price_satang - a.price_satang,
      priceLow: (a, b) => a.price_satang - b.price_satang,
      title: (a, b) => a.title.localeCompare(b.title, "th"),
    };
    return [...list].sort(by[sort]);
    // salesOf reads `sales`, which only changes with a new server render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query, status, kind, type, sort, sales]);

  const filtered =
    status !== "all" || kind !== "all" || type !== "all" || query.trim() !== "";
  const visibleSlugs = visible.map((p) => p.slug);
  const selectedVisible = visibleSlugs.filter((slug) => selected.has(slug));
  const allChecked =
    visible.length > 0 && selectedVisible.length === visible.length;

  function toggle(slug: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(slug);
      else next.delete(slug);
      return next;
    });
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setKind("all");
    setType("all");
  }

  function setActive(slugs: string[], active: boolean) {
    const before = rows;
    setRows((prev) =>
      prev.map((p) => (slugs.includes(p.slug) ? { ...p, active } : p)),
    );
    startTransition(async () => {
      const res = await setProductsActive(slugs, active);
      if (!res.success) {
        setRows(before);
        toast.error("อัปเดตไม่สำเร็จ", { description: res.error });
        return;
      }
      toast.success(
        `${active ? "แสดง" : "ซ่อน"}สินค้า ${slugs.length > 1 ? `${slugs.length} รายการ` : "แล้ว"}`,
      );
      setSelected(new Set());
      router.refresh();
    });
  }

  function saveStock(slug: string, stock: number) {
    const before = rows;
    setRows((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, stock_qty: stock } : p)),
    );
    startTransition(async () => {
      const res = await updateStock(slug, stock);
      if (!res.success) {
        setRows(before);
        toast.error("บันทึกสต็อกไม่สำเร็จ", { description: res.error });
        return;
      }
      router.refresh();
    });
  }

  function duplicate(slug: string) {
    startTransition(async () => {
      const res = await duplicateProduct(slug);
      if (!res.slug) {
        toast.error("ทำสำเนาไม่สำเร็จ", { description: res.error });
        return;
      }
      toast.success("สร้างสำเนาแล้ว", {
        description: "สำเนาถูกซ่อนไว้ แก้ไขและเพิ่มรูปก่อนเปิดขาย",
      });
      router.push(`${editHref}${res.slug}`, { scroll: false });
    });
  }

  function remove(slugs: string[]) {
    startTransition(async () => {
      const res = await deleteProducts(slugs);
      setConfirmDelete(null);
      if (res.error) toast.error("ลบไม่สำเร็จ", { description: res.error });
      if (res.deleted.length) {
        setRows((prev) => prev.filter((p) => !res.deleted.includes(p.slug)));
        toast.success(`ลบสินค้า ${res.deleted.length} รายการแล้ว`);
      }
      if (res.blocked.length) {
        toast.warning(
          `ลบไม่ได้ ${res.blocked.length} รายการ เพราะมีออเดอร์แล้ว`,
          {
            description: "ใช้ “ซ่อน” แทน เพื่อเก็บประวัติออเดอร์ไว้",
          },
        );
      }
      setSelected(new Set());
      router.refresh();
    });
  }

  function exportCsv() {
    const header = [
      "slug",
      "title",
      "kind",
      "type",
      "price_baht",
      "stock",
      "active",
      "units_sold",
      "revenue_baht",
      "units_30d",
    ];
    const cell = (value: string | number | boolean) =>
      `"${String(value).replaceAll('"', '""')}"`;
    const lines = visible.map((p) => {
      const s = salesOf(p.slug);
      return [
        p.slug,
        p.title,
        kindLabel[p.kind],
        p.character_type,
        p.price_satang / 100,
        p.stock_qty,
        p.active,
        s.units,
        s.revenue / 100,
        s.units30d,
      ]
        .map(cell)
        .join(",");
    });
    // BOM so Excel opens the Thai text as UTF-8.
    const blob = new Blob(["﻿" + [header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pawsons-products-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Phones: one select instead of a row of status tabs that would scroll. */}
        <FilterSelect
          label="กรองสถานะสินค้า"
          value={status}
          onChange={(value) => setStatus(value as StatusFilter)}
          items={(Object.keys(statusFilters) as StatusFilter[]).map(
            (value) => ({
              value,
              label: `${statusFilters[value]} (${counts[value]})`,
            }),
          )}
          className="w-full sm:hidden"
        />
        <nav
          aria-label="กรองสถานะสินค้า"
          className="hidden w-fit max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-muted p-[3px] sm:inline-flex"
        >
          {(Object.keys(statusFilters) as StatusFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => setStatus(value)}
              className={cn(
                "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm whitespace-nowrap text-foreground/60 transition-colors hover:text-foreground",
                status === value && "bg-background text-foreground shadow-sm",
              )}
            >
              {statusFilters[value]}
              <span
                className={cn(
                  "text-xs tabular-nums",
                  (value === "low" || value === "out") && counts[value]
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {counts[value]}
              </span>
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap gap-2">
          <InputGroup className="w-full sm:w-56">
            <InputGroupAddon>
              <MagnifyingGlassIcon />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาชื่อ slug TYPE"
              aria-label="ค้นหาสินค้า"
            />
          </InputGroup>
          <FilterSelect
            label="ประเภท"
            value={kind}
            onChange={setKind}
            items={kindItems}
            className="min-w-0 flex-1 sm:w-32 sm:flex-none"
          />
          <FilterSelect
            label="TYPE"
            value={type}
            onChange={setType}
            items={typeItems}
            className="min-w-0 flex-1 sm:w-36 sm:flex-none"
          />
          <FilterSelect
            label="เรียงตาม"
            value={sort}
            onChange={(value) => setSort(value as Sort)}
            items={sortItems}
            className="w-full sm:w-40"
          />
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={!visible.length}
            className="max-sm:hidden"
          >
            <DownloadSimpleIcon />
            CSV
          </Button>
        </div>
      </div>

      {visible.length ? (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="hidden w-10 sm:table-cell">
                  <Checkbox
                    checked={allChecked}
                    indeterminate={selectedVisible.length > 0 && !allChecked}
                    onCheckedChange={(checked) =>
                      setSelected(checked ? new Set(visibleSlugs) : new Set())
                    }
                    aria-label="เลือกทั้งหมด"
                  />
                </TableHead>
                <TableHead>สินค้า</TableHead>
                <TableHead className="hidden lg:table-cell">ประเภท</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  ราคา
                </TableHead>
                <TableHead className="hidden text-center sm:table-cell">
                  สต็อก
                </TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  ขายแล้ว
                </TableHead>
                <TableHead className="hidden text-center sm:table-cell">
                  หน้าร้าน
                </TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">จัดการ</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((product) => {
                const character = getCharacter(product.character_type);
                const s = salesOf(product.slug);
                const checked = selected.has(product.slug);
                return (
                  <TableRow
                    key={product.slug}
                    data-state={checked ? "selected" : undefined}
                  >
                    <TableCell className="hidden sm:table-cell">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggle(product.slug, Boolean(value))
                        }
                        aria-label={`เลือก ${product.title}`}
                      />
                    </TableCell>
                    <TableCell className="max-w-0 w-full sm:min-w-48">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`${editHref}${product.slug}`, {
                            scroll: false,
                          })
                        }
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon className="size-4 text-muted-foreground" />
                          )}
                        </span>
                        <span className="grid min-w-0">
                          <span
                            className={cn(
                              "truncate font-medium",
                              !product.active && "text-muted-foreground",
                            )}
                          >
                            {product.title}
                          </span>
                          <span className="truncate font-mono text-xs text-muted-foreground max-sm:hidden">
                            {product.slug}
                          </span>
                          <span className="truncate text-xs text-muted-foreground tabular-nums sm:hidden">
                            {formatPrice(product.price_satang)} ·{" "}
                            {kindLabel[product.kind]} · {product.character_type}
                          </span>
                        </span>
                      </button>
                      {/* Mobile: stock and storefront controls under the name. */}
                      <div className="mt-2 flex items-center justify-between gap-3 sm:hidden">
                        <StockEditor
                          key={product.stock_qty}
                          product={product}
                          disabled={pending}
                          onSave={(stock) => saveStock(product.slug, stock)}
                        />
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          หน้าร้าน
                          <Switch
                            checked={product.active}
                            disabled={pending}
                            onCheckedChange={(active) =>
                              setActive([product.slug], active)
                            }
                            aria-label={`${product.active ? "ซ่อน" : "แสดง"} ${product.title} บนหน้าร้าน`}
                          />
                        </label>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="grid">
                        <span>{kindLabel[product.kind]}</span>
                        <span className="text-xs whitespace-nowrap text-muted-foreground">
                          {product.character_type}
                          {character && ` · ${character.name}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">
                      {formatPrice(product.price_satang)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <StockEditor
                        key={product.stock_qty}
                        product={product}
                        disabled={pending}
                        onSave={(stock) => saveStock(product.slug, stock)}
                      />
                    </TableCell>
                    <TableCell className="hidden text-right md:table-cell">
                      {salesFailed ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="grid whitespace-nowrap">
                          <span className="tabular-nums">
                            {number.format(s.units)} ชิ้น
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatPrice(s.revenue)}
                            {s.units30d > 0 &&
                              ` · 30 วัน ${number.format(s.units30d)}`}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-center sm:table-cell">
                      <Switch
                        checked={product.active}
                        disabled={pending}
                        onCheckedChange={(active) =>
                          setActive([product.slug], active)
                        }
                        aria-label={`${product.active ? "ซ่อน" : "แสดง"} ${product.title} บนหน้าร้าน`}
                      />
                    </TableCell>
                    <TableCell className="max-sm:align-top">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`จัดการ ${product.title}`}
                            />
                          }
                        >
                          <DotsThreeIcon weight="bold" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`${editHref}${product.slug}`, {
                                scroll: false,
                              })
                            }
                          >
                            <PencilSimpleIcon />
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => duplicate(product.slug)}
                          >
                            <CopyIcon />
                            ทำสำเนา
                          </DropdownMenuItem>
                          {product.active && (
                            <DropdownMenuItem
                              render={
                                <a
                                  href={`/shop/${product.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                />
                              }
                            >
                              <ArrowSquareOutIcon />
                              ดูบนหน้าร้าน
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setConfirmDelete([product.slug])}
                          >
                            <TrashIcon />
                            ลบสินค้า
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>
              {rows.length ? "ไม่พบสินค้า" : "ยังไม่มีสินค้า"}
            </EmptyTitle>
            <EmptyDescription>
              {rows.length
                ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง"
                : "เพิ่มสินค้าทดสอบรายการแรกได้เลย"}
            </EmptyDescription>
          </EmptyHeader>
          {filtered && (
            <EmptyContent>
              <Button variant="outline" onClick={clearFilters}>
                ล้างตัวกรอง
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}

      <p className="text-xs text-muted-foreground">
        แสดง {number.format(visible.length)} จาก {number.format(rows.length)}{" "}
        รายการ · สต็อกเหลือ ≤ {lowStockThreshold} ชิ้นนับเป็นใกล้หมด ·
        ยอดขายนับเฉพาะออเดอร์ที่ชำระแล้ว
      </p>

      {selected.size > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-30 mx-auto flex w-fit max-w-[calc(100%-2rem)] flex-wrap items-center gap-2 rounded-xl border bg-popover p-2 pl-4 text-sm shadow-lg">
          <span className="font-medium">เลือก {selected.size} รายการ</span>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => setActive([...selected], true)}
          >
            <EyeIcon />
            แสดง
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => setActive([...selected], false)}
          >
            <EyeSlashIcon />
            ซ่อน
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => setConfirmDelete([...selected])}
          >
            <TrashIcon />
            ลบ
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
            aria-label="ยกเลิกการเลือก"
          >
            <XIcon />
          </Button>
        </div>
      )}

      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ลบสินค้า{" "}
              {confirmDelete && confirmDelete.length > 1
                ? `${confirmDelete.length} รายการ`
                : ""}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              สินค้าและรูปจะถูกลบถาวร
              สินค้าที่มีออเดอร์แล้วจะลบไม่ได้เพื่อเก็บประวัติการสั่งซื้อ ให้ใช้
              “ซ่อน” แทน
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() => confirmDelete && remove(confirmDelete)}
            >
              {pending ? "กำลังลบ..." : "ลบสินค้า"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  items,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as string)}
      items={items}
    >
      <SelectTrigger className={className} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Stock cell: − / + steppers and a typed value, saved on Enter or blur. */
function StockEditor({
  product,
  disabled,
  onSave,
}: {
  product: ShopProduct;
  disabled: boolean;
  onSave: (stock: number) => void;
}) {
  const [value, setValue] = useState(String(product.stock_qty));
  const commit = (next: number) => {
    if (!Number.isSafeInteger(next) || next < 0 || next > 100000) {
      setValue(String(product.stock_qty));
      return;
    }
    setValue(String(next));
    if (next !== product.stock_qty) onSave(next);
  };
  const tone =
    product.stock_qty < 1
      ? "text-destructive"
      : product.stock_qty <= lowStockThreshold
        ? "text-amber-600"
        : undefined;
  return (
    <div className="flex w-fit items-center gap-0.5 sm:mx-auto">
      <Button
        variant="ghost"
        size="icon-xs"
        disabled={disabled || product.stock_qty < 1}
        onClick={() => commit(product.stock_qty - 1)}
        aria-label={`ลดสต็อก ${product.title}`}
      >
        <MinusIcon />
      </Button>
      <Input
        value={value}
        inputMode="numeric"
        disabled={disabled}
        onChange={(event) => setValue(event.target.value.replace(/\D/g, ""))}
        onBlur={() => commit(Number(value || 0))}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") setValue(String(product.stock_qty));
        }}
        aria-label={`สต็อก ${product.title}`}
        className={cn(
          "h-7 w-14 px-1 text-center font-medium tabular-nums",
          tone,
        )}
      />
      <Button
        variant="ghost"
        size="icon-xs"
        disabled={disabled}
        onClick={() => commit(product.stock_qty + 1)}
        aria-label={`เพิ่มสต็อก ${product.title}`}
      >
        <PlusIcon />
      </Button>
      {product.stock_qty < 1 && (
        <StatusBadge tone="red" className="ml-1 hidden xl:inline-flex">
          หมด
        </StatusBadge>
      )}
    </div>
  );
}
