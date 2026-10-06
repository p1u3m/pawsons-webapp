import { redirect } from "next/navigation";
import {
  AdminDiscountManager,
  type DiscountRow,
} from "@/components/admin-discount-manager";
import { AdminPageHeader } from "@/components/admin-page-header";
import { discountColumns, type DiscountCode } from "@/lib/shop/discounts";
import { isAdmin } from "@/lib/supabase/contents";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "โค้ดส่วนลด · Pawsons Admin" };

export default async function AdminDiscountsPage() {
  if (!(await isAdmin())) redirect("/");
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase unavailable");

  const [{ data: codes, error }, { data: given }] = await Promise.all([
    supabase
      .from("discount_codes")
      .select(discountColumns)
      .order("created_at", { ascending: false }),
    // Discount handed out on paid orders, per code.
    supabase
      .from("shop_orders")
      .select("discount_code_id,discount_satang")
      .eq("status", "paid")
      .gt("discount_satang", 0)
      .limit(5000),
  ]);
  if (error) throw new Error("Unable to load discount codes");

  const totals = new Map<string, number>();
  for (const row of given ?? [])
    if (row.discount_code_id)
      totals.set(
        row.discount_code_id,
        (totals.get(row.discount_code_id) ?? 0) + row.discount_satang,
      );
  const rows: DiscountRow[] = ((codes ?? []) as DiscountCode[]).map((code) => ({
    ...code,
    given_satang: totals.get(code.id) ?? 0,
  }));

  return (
    <>
      <AdminPageHeader
        title="โค้ดส่วนลด"
        description="สร้างและจัดการโค้ดส่วนลดของร้านค้า · ใช้ในตะกร้าตอนชำระเงิน"
      />
      <AdminDiscountManager codes={rows} />
    </>
  );
}
