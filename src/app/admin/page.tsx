import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CheckCircleIcon,
  ClockIcon,
  ImageIcon,
  PlusIcon,
  TruckIcon,
  WarningIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { AdminMetric as Metric } from "@/components/admin-metric";
import { AdminPageHeader } from "@/components/admin-page-header";
import { OrderStatusBadge } from "@/components/admin-status";
import { lowStockThreshold } from "@/components/shop/product-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { characters, getCharacter } from "@/lib/data";
import { getProducts } from "@/lib/shop/catalog";
import {
  getDiscountStats,
  getRecentOrders,
  getShopStats,
} from "@/lib/shop/admin-stats";
import { discountLabel } from "@/lib/shop/discounts";
import { orderDate, orderNumber } from "@/lib/shop/orders";
import { formatPrice } from "@/lib/shop/price";
import { isAdmin } from "@/lib/supabase/contents";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Pawsons Admin" };

const number = new Intl.NumberFormat("th-TH");
const shortDay = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Bangkok",
});
const dayOfMonth = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  timeZone: "Asia/Bangkok",
});
const joinDate = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeZone: "Asia/Bangkok",
});

export default async function AdminDashboard() {
  if (!(await isAdmin())) redirect("/");
  const supabase = await createClient();
  if (!supabase) throw new Error("Dashboard unavailable");

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const head = { count: "exact", head: true } as const;
  // Exact aggregate counts avoid downloading member details or truncating at the API row limit.
  const [members, recent, missingImages, newMembers, ...typeResults] =
    await Promise.all([
      supabase.from("profiles").select("id", head),
      supabase.from("profiles").select("id", head).gte("created_at", since),
      supabase.from("contents").select("id", head).is("cover_image_url", null),
      supabase
        .from("profiles")
        .select("id,display_name,avatar_url,assigned_character,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      ...characters.map((character) =>
        supabase
          .from("profiles")
          .select("id", head)
          .eq("assigned_character", character.type),
      ),
    ]);
  if (
    [members, recent, ...typeResults].some(
      (result) => result.error || result.count === null,
    )
  ) {
    throw new Error("Unable to load dashboard statistics");
  }
  const [products, shop, { orders: recentOrders }, discounts] =
    await Promise.all([
      getProducts(true),
      getShopStats(supabase),
      getRecentOrders(supabase, { limit: 6 }),
      getDiscountStats(supabase),
    ]);

  const distribution = characters
    .map((character, index) => ({
      ...character,
      count: typeResults[index].count!,
    }))
    .sort((a, b) => b.count - a.count);
  const saved = distribution.reduce(
    (total, character) => total + character.count,
    0,
  );
  const lowStock = products.filter(
    (product) => product.active && product.stock_qty <= lowStockThreshold,
  );
  const totalOrders =
    shop.counts.paid + shop.counts.pending + shop.counts.canceled;
  const peak = Math.max(...shop.daily.map((day) => day.satang), 1);
  const revenue14d = shop.daily.reduce((sum, day) => sum + day.satang, 0);
  const na = (value: string) => (shop.failed ? "—" : value);

  const todos: { href: string; label: string; count: number; icon: Icon }[] = [
    {
      href: "/admin/shop?tab=orders&status=to_ship",
      label: "ออเดอร์รอจัดส่ง",
      count: shop.toShip,
      icon: TruckIcon,
    },
    {
      href: "/admin/shop?tab=orders&status=pending",
      label: "ออเดอร์รอชำระเงิน",
      count: shop.counts.pending,
      icon: ClockIcon,
    },
    {
      href: "/admin/shop?show=low",
      label: `สินค้าเหลือ ≤ ${lowStockThreshold} ชิ้น`,
      count: lowStock.length,
      icon: WarningIcon,
    },
    {
      href: "/admin/contents?filter=missing",
      label: "โพสต์ที่ยังไม่มีรูป",
      count: missingImages.count ?? 0,
      icon: ImageIcon,
    },
  ];
  const openTodos = todos.filter((todo) => todo.count > 0);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`ภาพรวมร้านค้า เนื้อหา และสมาชิก · ข้อมูล ณ ${orderDate.format(new Date())}`}
        actions={
          <>
            <Link
              href="/"
              target="_blank"
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowSquareOutIcon />
              ดูหน้าเว็บไซต์
            </Link>
            <Link href="/admin/contents?new=1" className={buttonVariants()}>
              <PlusIcon />
              เพิ่มโพสต์
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Metric
          label="ยอดชำระ 30 วัน"
          value={na(formatPrice(shop.revenue30d))}
          detail={
            shop.failed
              ? "โหลดข้อมูลไม่สำเร็จ"
              : `${number.format(shop.paid30d)} ออเดอร์ · Sandbox`
          }
        />
        <Metric
          label="รอจัดส่ง"
          value={na(number.format(shop.toShip))}
          detail={`ชำระแล้ว ${number.format(shop.counts.paid)} จาก ${number.format(totalOrders)}`}
          href="/admin/shop?tab=orders&status=to_ship"
        />
        <Metric
          label="สมาชิกทั้งหมด"
          value={number.format(members.count!)}
          detail={`+${number.format(recent.count!)} คนใน 30 วัน`}
          href="/admin/members"
        />
        <Metric
          label="สินค้าที่แสดงอยู่"
          value={number.format(
            products.filter((product) => product.active).length,
          )}
          detail={`จาก ${number.format(products.length)} รายการ`}
          href="/admin/shop?show=active"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ยอดชำระรายวัน</CardTitle>
            <CardDescription>
              14 วันล่าสุด · ข้อมูลทดสอบจาก Stripe Sandbox
            </CardDescription>
            <CardAction className="text-right">
              <div className="text-2xl font-semibold tabular-nums">
                {na(formatPrice(revenue14d))}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div
              className="flex h-36 items-end gap-1 sm:h-48 sm:gap-2"
              role="img"
              aria-label="กราฟยอดชำระรายวัน 14 วันล่าสุด"
            >
              {shop.daily.map((day) => (
                <div
                  key={day.day}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className={cn(
                      "w-full rounded-md",
                      day.satang
                        ? "bg-primary/80 hover:bg-primary"
                        : "bg-muted",
                    )}
                    style={{
                      height: `${Math.max((day.satang / peak) * 100, 3)}%`,
                    }}
                    title={`${shortDay.format(new Date(day.date))} · ${formatPrice(day.satang)} · ${day.orders} ออเดอร์`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-1 text-center text-[11px] text-muted-foreground sm:gap-2">
              {shop.daily.map((day, index) => (
                <span key={day.day} className="flex-1 truncate">
                  {/* Phones: day number under every other bar; wider screens add the month. */}
                  {index % 2 === 1 || index === shop.daily.length - 1 ? (
                    <>
                      <span className="sm:hidden">
                        {dayOfMonth.format(new Date(day.date))}
                      </span>
                      <span className="hidden sm:inline">
                        {shortDay.format(new Date(day.date))}
                      </span>
                    </>
                  ) : null}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สิ่งที่ต้องจัดการ</CardTitle>
            <CardDescription>งานค้างจากร้านค้าและคลังเนื้อหา</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {openTodos.length ? (
              <ul className="grid gap-2">
                {openTodos.map((todo) => (
                  <li key={todo.href}>
                    <Link
                      href={todo.href}
                      className="group flex items-center gap-3 rounded-lg bg-muted/60 p-3 hover:bg-muted"
                    >
                      <span className="flex size-8 items-center justify-center rounded-md border bg-background">
                        <todo.icon className="size-4" />
                      </span>
                      <span className="flex-1 text-sm">{todo.label}</span>
                      <span className="font-semibold tabular-nums">
                        {number.format(todo.count)}
                      </span>
                      <ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
                <CheckCircleIcon
                  className="size-8 text-emerald-600"
                  weight="fill"
                />
                <p className="text-sm text-muted-foreground">
                  ไม่มีงานค้าง เรียบร้อยทั้งหมด
                </p>
              </div>
            )}
          </CardContent>
          {lowStock.length > 0 && (
            <CardFooter className="flex-col items-stretch gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                สต็อกใกล้หมด
              </span>
              {lowStock.slice(0, 3).map((product) => (
                <Link
                  key={product.slug}
                  href={`/admin/shop?edit=${product.slug}`}
                  className="flex items-center justify-between text-sm hover:underline"
                >
                  <span className="truncate">{product.title}</span>
                  <span
                    className={cn(
                      "tabular-nums",
                      product.stock_qty < 1 && "text-destructive",
                    )}
                  >
                    เหลือ {number.format(product.stock_qty)}
                  </span>
                </Link>
              ))}
            </CardFooter>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ออเดอร์ล่าสุด</CardTitle>
            <CardDescription>คำสั่งซื้อที่เข้ามาล่าสุดในร้าน</CardDescription>
            <CardAction>
              <Link
                href="/admin/shop?tab=orders"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                ดูทั้งหมด
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recentOrders.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      วันที่
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      สถานะ
                    </TableHead>
                    <TableHead className="text-right">ยอดรวม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="relative">
                      <TableCell className="max-w-0 w-full">
                        <Link
                          href={`/admin/shop?tab=orders&order=${order.id}`}
                          className="grid after:absolute after:inset-0"
                        >
                          <span className="truncate font-medium">
                            {order.customer_name ||
                              order.email ||
                              orderNumber(order.id)}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {order.shop_order_items
                              ?.map(
                                (item) => `${item.title} × ${item.quantity}`,
                              )
                              .join(", ") || orderNumber(order.id)}
                          </span>
                          <span className="mt-1 sm:hidden">
                            <OrderStatusBadge order={order} />
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                        {orderDate.format(new Date(order.created_at))}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <OrderStatusBadge order={order} />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatPrice(order.total_satang)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                ยังไม่มีออเดอร์
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สมาชิกใหม่</CardTitle>
            <CardDescription>บัญชีที่สมัครล่าสุด</CardDescription>
            <CardAction>
              <Link
                href="/admin/members"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                ดูทั้งหมด
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {newMembers.data?.length ? (
              <ul className="grid gap-4">
                {newMembers.data.map((member) => {
                  const character = member.assigned_character
                    ? getCharacter(member.assigned_character)
                    : undefined;
                  const name = member.display_name || "ไม่ระบุชื่อ";
                  return (
                    <li key={member.id} className="flex items-center gap-3">
                      <Avatar>
                        {member.avatar_url && (
                          <AvatarImage src={member.avatar_url} alt="" />
                        )}
                        <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="grid min-w-0 flex-1">
                        <span className="truncate text-sm font-medium">
                          {name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {joinDate.format(new Date(member.created_at))}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {character ? character.type : "ยังไม่มี TYPE"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                ยังไม่มีสมาชิก
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>โค้ดส่วนลด</CardTitle>
          <CardDescription>
            {discounts.failed
              ? "โหลดข้อมูลไม่สำเร็จ"
              : `ใช้งานได้ ${number.format(discounts.activeCount)} จาก ${number.format(discounts.totalCount)} โค้ด · 30 วันล่าสุดลดไป ${formatPrice(discounts.given30d)} จาก ${number.format(discounts.orders30d)} ออเดอร์`}
          </CardDescription>
          <CardAction>
            <Link
              href="/admin/discounts"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              จัดการโค้ด
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {discounts.top.length ? (
            <ul className="grid gap-2 sm:grid-cols-3">
              {discounts.top.map((code) => (
                <li
                  key={code.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 p-3"
                >
                  <span className="grid min-w-0">
                    <span className="truncate font-mono text-sm font-medium">
                      {code.code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {discountLabel(code)}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    ใช้แล้ว {number.format(code.used_count)}
                    {code.max_uses !== null &&
                      ` / ${number.format(code.max_uses)}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              ยังไม่มีโค้ดที่ใช้งานได้
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สัดส่วนบุคลิกภาพทั้ง 16 TYPE</CardTitle>
          <CardDescription>
            จากสมาชิกที่บันทึก TYPE แล้ว {number.format(saved)} คน · ยังไม่มี
            TYPE {number.format(members.count! - saved)} คน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
            {distribution.map((character) => {
              const percent = saved ? (character.count / saved) * 100 : 0;
              return (
                <div key={character.type} className="grid gap-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate">
                      <span className="font-semibold">{character.type}</span>{" "}
                      <span className="text-muted-foreground">
                        {character.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {number.format(character.count)} · {percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percent}%`,
                        background: character.house.badgeColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
