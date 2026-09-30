"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowSquareOutIcon,
  CaretUpDownIcon,
  HouseIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { adminNav, isActiveNav } from "@/components/admin-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";

export type AdminAccount = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function AdminSidebar({
  account,
  badges,
}: {
  account: AdminAccount | null;
  /** Counts shown beside nav items, keyed by href. */
  badges: Record<string, number>;
}) {
  const pathname = usePathname();
  const tab = useSearchParams().get("tab");
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/admin" />}
              onClick={() => isMobile && setOpenMobile(false)}
            >
              <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                P
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">Pawsons</span>
                <span className="truncate text-xs text-muted-foreground">
                  Admin
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {adminNav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = isActiveNav(item, pathname, tab);
                const badge = badges[item.href];
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => isMobile && setOpenMobile(false)}
                        />
                      }
                    >
                      <item.icon weight={active ? "fill" : "regular"} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {badge ? (
                      <SidebarMenuBadge>{badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                tooltip="ดูหน้าเว็บไซต์"
                render={<Link href="/" target="_blank" />}
              >
                <ArrowSquareOutIcon />
                <span>ดูหน้าเว็บไซต์</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {account && <AccountMenu account={account} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function AccountMenu({ account }: { account: AdminAccount }) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const initials = account.name.slice(0, 2).toUpperCase();

  async function signOut() {
    await createClient()?.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  const identity = (
    <>
      <Avatar className="size-8 rounded-lg">
        {account.avatarUrl && <AvatarImage src={account.avatarUrl} alt="" />}
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      </Avatar>
      <span className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{account.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {account.email}
        </span>
      </span>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            {identity}
            <CaretUpDownIcon className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 p-1.5 font-normal text-foreground">
                {identity}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/" />}>
                <HouseIcon />
                กลับหน้าเว็บไซต์
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <SignOutIcon />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
