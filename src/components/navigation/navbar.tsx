"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AuthButton from "../auth-button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { isNavActive, NAV_LINKS } from "./nav-links";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none sticky top-4 z-50 w-full px-4 max-md:hidden">
      <header className="pointer-events-auto relative mx-auto flex h-16 max-w-[1040px] items-center justify-between gap-3 rounded-full bg-cream py-2 pr-3 pl-6 shadow-[0_12px_32px_-10px_rgb(74_68_53/0.14),0_2px_6px_rgb(74_68_53/0.04)] max-lg:gap-2 max-lg:pr-2 max-lg:pl-4">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center rounded-lg transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green motion-reduce:transition-none"
          aria-label="Pawsons Home"
        >
          <Image
            src="/logos/Logo_main.svg"
            width={130}
            height={30}
            alt="pawsons"
            preload
            className="h-7 w-[125px] object-contain max-lg:w-24"
          />
        </Link>
        <NavigationMenu
          aria-label="Main Navigation"
          className="ml-auto flex-none"
        >
          <NavigationMenuList className="gap-1 max-lg:gap-0.5">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = isNavActive(pathname, href);
              return (
                <NavigationMenuItem key={href}>
                  <NavigationMenuLink
                    render={<Link href={href} />}
                    active={active}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "min-h-11 flex-row gap-2 rounded-full px-3.5 py-2 text-[14px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green focus-visible:ring-0 motion-reduce:transition-none max-lg:gap-1.5 max-lg:px-2 max-lg:text-[13px]",
                      active
                        ? "bg-sun font-semibold text-sun-ink hover:bg-sun focus:bg-sun data-active:bg-sun data-active:hover:bg-sun data-active:focus:bg-sun"
                        : "text-ink-muted hover:bg-paper-soft hover:text-ink focus:bg-paper-soft",
                    )}
                  >
                    <Icon
                      className="size-[18px] max-lg:hidden"
                      aria-hidden="true"
                      weight={active ? "fill" : "bold"}
                    />
                    {label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-1 flex shrink-0 items-center pl-3 max-lg:pl-2">
          <AuthButton />
        </div>
      </header>
    </div>
  );
}
