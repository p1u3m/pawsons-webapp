"use server";

import { revalidatePath } from "next/cache";
import {
  codePattern,
  normalizeCode,
  type DiscountKind,
} from "@/lib/shop/discounts";
import { isAdmin } from "@/lib/supabase/contents";
import { createClient } from "@/lib/supabase/server";

type Result = { success: boolean; error?: string };

export type NewDiscountInput = {
  code: string;
  kind: DiscountKind;
  /** percent: 1-100. fixed: baht (whole number). */
  amount: number;
  /** Total uses allowed, or null for no limit. */
  maxUses: number | null;
  /** Last day the code works (YYYY-MM-DD, Thailand time), or null. */
  expiresOn: string | null;
};

export async function createDiscountCode(
  input: NewDiscountInput,
): Promise<Result> {
  if (!(await isAdmin())) return { success: false, error: "ไม่มีสิทธิ์" };
  const code = normalizeCode(String(input.code ?? ""));
  const amount = Number(input.amount);
  const maxUses = input.maxUses === null ? null : Number(input.maxUses);
  if (!codePattern.test(code))
    return {
      success: false,
      error: "โค้ดใช้ได้เฉพาะ A-Z ตัวเลข - และ _ ยาว 3-32 ตัว",
    };
  if (input.kind !== "percent" && input.kind !== "fixed")
    return { success: false, error: "ประเภทส่วนลดไม่ถูกต้อง" };
  if (
    !Number.isInteger(amount) ||
    amount < 1 ||
    (input.kind === "percent" ? amount > 100 : amount > 100000)
  )
    return {
      success: false,
      error:
        input.kind === "percent"
          ? "เปอร์เซ็นต์ต้องเป็นจำนวนเต็ม 1-100"
          : "จำนวนเงินต้องเป็นบาทเต็ม 1-100,000",
    };
  if (
    maxUses !== null &&
    (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 1000000)
  )
    return { success: false, error: "จำนวนครั้งที่ใช้ได้ไม่ถูกต้อง" };
  if (input.expiresOn !== null && !/^\d{4}-\d{2}-\d{2}$/.test(input.expiresOn))
    return { success: false, error: "วันหมดอายุไม่ถูกต้อง" };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: "เชื่อมต่อฐานข้อมูลไม่ได้" };
  const { error } = await supabase.from("discount_codes").insert({
    code,
    kind: input.kind,
    value: input.kind === "percent" ? amount : amount * 100,
    max_uses: maxUses,
    // Works through the end of that day in Thailand.
    expires_at: input.expiresOn ? `${input.expiresOn}T23:59:59+07:00` : null,
    active: true,
  });
  if (error)
    return {
      success: false,
      error:
        error.code === "23505"
          ? "มีโค้ดนี้อยู่แล้ว"
          : "สร้างโค้ดไม่สำเร็จ กรุณาลองใหม่",
    };
  revalidatePath("/admin/discounts");
  return { success: true };
}

export async function setDiscountActive(
  id: string,
  active: boolean,
): Promise<Result> {
  if (!(await isAdmin())) return { success: false, error: "ไม่มีสิทธิ์" };
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "เชื่อมต่อฐานข้อมูลไม่ได้" };
  const { error } = await supabase
    .from("discount_codes")
    .update({ active })
    .eq("id", id);
  if (error) return { success: false, error: "บันทึกไม่สำเร็จ" };
  revalidatePath("/admin/discounts");
  return { success: true };
}

/** Only a code that nobody has used can be deleted (the database enforces it). */
export async function deleteDiscountCode(id: string): Promise<Result> {
  if (!(await isAdmin())) return { success: false, error: "ไม่มีสิทธิ์" };
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "เชื่อมต่อฐานข้อมูลไม่ได้" };
  const { data, error } = await supabase
    .from("discount_codes")
    .delete()
    .eq("id", id)
    .select("id");
  if (error || !data?.length)
    return {
      success: false,
      error: "ลบไม่ได้ โค้ดที่เคยถูกใช้แล้วให้ปิดการใช้งานแทน",
    };
  revalidatePath("/admin/discounts");
  return { success: true };
}
