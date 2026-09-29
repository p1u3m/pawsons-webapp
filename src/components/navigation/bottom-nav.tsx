"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="mobile-bottom-nav-inner">
        {NAV_LINKS.map((item) => {
          const isActive = pendingHref
            ? pendingHref === item.href
            : pathname.startsWith(item.href);
          const hasBadge =
            item.badgeKey === "letters" &&
            lettersBadge !== undefined &&
            lettersBadge !== false &&
            lettersBadge !== 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                setPendingHref(item.href);
                window.setTimeout(() => {
                  setPendingHref((current) =>
                    current === item.href ? null : current,
                  );
                }, 2000);
              }}
              className={`bottom-nav-item ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              <div className="bottom-nav-icon-wrap">
                <span
                  className="material-symbols-rounded bottom-nav-icon"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {hasBadge &&
                  (typeof lettersBadge === "boolean" ? (
                    <span
                      className="bottom-nav-badge-dot"
                      aria-label="แจ้งเตือนใหม่"
                    />
                  ) : (
                    <span
                      className="bottom-nav-badge-count"
                      aria-label={`${lettersBadge} จดหมายใหม่`}
                    >
                      {typeof lettersBadge === "number" && lettersBadge > 99
                        ? "99+"
                        : lettersBadge}
                    </span>
                  ))}
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
