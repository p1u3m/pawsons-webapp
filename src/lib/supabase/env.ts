/**
 * Public Supabase settings shared by the browser client, the server client
 * and the proxy. Both values are safe to expose: access is enforced by RLS.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
