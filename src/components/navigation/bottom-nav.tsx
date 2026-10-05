"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserCircleIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";
import { isNavActive, NAV_LINKS } from "./nav-links";

interface BottomNavProps {
  lettersBadge?: number | boolean | string;
  accountOpen: boolean;
  onOpenAccount: () => void;
}

const target =
  "group relative flex min-h-[52px] min-w-11 flex-1 items-center justify-center rounded-full px-0.5 py-1 h-auto border-0 hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none";
const surface =
  "relative flex size-11 items-center justify-center rounded-full group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-green";

export default function BottomNav({
  lettersBadge,
  accountOpen,
  onOpenAccount,
}: BottomNavProps) {
  const pathname = usePathname();
  const { user, displayName, avatarUrl, loading } = useAuth();
  const accountRoute = ["/room", "/letters", "/shop/orders"].some((href) =>
    isNavActive(pathname, href),
  );
  const accountActive = accountOpen || accountRoute;
  const hasBadge = Boolean(lettersBadge);

  return (
    <nav
      className="pointer-events-auto fixed inset-x-2.5 bottom-[max(12px,env(safe-area-inset-bottom,12px))] z-48 mx-auto max-w-[440px] md:hidden"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around rounded-full border border-ink/8 bg-cream p-1 shadow-[0_16px_36px_-8px_rgb(74_68_53/0.16),0_4px_12px_rgb(74_68_53/0.06)]">
        {NAV_LINKS.filter(({ href }) => href !== "/letters").map(
          ({ href, label, icon: Icon }) => {
            const active = !accountActive && isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  target,
                  active
                    ? "text-sun-ink hover:text-sun-ink"
                    : "text-ink-muted hover:text-ink",
                )}
                aria-current={active ? "page" : undefined}
                aria-label={label}
              >
                <span
                  className={cn(
                    surface,
                    active ? "bg-sun" : "group-hover:bg-ink/4",
                  )}
                >
                  <Icon
                    size={24}
                    className="size-6"
                    weight={active ? "fill" : "bold"}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          },
        )}
        <Button
          variant="ghost"
          className={cn(
            target,
            accountActive
              ? "text-sun-ink hover:text-sun-ink"
              : "text-ink-muted hover:text-ink",
          )}
          onClick={onOpenAccount}
          aria-label={
            user ? `My account (${displayName})` : "Open account menu"
          }
          aria-haspopup="dialog"
          aria-current={accountRoute ? "page" : undefined}
          aria-expanded={accountOpen}
          aria-controls="mobile-account-menu"
        >
          <span
            className={cn(
              surface,
              accountActive ? "bg-sun" : "group-hover:bg-ink/4",
            )}
          >
            {loading ? (
              <span
                className="size-8 rounded-full bg-ink/8"
                aria-hidden="true"
              />
            ) : user && avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : user ? (
              <span
                className="grid size-8 place-items-center rounded-full bg-paper-soft text-[15px] font-semibold text-ink"
                aria-hidden="true"
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <UserCircleIcon
                size={24}
                className="size-6"
                weight={accountActive ? "fill" : "bold"}
                aria-hidden="true"
              />
            )}
            {hasBadge && (
              <span
                className={cn(
                  "absolute top-0.5 right-0.5 size-2.5 rounded-full border-2 bg-[#e53935]",
                  accountActive ? "border-sun" : "border-cream",
                )}
              >
                <span className="sr-only">New letters</span>
              </span>
            )}
          </span>
        </Button>
      </div>
    </nav>
  );
}
