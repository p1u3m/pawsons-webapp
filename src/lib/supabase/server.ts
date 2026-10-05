import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Returns a server-side Supabase client, or `null` when the required
 * environment variables have not been configured yet.
 */
export async function createClient() {
  if (!supabaseUrl || !supabaseKey) return null;

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — ignore.
          // The middleware will refresh the session on the next request.
        }
      },
    },
  });
}
