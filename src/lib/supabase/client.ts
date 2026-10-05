import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Returns a browser-side Supabase client, or `null` when the required
 * environment variables have not been configured yet (e.g. during a
 * static build without `.env.local`).
 */
export function createClient() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createBrowserClient(supabaseUrl, supabaseKey);
}
