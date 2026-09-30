/** Member roles as stored in profiles.role (checked by profiles_role_check). */
export const memberRoles = ["user", "admin"] as const;
export type MemberRole = (typeof memberRoles)[number];

export const roleLabel: Record<MemberRole, string> = {
  admin: "แอดมิน",
  user: "สมาชิก",
};

/** What each role can do, shown when an admin picks one. */
export const roleDescription: Record<MemberRole, string> = {
  admin:
    "เข้าหลังบ้านได้ทั้งหมด จัดการคลังเนื้อหา สินค้า ออเดอร์ และเปลี่ยนสิทธิ์ของสมาชิกคนอื่นได้",
  user: "ใช้งานหน้าเว็บตามปกติ ทำแบบทดสอบ และสั่งซื้อสินค้าได้ แต่เข้าหลังบ้านไม่ได้",
};

export function isMemberRole(value: unknown): value is MemberRole {
  return memberRoles.includes(value as MemberRole);
}
