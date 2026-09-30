import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Same-window Google sign in: /auth/google?next=/admin redirects to Google and
 * comes back to `next` through /auth/callback. Used where a popup cannot open
 * (embedded browsers, strict popup blockers); the PKCE verifier is kept in a
 * cookie by the server client.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestedNext = requestUrl.searchParams.get("next");
  // Same-origin paths only, so the flow cannot be used as an open redirect.
  const next =
    requestedNext?.startsWith("/") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.includes("\\")
      ? requestedNext
      : "/";

  let origin = requestUrl.origin;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  if (host && !host.includes("0.0.0.0")) {
    origin = `${proto}://${host}`;
  } else if (origin.includes("0.0.0.0")) {
    origin = origin.replace("0.0.0.0", "localhost");
  }

  const supabase = await createClient();
  if (supabase) {
    const callback = new URL("/auth/callback", origin);
    callback.searchParams.set("next", next);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
    });
    if (!error && data.url) return NextResponse.redirect(data.url);
  }

  return NextResponse.redirect(new URL("/auth/complete?status=error", origin));
}
