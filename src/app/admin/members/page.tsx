import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  AddAdminDialog,
  EditRoleButton,
  MemberActions,
} from "@/components/admin-member-roles";
import { AdminSheet } from "@/components/admin-sheet";
import { OrderStatusBadge } from "@/components/admin-status";
import { AdminLinkSelect } from "@/components/admin-link-select";
import { AdminAlert } from "@/components/admin-order-detail";
import { AdminPageHeader } from "@/components/admin-page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { characters, getCharacter, houses } from "@/lib/data";
import { roleLabel, type MemberRole } from "@/lib/member-roles";
import type { FulfillmentStatus, OrderStatus } from "@/lib/shop/orders";
import { orderDate, orderNumber } from "@/lib/shop/orders";
import { formatPrice } from "@/lib/shop/price";
import { isAdmin } from "@/lib/supabase/contents";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "สมาชิก · Pawsons Admin" };

const pageSize = 25;
const number = new Intl.NumberFormat("th-TH");
const joinDate = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeZone: "Asia/Bangkok",
});
const eventDate = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});
const roleFilters = ["admin", "user"] as const satisfies MemberRole[];
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const selfLock = "เปลี่ยนสิทธิ์ของตัวเองไม่ได้ ให้แอดมินคนอื่นเปลี่ยนให้";

type Member = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  assigned_character: string | null;
  house: string | null;
  role: MemberRole;
  created_at: string;
};

