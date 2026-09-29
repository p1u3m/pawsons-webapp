import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const flowId = requestUrl.searchParams.get("sb_flow_id");
  const requestedNext = requestUrl.searchParams.get("next");
  const next =
    requestedNext?.startsWith("/") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.includes("\\")
      ? requestedNext
      : "/auth/complete?status=success";

  // Use the public host when the app is behind a proxy.
  let origin = requestUrl.origin;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";

  if (host && !host.includes("0.0.0.0")) {
    origin = `${proto}://${host}`;
  } else if (origin.includes("0.0.0.0")) {
    origin = origin.replace("0.0.0.0", "localhost");
  }

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined,
      );
      if (!error) {
        return NextResponse.redirect(new URL(next, origin));
      }
    }
  }

  return NextResponse.redirect(new URL("/auth/complete?status=error", origin));
}
