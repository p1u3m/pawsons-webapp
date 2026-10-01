"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./nav-links";

interface BottomNavProps {
  /**
   * Optional badge on Letters tab.
   * Can be boolean (renders red/accent dot), or number/string (renders count pill).
   */
  lettersBadge?: number | boolean | string;
}

export default function BottomNav({ lettersBadge }: BottomNavProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => setPendingHref(null), [pathname]);

  return (
    <nav
      className="pointer-events-auto fixed inset-x-2.5 bottom-[max(12px,env(safe-area-inset-bottom,12px))] z-48 mx-auto max-w-[440px] md:hidden"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around rounded-full border border-ink/8 bg-cream p-1 shadow-[0_16px_36px_-8px_rgb(74_68_53/0.16),0_4px_12px_rgb(74_68_53/0.06)]">
        {NAV_LINKS.map(({ href, label, icon: Icon, badgeKey }) => {
          const isActive = pendingHref
            ? pendingHref === href
            : pathname.startsWith(href);
          const hasBadge =
            badgeKey === "letters" &&
            lettersBadge !== undefined &&
            lettersBadge !== false &&
            lettersBadge !== 0;
          const badgeRing = isActive ? "border-sun" : "border-cream";

          return (
            <Link
              key={href}
              href={href}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                setPendingHref(href);
                window.setTimeout(() => {
                  setPendingHref((current) =>
                    current === href ? null : current,
                  );
                }, 2000);
              }}
              className={cn(
                "group relative flex min-h-[52px] min-w-11 flex-1 flex-col items-center justify-center gap-[3px] rounded-full px-0.5 py-1 transition-[color,transform] duration-150 focus-visible:outline-offset-2 active:scale-95",
                isActive ? "text-sun-ink" : "text-ink-muted hover:text-ink",
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
            >
              <div
                className={cn(
                  "relative flex h-7 w-[50px] items-center justify-center rounded-full transition-[background-color,box-shadow,scale] duration-160 ease-spring",
                  isActive
                    ? "scale-[1.02] bg-sun shadow-[0_2px_8px_-1px_rgb(184_134_11/0.28)]"
                    : "group-hover:bg-ink/4",
                )}
              >
                <Icon
                  size={21}
                  aria-hidden="true"
                  className={cn(
                    "transition-transform duration-150 ease-spring",
                    isActive && "scale-105",
                  )}
                />
                {hasBadge &&
                  (typeof lettersBadge === "boolean" ? (
                    <span
                      className={`absolute top-px right-2.5 size-2 rounded-full border-[1.5px] bg-[#e53935] ${badgeRing}`}
                      aria-label="แจ้งเตือนใหม่"
                    />
                  ) : (
                    <span
                      className={`absolute -top-0.5 right-1.5 h-4 min-w-4 rounded-lg border-[1.5px] bg-[#e53935] px-1 text-center text-[9.5px] leading-4 font-bold text-white ${badgeRing}`}
                      aria-label={`${lettersBadge} จดหมายใหม่`}
                    >
                      {typeof lettersBadge === "number" && lettersBadge > 99
                        ? "99+"
                        : lettersBadge}
                    </span>
                  ))}
              </div>
              <span
                className={cn(
                  "text-[10.5px] leading-[1.1] tracking-[-0.2px] whitespace-nowrap transition-colors duration-150",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
