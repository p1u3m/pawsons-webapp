import "server-only";
import { createShopServerClient } from "@/lib/shop/server-client";
import { isAdmin } from "@/lib/supabase/contents";
import { createClient } from "@/lib/supabase/server";

/**
 * Calls an admin_* database function. Those functions are executable by
 * service_role only: this verifies the signed-in user is an admin, then passes
 * their id as `actor`, which the function checks again.
 */
export async function adminRpc<T = unknown>(
  fn: "admin_set_member_role" | "admin_member_emails" | "admin_search_members",
  args: Record<string, unknown>,
): Promise<{
  data: T | null;
  error: { message: string; code?: string } | null;
}> {
  const denied = { data: null, error: { message: "Not authorized", code: "42501" } };
  if (!(await isAdmin())) return denied;
  const session = await createClient();
  const {
    data: { user },
  } = session ? await session.auth.getUser() : { data: { user: null } };
  if (!user) return denied;

  const { data, error } = await createShopServerClient().rpc(fn, {
    actor: user.id,
    ...args,
  });
  return { data: data as T | null, error };
}
