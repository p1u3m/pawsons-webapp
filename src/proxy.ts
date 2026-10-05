import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  // When Supabase is not configured, pass through without session refresh
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh the auth token — this keeps the session alive. getClaims()
  // verifies the JWT signature (locally with asymmetric keys, otherwise by
  // asking Supabase), so unlike getSession() it cannot be spoofed.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  // Guard /admin/* — only role=admin may enter
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!userId) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Check role in profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets (images, fonts, audio, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|mp3|ico)$).*)",
  ],
};
