"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="เมนูผู้ดูแล">
      {[
        ["/admin", "Dashboard"],
        ["/admin/contents", "คลังเนื้อหา"],
      ].map(([href, label]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`admin-nav-item${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="admin-nav-dot" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
