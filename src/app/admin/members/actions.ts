"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/contents";
import { isMemberRole, type MemberRole } from "@/lib/member-roles";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "เชื่อมต่อฐานข้อมูลไม่ได้" };

  const { error } = await supabase.rpc("admin_set_member_role", {
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

/** Name or email search for the "add admin" picker. */
export async function searchMembers(
  term: string,
): Promise<{ members: MemberMatch[]; error?: string }> {
  if (!(await isAdmin())) return { members: [], error: "ไม่มีสิทธิ์" };
  const query = term.trim().slice(0, 80);
  if (query.length < 2) return { members: [] };
  const supabase = await createClient();
  if (!supabase) return { members: [], error: "เชื่อมต่อฐานข้อมูลไม่ได้" };

  const { data, error } = await supabase.rpc("admin_search_members", {
    term: query,
  });
  if (error) return { members: [], error: "ค้นหาไม่สำเร็จ" };
  return { members: (data ?? []) as MemberMatch[] };
}