type RoleEvent = {
  id: number;
  profile_id: string;
  old_role: MemberRole;
  new_role: MemberRole;
  actor: string | null;
  created_at: string;
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    role?: string;
    page?: string;
    member?: string;
  }>;
}) {
  if (!(await isAdmin())) redirect("/");
  const params = await searchParams;
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase unavailable");

  const q = params.q?.trim() ?? "";
  const type = characters.find((c) => c.type === params.type)?.type;
  const role = roleFilters.find((value) => value === params.role);
  const page = Math.max(0, Number.parseInt(params.page ?? "0", 10) || 0);

  let query = supabase
    .from("profiles")
    .select(
      "id,display_name,avatar_url,assigned_character,house,role,created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(page * pageSize, page * pageSize + pageSize - 1);
  // Escape LIKE wildcards so the search matches the text as typed.
  if (q)
    query = query.ilike("display_name", `%${q.replace(/[\\%_]/g, "\\$&")}%`);
  if (type) query = query.eq("assigned_character", type);
  if (role) query = query.eq("role", role);
  const roleCount = (value: MemberRole) =>
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", value);

  const [
    { data, count, error },
    { count: adminCount },
    { count: userCount },
    { data: eventRows },
    {
      data: { user },
    },
  ] = await Promise.all([
    query,
    roleCount("admin"),
    roleCount("user"),
    supabase
      .from("profile_role_events")
      .select("id,profile_id,old_role,new_role,actor,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.auth.getUser(),
  ]);
  const members = (data ?? []) as Member[];
  const events = (eventRows ?? []) as RoleEvent[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const roleTotals = {
    admin: adminCount ?? 0,
    user: userCount ?? 0,
  };

  // Emails (auth.users) for the listed members and everyone in the history.
  const eventIds = events.flatMap((e) =>
    e.actor ? [e.profile_id, e.actor] : [e.profile_id],
  );
  const ids = [...new Set([...members.map((m) => m.id), ...eventIds])];
  const [{ data: emailRows }, { data: eventProfiles }] = await Promise.all([
    ids.length
      ? supabase.rpc("admin_member_emails", { ids })
      : Promise.resolve({ data: [] }),
    eventIds.length
      ? supabase.from("profiles").select("id,display_name").in("id", eventIds)
      : Promise.resolve({ data: [] }),
  ]);
  const emails = new Map(
    ((emailRows ?? []) as { id: string; email: string | null }[]).map((row) => [
      row.id,
      row.email,
    ]),
  );
  const names = new Map(
    (
      (eventProfiles ?? []) as { id: string; display_name: string | null }[]
    ).map((row) => [row.id, row.display_name]),
  );
  const openId =
    params.member && uuidPattern.test(params.member) ? params.member : null;
  const detail = openId ? await getMemberDetail(supabase, openId) : null;

  const who = (id: string | null) =>
    id ? names.get(id) || emails.get(id) || "ไม่ระบุชื่อ" : "บัญชีที่ถูกลบ";

  const href = (next: {
    type?: string | null;
    role?: MemberRole | null;
    page?: number;
    member?: string;
  }) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    const nextType = next.type === undefined ? type : next.type;
    if (nextType) search.set("type", nextType);
    const nextRole = next.role === undefined ? role : next.role;
    if (nextRole) search.set("role", nextRole);
    const nextPage = next.page === undefined ? page : next.page;
    if (nextPage) search.set("page", String(nextPage));
    if (next.member) search.set("member", next.member);
    return `/admin/members${search.size ? `?${search}` : ""}`;
  };

  return (
    <>
      <AdminPageHeader
        title="สมาชิก"
        description="บัญชีที่มีโปรไฟล์ในระบบ ผล TYPE บ้าน และสิทธิ์ของแต่ละคน"
        actions={<AddAdminDialog />}
      />

      <Card>
        <CardContent className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form
              action="/admin/members"
              role="search"
              className="flex w-full gap-2 lg:w-96"
            >
              {type && <input type="hidden" name="type" value={type} />}
              {role && <input type="hidden" name="role" value={role} />}
              <InputGroup>
                <InputGroupAddon>
                  <MagnifyingGlassIcon />
                </InputGroupAddon>
                <InputGroupInput
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="ค้นหาชื่อสมาชิก"
                  aria-label="ค้นหาสมาชิก"
                />
              </InputGroup>
              <Button type="submit" variant="outline">
                ค้นหา
              </Button>
            </form>
            <nav
              aria-label="กรองตามสิทธิ์"
              className="inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-[3px]"
            >
              {[undefined, ...roleFilters].map((value) => (
                <Link
                  key={value ?? "all"}
                  href={href({ role: value ?? null, page: 0 })}
                  aria-current={role === value ? "page" : undefined}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    role === value && "bg-background text-foreground shadow-sm",
                  )}
                >
                  {value ? roleLabel[value] : "ทั้งหมด"}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {number.format(
                      value
                        ? roleTotals[value]
                        : roleTotals.admin + roleTotals.user,
                    )}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <AdminLinkSelect
            label="กรองตาม TYPE"
            value={type ?? "all"}
            items={[
              {
                value: "all",
                label: "ทุก TYPE",
                href: href({ type: null, page: 0 }),
              },
              ...characters.map((c) => ({
                value: c.type,
                label: `${c.type} · ${c.name}`,
                href: href({ type: c.type, page: 0 }),
              })),
            ]}
            className="w-full sm:hidden"
          />
          <nav
            aria-label="กรองตาม TYPE"
            className="hidden flex-wrap gap-1.5 sm:flex"
          >
            <TypeChip href={href({ type: null, page: 0 })} active={!type}>
              ทั้งหมด
            </TypeChip>
            {characters.map((c) => (
              <TypeChip
                key={c.type}
                href={href({ type: c.type, page: 0 })}
                active={type === c.type}
              >
                {c.type}
              </TypeChip>
            ))}
          </nav>

          {error ? (
            <AdminAlert>
              โหลดรายชื่อสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
            </AdminAlert>
          ) : members.length ? (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>สมาชิก</TableHead>
                    <TableHead className="hidden sm:table-cell">TYPE</TableHead>
                    <TableHead className="hidden md:table-cell">บ้าน</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      สมัครเมื่อ
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      สิทธิ์
                    </TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">จัดการ</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const character = member.assigned_character
                      ? getCharacter(member.assigned_character)
                      : undefined;
                    const house =
                      houses.find((h) => h.id === member.house) ??
                      character?.house;
                    const name = member.display_name || "ไม่ระบุชื่อ";
                    const isSelf = member.id === user?.id;
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="max-w-0 w-full">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {member.avatar_url && (
                                <AvatarImage src={member.avatar_url} alt="" />
                              )}
                              <AvatarFallback>
                                {name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="grid min-w-0">
                              <span className="flex items-center gap-2">
                                <Link
                                  href={href({ member: member.id })}
                                  scroll={false}
                                  className="truncate font-medium hover:underline"
                                >
                                  {name}
                                </Link>
                                {isSelf && <Badge variant="outline">คุณ</Badge>}
                                {member.role === "admin" && (
                                  <span className="sm:hidden">
                                    <RoleBadge role="admin" />
                                  </span>
                                )}
                              </span>
                              <span className="truncate text-xs text-muted-foreground">
                                {emails.get(member.id) ?? "—"}
                              </span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {character ? (
                            <span className="whitespace-nowrap">
                              <span className="font-medium">
                                {character.type}
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {character.name}
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {house ? (
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="size-2 rounded-full"
                                style={{ background: house.badgeColor }}
                                aria-hidden="true"
                              />
                              {house.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                          {joinDate.format(new Date(member.created_at))}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <RoleBadge role={member.role} />
                        </TableCell>
                        <TableCell>
                          <MemberActions
                            member={{ id: member.id, name, role: member.role }}
                            detailHref={href({ member: member.id })}
                            lockedReason={isSelf ? selfLock : undefined}
                          />
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
                  <UsersIcon />
                </EmptyMedia>
                <EmptyTitle>ไม่พบสมาชิก</EmptyTitle>
                <EmptyDescription>
                  {q || type || role
                    ? "ลองเปลี่ยนคำค้นหา TYPE หรือสิทธิ์"
                    : "ยังไม่มีสมาชิกในระบบ"}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {pageCount > 1 && (
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                หน้า {page + 1} จาก {pageCount}
              </span>
              <div className="flex gap-2">
                <PageLink href={href({ page: page - 1 })} disabled={page === 0}>
                  ก่อนหน้า
                </PageLink>
                <PageLink
                  href={href({ page: page + 1 })}
                  disabled={page >= pageCount - 1}
                >
                  ถัดไป
                </PageLink>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการเปลี่ยนสิทธิ์</CardTitle>
          <CardDescription>
            8 รายการล่าสุด · บันทึกทุกครั้งที่มีการตั้งหรือถอดแอดมิน
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length ? (
            <ol className="grid gap-3">
              {events.map((event) => (
                <li key={event.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <ShieldCheckIcon className="size-4" />
                  </span>
                  <span className="grid min-w-0">
                    <span>
                      <span className="font-medium">{who(event.actor)}</span>{" "}
                      {event.new_role === "admin"
                        ? "ตั้ง"
                        : "ถอดสิทธิ์แอดมินของ"}{" "}
                      <span className="font-medium">
                        {who(event.profile_id)}
                      </span>
                      {event.new_role === "admin" && " เป็นแอดมิน"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {eventDate.format(new Date(event.created_at))} ·{" "}
                      {roleLabel[event.old_role]} → {roleLabel[event.new_role]}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              ยังไม่มีการเปลี่ยนสิทธิ์
            </p>
          )}
        </CardContent>
      </Card>

      {openId && (
        <AdminSheet
          title={
            detail
              ? detail.profile.display_name || "ไม่ระบุชื่อ"
              : "ไม่พบสมาชิก"
          }
          description={detail?.email ?? undefined}
          closeHref={href({})}
        >
          {detail ? (
            <MemberDetail
              detail={detail}
              lockedReason={
                detail.profile.id === user?.id ? selfLock : undefined
              }
            />
          ) : (
            <div className="p-4">
              <AdminAlert>ไม่พบสมาชิกคนนี้ หรือบัญชีถูกลบไปแล้ว</AdminAlert>
            </div>
          )}
        </AdminSheet>
      )}
    </>
  );
}

type Supabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;

type MemberOrder = {
  id: string;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  total_satang: number;
  created_at: string;
};

/** Everything the detail sheet shows about one member. */
async function getMemberDetail(supabase: Supabase, id: string) {
  const [
    { data: profile },
    { data: auth },
    { data: orders },
    { data: events },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id,display_name,avatar_url,assigned_character,house,vibe,role,created_at",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.rpc("admin_member_emails", { ids: [id] }),
    supabase
      .from("shop_orders")
      .select("id,status,fulfillment_status,total_satang,created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("profile_role_events")
      .select("id,profile_id,old_role,new_role,actor,created_at")
      .eq("profile_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  if (!profile) return null;
  const account = (
    (auth ?? []) as { email: string | null; last_sign_in_at: string | null }[]
  )[0];
  const roleEvents = (events ?? []) as RoleEvent[];
  // Names of the admins who changed this member's role.
  const actorIds = [
    ...new Set(roleEvents.flatMap((e) => (e.actor ? [e.actor] : []))),
  ];
  const { data: actors } = actorIds.length
    ? await supabase
        .from("profiles")
        .select("id,display_name")
        .in("id", actorIds)
    : { data: [] };
  return {
    profile: profile as Member & { vibe: string | null },
    email: account?.email ?? null,
    lastSignIn: account?.last_sign_in_at ?? null,
    orders: (orders ?? []) as MemberOrder[],
    events: roleEvents,
    actorNames: new Map(
      ((actors ?? []) as { id: string; display_name: string | null }[]).map(
        (row) => [row.id, row.display_name],
      ),
    ),
  };
}

function MemberDetail({
  detail,
  lockedReason,
}: {
  detail: NonNullable<Awaited<ReturnType<typeof getMemberDetail>>>;
  lockedReason?: string;
}) {
  const { profile, orders, events } = detail;
  const name = profile.display_name || "ไม่ระบุชื่อ";
  const character = profile.assigned_character
    ? getCharacter(profile.assigned_character)
    : undefined;
  const house = houses.find((h) => h.id === profile.house) ?? character?.house;
  const paid = orders.filter((order) => order.status === "paid");
  const spent = paid.reduce((sum, order) => sum + order.total_satang, 0);

  return (
    <div className="grid gap-6 overflow-y-auto p-4">
      <section className="flex flex-wrap items-center gap-4">
        <Avatar className="size-14">
          {profile.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt="" />
          )}
          <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="grid min-w-0 flex-1 gap-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-base font-semibold">{name}</span>
            <RoleBadge role={profile.role} />
          </span>
          <span className="truncate text-sm text-muted-foreground">
            {detail.email ?? "ไม่มีอีเมล"}
          </span>
        </div>
        <EditRoleButton
          member={{ id: profile.id, name, role: profile.role }}
          lockedReason={lockedReason}
        />
      </section>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border">
        {[
          [
            "TYPE",
            character
              ? `${character.type} · ${character.name}`
              : "ยังไม่ได้ทำแบบทดสอบ",
          ],
          ["บ้าน", house?.name ?? "—"],
          ["สมัครเมื่อ", joinDate.format(new Date(profile.created_at))],
          [
            "เข้าสู่ระบบล่าสุด",
            detail.lastSignIn
              ? eventDate.format(new Date(detail.lastSignIn))
              : "—",
          ],
          ["ออเดอร์ที่ชำระแล้ว", `${number.format(paid.length)} ออเดอร์`],
          ["ยอดซื้อรวม", formatPrice(spent)],
        ].map(([label, value]) => (
          <div key={label} className="grid gap-0.5 bg-card p-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="truncate text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="grid gap-2">
        <h3 className="text-sm font-medium">ออเดอร์ล่าสุด</h3>
        {orders.length ? (
          <ul className="divide-y rounded-lg border">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/shop?tab=orders&order=${order.id}`}
                  className="flex items-center gap-3 p-3 text-sm hover:bg-muted/60"
                >
                  <span className="grid flex-1">
                    <span className="font-medium">{orderNumber(order.id)}</span>
                    <span className="text-xs text-muted-foreground">
                      {orderDate.format(new Date(order.created_at))}
                    </span>
                  </span>
                  <OrderStatusBadge order={order} />
                  <span className="w-20 text-right tabular-nums">
                    {formatPrice(order.total_satang)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">ยังไม่มีออเดอร์</p>
        )}
      </section>

      <section className="grid gap-2">
        <h3 className="text-sm font-medium">ประวัติสิทธิ์</h3>
        {events.length ? (
          <ol className="grid gap-2">
            {events.map((event) => (
              <li key={event.id} className="text-sm">
                {roleLabel[event.old_role]} → {roleLabel[event.new_role]}
                <span className="block text-xs text-muted-foreground">
                  โดย{" "}
                  {event.actor
                    ? detail.actorNames.get(event.actor) || "ไม่ระบุชื่อ"
                    : "บัญชีที่ถูกลบ"}{" "}
                  · {eventDate.format(new Date(event.created_at))}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            เป็น{roleLabel[profile.role]}ตั้งแต่สมัคร ยังไม่เคยเปลี่ยนสิทธิ์
          </p>
        )}
      </section>
    </div>
  );
}

function RoleBadge({ role }: { role: MemberRole }) {
  return role === "admin" ? (
    <Badge>
      <ShieldCheckIcon />
      {roleLabel.admin}
    </Badge>
  ) : (
    <Badge variant="outline">{roleLabel.user}</Badge>
  );
}

function TypeChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: active ? "default" : "outline", size: "xs" }),
      )}
    >
      {children}
    </Link>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return disabled ? (
    <span
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "pointer-events-none opacity-50",
      )}
    >
      {children}
    </span>
  ) : (
    <Link
      href={href}
      className={buttonVariants({ variant: "outline", size: "sm" })}
    >
      {children}
    </Link>
  );
}
