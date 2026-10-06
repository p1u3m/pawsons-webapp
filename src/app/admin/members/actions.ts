"use server";

import { revalidatePath } from "next/cache";
import { maxCoinAdjustment } from "@/lib/coins";
import { isAdmin } from "@/lib/supabase/contents";
import { isMemberRole, type MemberRole } from "@/lib/member-roles";
import { adminRpc } from "@/lib/supabase/admin-rpc";

export type MemberMatch = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: MemberRole;
};

type Result = { success: boolean; error?: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Changes a member's role through admin_set_member_role(), which re-checks the
 * caller, refuses self-demotion and logs the change.
 */
export async function setMemberRole(
  id: string,
  role: MemberRole,
): Promise<Result> {
  if (!(await isAdmin())) return { success: false, error: "ไม่มีสิทธิ์" };
  if (!uuidPattern.test(id) || !isMemberRole(role)) {
    return { success: false, error: "ข้อมูลไม่ถูกต้อง" };
  }
  const { error } = await adminRpc("admin_set_member_role", {
    target: id,
    new_role: role,
  });
  if (error) {
    return {
      success: false,
      error: error.message.includes("own role")
        ? "เปลี่ยนสิทธิ์ของตัวเองไม่ได้ ให้แอดมินคนอื่นเปลี่ยนให้"
        : error.code === "P0002"
          ? "ไม่พบสมาชิกคนนี้"
          : "เปลี่ยนสิทธิ์ไม่สำเร็จ กรุณาลองใหม่",
    };
  }
  revalidatePath("/admin/members");
  return { success: true };
}

/**
 * Adds (positive) or removes (negative) Coin for a member. The database keeps the
 * ledger, checks the admin again and refuses to take the balance below zero.
 */
export async function adjustMemberCoins(
  id: string,
  amount: number,
  reason: string,
): Promise<{ success: boolean; balance?: number; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "ไม่มีสิทธิ์" };
  const note = String(reason ?? "").trim();
  if (
    !uuidPattern.test(id) ||
    !Number.isInteger(amount) ||
    amount === 0 ||
    Math.abs(amount) > maxCoinAdjustment ||
    note.length < 1 ||
    note.length > 200
  )
    return { success: false, error: "ข้อมูลไม่ถูกต้อง" };

  const { data, error } = await adminRpc<number>("admin_coin_adjust", {
    target: id,
    amount,
    reason: note,
  });
  if (error)
    return {
      success: false,
      error:
        error.code === "23514"
          ? "สมาชิกมี Coin ไม่พอให้หัก"
          : error.code === "P0002"
            ? "ไม่พบสมาชิกคนนี้"
            : "ปรับ Coin ไม่สำเร็จ กรุณาลองใหม่",
    };
  revalidatePath("/admin/members");
  revalidatePath("/admin");
  return { success: true, balance: data ?? undefined };
}

/** Name or email search for the "add admin" picker. */
export async function searchMembers(
  term: string,
): Promise<{ members: MemberMatch[]; error?: string }> {
  if (!(await isAdmin())) return { members: [], error: "ไม่มีสิทธิ์" };
  const query = term.trim().slice(0, 80);
  if (query.length < 2) return { members: [] };
  const { data, error } = await adminRpc<MemberMatch[]>(
    "admin_search_members",
    { term: query },
  );
  if (error) return { members: [], error: "ค้นหาไม่สำเร็จ" };
  return { members: data ?? [] };
}
