import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar, type AdminAccount } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { countToShip } from "@/lib/shop/admin-stats";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [cookieStore, supabase] = await Promise.all([
    cookies(),
    createClient(),
  ]);
  // The sidebar remembers collapsed/expanded in this cookie.
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  let account: AdminAccount | null = null;
  let toShip = 0;
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const [{ data: profile }, count] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name,avatar_url")
          .eq("id", user.id)
          .maybeSingle(),
        countToShip(supabase),
      ]);
      account = {
        name: profile?.display_name || user.email?.split("@")[0] || "Admin",
        email: user.email ?? "",
        avatarUrl: profile?.avatar_url ?? null,
      };
      toShip = count;
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultOpen} className="admin-theme">
        {/* No Suspense here: the sidebar must hydrate together with its
            provider, or the mobile/desktop switch mismatches the server HTML.
            This layout reads cookies, so it is always rendered per request. */}
        <AdminSidebar
          account={account}
          badges={{ "/admin/shop?tab=orders": toShip }}
        />
        <div className="relative flex min-w-0 flex-1 flex-col bg-background">
          <Suspense>
            <AdminHeader />
          </Suspense>
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </div>
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </TooltipProvider>
  );
}
