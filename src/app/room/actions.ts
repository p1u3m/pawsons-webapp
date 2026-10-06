"use server";

import { revalidatePath } from "next/cache";
import { createShopServerClient } from "@/lib/shop/server-client";
import { createClient } from "@/lib/supabase/server";
import { roomThemes } from "@/components/room/room-themes";

/**
 * Unlocks a room with Coin. unlock_room() charges the Coin and records the
 * unlock in one transaction; it is executable by service_role only, so the
 * member is verified here first.
 */
export async function unlockRoom(
  roomId: string,
): Promise<{ success: boolean; balance?: number; error?: string }> {
  if (!roomThemes.some((t) => t.id === roomId)) {
    return { success: false, error: "ไม่พบห้องนี้" };
  }
  const session = await createClient();
  const {
    data: { user },
  } = session ? await session.auth.getUser() : { data: { user: null } };
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const { data, error } = await createShopServerClient().rpc("unlock_room", {
    member: user.id,
    room: roomId,
  });
  if (error) {
    return {
      success: false,
      error:
        error.code === "23514"
          ? "Coin ไม่พอสำหรับห้องนี้"
          : error.code === "23505"
            ? "ปลดล็อคห้องนี้ไปแล้ว"
            : "ปลดล็อคไม่สำเร็จ กรุณาลองใหม่",
    };
  }
  revalidatePath("/room");
  revalidatePath("/coins");
  return { success: true, balance: data as number };
}
