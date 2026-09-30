"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowSquareOutIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TruckIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { adminNav, adminPageTitle } from "@/components/admin-nav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const quickActions = [
  { href: "/admin/contents?new=1", label: "เพิ่มโพสต์ใหม่", icon: PlusIcon },
  { href: "/admin/shop?new=1", label: "เพิ่มสินค้า", icon: PlusIcon },
  {
    href: "/admin/shop?tab=orders&status=to_ship",
    label: "ออเดอร์รอจัดส่ง",
    icon: TruckIcon,
  },
  {
    href: "/admin/shop?show=low",
    label: "สินค้าสต็อกใกล้หมด",
    icon: WarningIcon,
  },
];
const siteLinks = [
  { href: "/contents", label: "หน้า Contents" },
  { href: "/shop", label: "หน้าร้านค้า" },
];

export function AdminHeader() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const tab = useSearchParams().get("tab");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const title = adminPageTitle(pathname, tab);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (href: string, external = false) => {
    setOpen(false);
    if (external) window.open(href, "_blank", "noopener");
    else router.push(href);
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur">
      {/* Phones: a labelled menu button; the sidebar is hidden there. */}
      <Button
        variant="outline"
        className="-ml-1 h-9 gap-1.5 px-2.5 md:hidden [&_svg]:size-5"
        onClick={() => setOpenMobile(true)}
      >
        <ListIcon />
        เมนู
      </Button>
      <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
      <Separator
        orientation="vertical"
        className="mr-2 hidden data-[orientation=vertical]:h-4 md:block"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {pathname !== "/admin" && (
            <>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink render={<Link href="/admin" />}>
                  Admin
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        variant="outline"
        className="ml-auto h-8 w-9 justify-start gap-2 px-2 text-muted-foreground sm:w-56"
        onClick={() => setOpen(true)}
        aria-label="ค้นหาและคำสั่ง"
      >
        <MagnifyingGlassIcon />
        <span className="hidden flex-1 text-left font-normal sm:inline">
          ค้นหาเมนู...
        </span>
        <Kbd className="hidden sm:inline-flex">Ctrl K</Kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="ค้นหาเมนู"
        description="ไปยังหน้าหรือคำสั่งที่ต้องการ"
      >
        <Command>
          <CommandInput placeholder="พิมพ์เพื่อค้นหา..." />
          <CommandList>
            <CommandEmpty>ไม่พบเมนูที่ค้นหา</CommandEmpty>
            <CommandGroup heading="หน้า">
              {adminNav.flatMap((group) =>
                group.items.map((item) => (
                  <CommandItem key={item.href} onSelect={() => go(item.href)}>
                    <item.icon />
                    {item.label}
                  </CommandItem>
                )),
              )}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="คำสั่งด่วน">
              {quickActions.map((action) => (
                <CommandItem key={action.href} onSelect={() => go(action.href)}>
                  <action.icon />
                  {action.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="หน้าเว็บไซต์">
              {siteLinks.map((link) => (
                <CommandItem
                  key={link.href}
                  onSelect={() => go(link.href, true)}
                >
                  <ArrowSquareOutIcon />
                  {link.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </header>
  );
}
